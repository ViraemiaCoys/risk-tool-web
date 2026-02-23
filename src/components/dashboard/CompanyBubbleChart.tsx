"use client";

import * as React from "react";
import * as d3 from "d3";
import { Box, Typography } from "@mui/material";
import type { company_row } from "@/data/dummy";

type bubble_node = {
  name: string;
  kind: "root" | "level1" | "level2" | "level3";
  company_code?: string;
  company?: company_row;
  children?: bubble_node[];
  value?: number; // 叶子节点大小
};

function hash_to_index(text: string, modulo: number) {
  // 稳定 hash 转索引
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return modulo <= 0 ? 0 : hash % modulo;
}

// 按 level 建供应链树：level1 作根，level2 挂 level1，level3 挂 level2。有真实 relationships 时换成按关系建树。
function build_supply_chain_hierarchy(filtered_companies: company_row[]): bubble_node {
  const level1_list = filtered_companies.filter((c) => c.level === 1);
  const level2_list = filtered_companies.filter((c) => c.level === 2);
  const level3_list = filtered_companies.filter((c) => c.level === 3);

  // 某一层空的话，随便拿几家公司当 level1
  const effective_level1 = level1_list.length ? level1_list : filtered_companies.slice(0, 6);

  // maps
  const level1_nodes: bubble_node[] = effective_level1.map((c) => ({
    name: c.company_name,
    kind: "level1",
    company_code: c.company_code,
    company: c,
    children: [],
  }));

  const level2_nodes: bubble_node[] = level2_list.map((c) => ({
    name: c.company_name,
    kind: "level2",
    company_code: c.company_code,
    company: c,
    children: [],
  }));

  const level3_nodes: bubble_node[] = level3_list.map((c) => ({
    name: c.company_name,
    kind: "level3",
    company_code: c.company_code,
    company: c,
    value: Math.max(1, Math.round(c.annual_revenue / 50_000_000)), // leaf size: revenue-based
  }));

  // attach level2 -> level1
  for (const l2 of level2_nodes) {
    const parent_idx = hash_to_index(l2.company_code ?? l2.name, level1_nodes.length);
    level1_nodes[parent_idx].children = level1_nodes[parent_idx].children ?? [];
    level1_nodes[parent_idx].children!.push(l2);
  }

  // level2 没东西就把 level3 直接挂 level1
  if (!level2_nodes.length) {
    for (const l3 of level3_nodes) {
      const parent_idx = hash_to_index(l3.company_code ?? l3.name, level1_nodes.length);
      level1_nodes[parent_idx].children = level1_nodes[parent_idx].children ?? [];
      level1_nodes[parent_idx].children!.push(l3);
    }
  } else {
    // level3 挂 level2
    for (const l3 of level3_nodes) {
      const parent_idx = hash_to_index(l3.company_code ?? l3.name, level2_nodes.length);
      level2_nodes[parent_idx].children = level2_nodes[parent_idx].children ?? [];
      level2_nodes[parent_idx].children!.push(l3);
    }
  }

  // 清掉空 children，不然 pack 会画一堆空圈
  function prune(node: bubble_node): bubble_node | null {
    if (node.children && node.children.length) {
      const next_children = node.children.map(prune).filter(Boolean) as bubble_node[];
      if (next_children.length === 0) {
        // 非叶子但 children 全空，当叶子处理
        return { ...node, children: undefined, value: 1 };
      }
      return { ...node, children: next_children };
    }
    return node;
  }

  return prune({
    name: "supply chain",
    kind: "root",
    children: level1_nodes.map(prune).filter(Boolean) as bubble_node[],
  })!;
}

function format_compact_number(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return String(Math.round(n));
}

export default function CompanyBubbleChart(props: {
  companies: company_row[];
  height?: number;
  enable_tooltip?: boolean;
}) {
  const { companies, height = 460, enable_tooltip = true } = props;

  const container_ref = React.useRef<HTMLDivElement | null>(null);
  const svg_ref = React.useRef<SVGSVGElement | null>(null);

  const [tooltip, set_tooltip] = React.useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    lines: string[];
  }>({ visible: false, x: 0, y: 0, title: "", lines: [] });

  const hierarchy_data = React.useMemo(() => build_supply_chain_hierarchy(companies), [companies]);

  React.useEffect(() => {
    const container = container_ref.current;
    const svg_el = svg_ref.current;
    if (!container || !svg_el) return;

    const svg = d3.select(svg_el);

    // 配色跟 BarChart 一致
    const stroke_color = "rgba(255,255,255,0.12)";
    const label_color = "rgba(255,255,255,0.85)";
    const sublabel_color = "rgba(255,255,255,0.65)";
    const fill_root = "rgba(255,255,255,0.02)";
    const fill_l1 = "rgba(64, 156, 255, 0.22)"; // blue-ish
    const fill_l2 = "rgba(255, 214, 0, 0.18)"; // yellow-ish
    const fill_l3 = "rgba(255, 82, 82, 0.18)"; // red-ish
    const fill_hover = "rgba(255,255,255,0.10)";

    // 按容器宽度算 viewBox，响应缩放
    const get_size = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width));
      const h = Math.max(320, Math.floor(height));
      return { width, height: h };
    };

    const { width, height: h } = get_size();

    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${h}`).attr("width", "100%").attr("height", "100%");

    const root = d3
      .hierarchy<bubble_node>(hierarchy_data)
      .sum((d) => d.value ?? (d.company ? Math.max(1, Math.round(d.company.annual_revenue / 80_000_000)) : 1))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<bubble_node>().size([width, h]).padding(4);
    pack(root);

    let focus = root;
    let view: [number, number, number] = [root.x, root.y, root.r * 2];

    const g = svg.append("g");

    // background
    g.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", h)
      .attr("fill", fill_root);

    const node = g
      .append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1)) // skip root circle
      .join("circle")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .attr("r", (d) => d.r)
      .attr("fill", (d) => {
        const kind = d.data.kind;
        if (kind === "level1") return fill_l1;
        if (kind === "level2") return fill_l2;
        return fill_l3;
      })
      .attr("stroke", stroke_color)
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        if (focus !== d) zoom(d);
      })
      .on("mousemove", (event, d) => {
        if (!enable_tooltip) return;
        const company = d.data.company;
        if (!company) return;

        const rect = container.getBoundingClientRect();
        set_tooltip({
          visible: true,
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top + 12,
          title: company.company_name,
          lines: [
            `level: ${company.level}`,
            `country/city: ${company.country} / ${company.city}`,
            `joined year: ${company.joined_year}`,
            `revenue: $${format_compact_number(company.annual_revenue)}`,
            `employees: ${format_compact_number(company.employees)}`,
          ],
        });
      })
      .on("mouseleave", () => {
        if (!enable_tooltip) return;
        set_tooltip((prev) => ({ ...prev, visible: false }));
      })
      .on("mouseenter", function () {
        d3.select(this).attr("fill", fill_hover);
      })
      .on("mouseout", function (event, d) {
        const kind = d.data.kind;
        d3.select(this).attr("fill", kind === "level1" ? fill_l1 : kind === "level2" ? fill_l2 : fill_l3);
      });

    const label = g
      .append("g")
      .style("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .style("font-weight", 900)
      .style("fill", label_color)
      .style("display", (d) => (d.parent === root ? "inline" : "none"))
      .text((d) => (d.data.kind === "root" ? "" : d.data.name.slice(0, 16)));

    const sublabel = g
      .append("g")
      .style("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .attr("transform", (d) => `translate(${d.x},${d.y + 18})`)
      .style("font-size", "11px")
      .style("font-weight", 700)
      .style("fill", sublabel_color)
      .style("display", (d) => (d.parent === root ? "inline" : "none"))
      .text((d) => {
        const c = d.data.company;
        if (!c) return "";
        return `${c.country} · ${c.city}`;
      });

    svg.on("click", () => zoom(root));

    function zoom_to(v: [number, number, number]) {
      const k = width / v[2];
      view = v;

      label.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      sublabel.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k + 18})`);

      node.attr(
        "transform",
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
      );
      node.attr("r", (d) => d.r * k);
    }

    function zoom(d: d3.HierarchyCircularNode<bubble_node>) {
      focus = d;

      const transition = svg
        .transition()
        .duration(650)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return (t) => zoom_to(i(t));
        });

      label
        .filter((n, i, nodes) => {
          const element = nodes[i] as SVGTextElement | undefined;
          return n.parent === focus || element?.style.display === "inline";
        })
        .transition(transition)
        .style("display", (n) => (n.parent === focus ? "inline" : "none"))
        .style("opacity", (n) => (n.parent === focus ? 1 : 0));

      sublabel
        .filter((n, i, nodes) => {
          const element = nodes[i] as SVGTextElement | undefined;
          return n.parent === focus || element?.style.display === "inline";
        })
        .transition(transition)
        .style("display", (n) => (n.parent === focus ? "inline" : "none"))
        .style("opacity", (n) => (n.parent === focus ? 1 : 0));
    }

    zoom_to(view);

    // 容器宽度变了就重绘
    const ro = new ResizeObserver(() => {
      // 强制 re-render 触发重绘
      set_tooltip((prev) => ({ ...prev, visible: false }));
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      svg.on("click", null);
    };
  }, [hierarchy_data, height, enable_tooltip]);

  return (
    <Box sx={{ position: "relative", width: "100%", height }}>
      <Box ref={container_ref} sx={{ width: "100%", height: "100%" }}>
        <svg ref={svg_ref} />
      </Box>

      {enable_tooltip && tooltip.visible && (
        <Box
          sx={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 10,
            pointerEvents: "none",
            px: 1.25,
            py: 1,
            borderRadius: 2,
            background: "rgba(10,10,10,0.82)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(10px)",
            maxWidth: 320,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
            {tooltip.title}
          </Typography>
          {tooltip.lines.map((line) => (
            <Typography key={line} variant="caption" sx={{ display: "block", opacity: 0.85 }}>
              {line}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
