"use client";

import * as React from "react";
import * as d3 from "d3";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";

import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

import type { company_row, company_relationship_row } from "@/data/dummy";
import { build_company_hierarchy } from "@/data/dummy";
import { companiesService } from "@/services/companies.service";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend);

type dimension_kind = "level" | "country" | "city";

type range_filter = {
  min?: number;
  max?: number;
};

type year_range_filter = {
  start?: number;
  end?: number;
};

export type company_bar_request = {
  dimension: dimension_kind;
  filter: {
    level: number[];
    country: string[];
    city: string[];
    joined_year: year_range_filter;
    annual_revenue: range_filter;
    employees: range_filter;
  };
};

const DEFAULT_REQUEST: company_bar_request = {
  dimension: "level",
  filter: {
    level: [],
    country: [],
    city: [],
    joined_year: { start: undefined, end: undefined },
    annual_revenue: { min: undefined, max: undefined },
    employees: { min: undefined, max: undefined },
  },
};

function uniq_sorted(values: string[]) {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parse_number_or_undefined(value: string) {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

function format_compact_number(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return String(Math.round(n));
}

function normalize_min_max(min_value: number | undefined, max_value: number | undefined) {
  if (min_value === undefined && max_value === undefined) return { min: undefined, max: undefined };
  if (min_value !== undefined && max_value !== undefined && min_value > max_value) {
    return { min: max_value, max: min_value };
  }
  return { min: min_value, max: max_value };
}

function apply_company_filters(companies: company_row[], request: company_bar_request) {
  const { filter } = request;

  return companies.filter((company) => {
    if (filter.level.length > 0 && !filter.level.includes(company.level)) return false;
    if (filter.country.length > 0 && !filter.country.includes(company.country)) return false;
    if (filter.city.length > 0 && !filter.city.includes(company.city)) return false;

    const joined_range = filter.joined_year ?? { start: undefined, end: undefined };
    if (joined_range.start !== undefined && company.joined_year < joined_range.start) return false;
    if (joined_range.end !== undefined && company.joined_year > joined_range.end) return false;

    if (filter.annual_revenue.min !== undefined && company.annual_revenue < filter.annual_revenue.min)
      return false;
    if (filter.annual_revenue.max !== undefined && company.annual_revenue > filter.annual_revenue.max)
      return false;

    if (filter.employees.min !== undefined && company.employees < filter.employees.min) return false;
    if (filter.employees.max !== undefined && company.employees > filter.employees.max) return false;

    return true;
  });
}

// bubble 图：d3 圆堆积
type bubble_node = {
  name: string;
  company_code?: string;
  country?: string;
  city?: string;
  level?: number;
  annual_revenue?: number;
  employees?: number;
  joined_year?: number;
  children?: bubble_node[];
};

function useResizeObserver<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [size, set_size] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      set_size({ width: Math.floor(cr.width), height: Math.floor(cr.height) });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

function BubbleCirclePacking(props: {
  companies: company_row[];
  relationships: company_relationship_row[];
  height: number;
}) {
  const { companies, relationships, height } = props;

  const { ref, size } = useResizeObserver<HTMLDivElement>();

  const svg_ref = React.useRef<SVGSVGElement | null>(null);

  // 简单 tooltip，没用 MUI 免得拖慢
  const tooltip_ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!svg_ref.current) return;
    if (!tooltip_ref.current) return;
    if (size.width <= 10 || height <= 10) return;

    const width = size.width;
    const svg_height = height;

    // 按关系建层级
    const tree = build_company_hierarchy(companies, relationships) as bubble_node;

    // d3 初始化
    const svg = d3.select(svg_ref.current);
    svg.selectAll("*").remove();

    svg
      .attr("viewBox", `0 0 ${width} ${svg_height}`)
      .attr("width", width)
      .attr("height", svg_height)
      .style("display", "block");

    const tooltip = d3.select(tooltip_ref.current);

    const format = d3.format(",");

    const root = d3
      .hierarchy<bubble_node>(tree)
      .sum((d) => {
        // 气泡大小用 employees，父节点由子节点累加
        return d.employees ? Math.sqrt(d.employees) : 0;
      })
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<bubble_node>().size([width, svg_height]).padding(10);

    pack(root);

    let focus = root;
    let view: [number, number, number] = [root.x, root.y, root.r * 2];

    const g = svg.append("g");

    const nodes = g
      .selectAll("circle")
      .data(root.descendants())
      .join("circle")
      .attr("display", (d) => (d.depth === 0 ? "none" : "block")) // root 不画
      .attr("fill", (d) =>
        d.children ? "rgba(53, 204, 204, 0.05)" : "rgba(255, 255, 255, 0.5)"
      )
      .attr("stroke", (d) =>
        d.children ? "rgba(255,255,255,0.22)" : "rgba(255, 255, 255, 0.22)"
      )
      .attr("stroke-width", (d) => (d.children ? 1 : 1))
      .on("mousemove", (event, d) => {
        // 叶子节点才展示详细 tooltip
        const data = d.data;
        if (!data.company_code) return;

        tooltip
          .style("opacity", 1)
          .style("left", `${event.offsetX + 14}px`)
          .style("top", `${event.offsetY + 14}px`)
          .html(
            `
            <div style="font-weight:800;margin-bottom:6px;">${data.name}</div>
            <div style="opacity:0.85;font-size:12px;">
              <div>code: ${data.company_code}</div>
              <div>level: ${data.level ?? "-"}</div>
              <div>geo: ${data.country ?? "-"} · ${data.city ?? "-"}</div>
              <div>employees: ${data.employees !== undefined ? format(data.employees) : "-"}</div>
              <div>revenue: ${data.annual_revenue !== undefined ? "$" + format(data.annual_revenue) : "-"}</div>
              <div>joined: ${data.joined_year ?? "-"}</div>
            </div>
          `
          );
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      })
      .on("click", (event, d) => {
        if (focus === d) return;

        event.stopPropagation();
        zoom(d);
      });

    const labels = g
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .attr("text-anchor", "middle")
      .style("font-weight", 800)
      .style("fill", "rgba(255,255,255,0.88)")
      .style("pointer-events", "none")
      .style("user-select", "none")
      .style("display", (d) => (d.parent === root ? "block" : "none"))
      .style("opacity", (d) => (d.parent === root ? 1 : 0))
      .text((d) => {
        const name = d.data.name ?? "";
        // 名字太长就截断
        return name.length > 16 ? `${name.slice(0, 16)}…` : name;
      });

    svg.on("click", () => zoom(root));

    function zoom_to(v: [number, number, number]) {
      const k = Math.min(width, svg_height) / v[2];
      view = v;

      labels.attr("transform", (d) => `translate(${(d.x - v[0]) * k+ width / 2},${(d.y - v[1]) * k+ svg_height / 2})`);
      nodes
        .attr("transform", (d) => `translate(${(d.x - v[0]) * k+ width / 2},${(d.y - v[1]) * k+ svg_height / 2})`)
        .attr("r", (d) => d.r * k);
    }

    const setTextDisplay = (target: EventTarget | null, display: "block" | "none") => {
      if (target instanceof SVGTextElement) {
        target.style.display = display;
      }
    };

    function zoom(d: typeof root) {
      focus = d;

      const zoomTransition = svg
        .transition()
        .duration(650)
        .ease(d3.easeCubicInOut)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2] as [number, number, number]);
          return (t) => zoom_to(i(t));
        });

      labels
        .filter((n, i, nodes) => {
          const element = nodes[i] as SVGTextElement | undefined;
          if (!element) {
            return false;
          }
          return n.parent === focus || element.style.display === "block";
        })
        .transition(zoomTransition)
        .style("fill-opacity", (n) => (n.parent === focus ? 1 : 0))
        .on("start", (event, n) => {
          if (n.parent === focus) {
            setTextDisplay(event.currentTarget, "block");
          }
        })
        .on("end", (event, n) => {
          if (n.parent !== focus) {
            setTextDisplay(event.currentTarget, "none");
          }
        });
    }

    // 初次适配
    zoom_to([root.x, root.y, root.r * 2]);

    return () => {
      svg.selectAll("*").remove();
    };
  }, [companies, relationships, size.width, height]);

  return (
    <Box
      ref={ref}
      sx={{
        position: "relative",
        height,
        width: "100%",
        borderRadius: 3,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <svg ref={svg_ref} />

      {/* tooltip */}
      <Box
        ref={tooltip_ref}
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: 10,
          background: "rgba(0,0,0,0.75)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 2,
          padding: "10px 12px",
          minWidth: 220,
          backdropFilter: "blur(10px)",
        }}
      />
    </Box>
  );
}

type chart_mode = "bar" | "bubble";

export default function CompanyBarChart() {
  const theme = useTheme();
  const is_sm_down = useMediaQuery(theme.breakpoints.down("sm"));
  const [companies, setCompanies] = React.useState<company_row[]>([]);
  const [request, set_request] = React.useState<company_bar_request>(() => DEFAULT_REQUEST);
  const [mode, set_mode] = React.useState<chart_mode>("bar");
  const [groupedData, setGroupedData] = React.useState<{ labels: string[]; counts: number[] } | null>(null);
  const [filterLoading, setFilterLoading] = React.useState(false);
  
  // 全部公司关系
  const [allRelationships, setAllRelationships] = React.useState<company_relationship_row[]>([]);

  // 选项搜索（国家/城市）
  const [option_search, set_option_search] = React.useState("");

  // 拉公司列表，算 bounds 和下拉选项
  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companiesService.getAll();
        setCompanies(data);
      } catch (err) {
        console.error('获取公司数据失败:', err);
      }
    };

    fetchCompanies();
  }, []);

  // 拉关系数据
  React.useEffect(() => {
    const fetchRelationships = async () => {
      try {
        const relationships = await companiesService.getRelationships();

        if (process.env.NODE_ENV === 'development') {
          console.log('[CompanyBarChart] 获取到的关系数据:', relationships);
          console.log('[CompanyBarChart] 关系数据数量:', relationships.length);
        }

        setAllRelationships(relationships);
      } catch (err) {
        console.error('获取公司关系数据失败:', err);
        setAllRelationships([]);
      }
    };

    fetchRelationships();
  }, []);

  // 用 ref 跟踪 request，省得依赖乱变
  const requestRef = React.useRef(request);
  const prevRequestKeyRef = React.useRef<string>('');
  
  // 拼 request 的 key，用来判断有没有变
  const levelKey = request.filter.level.sort().join(',');
  const countryKey = request.filter.country.sort().join(',');
  const cityKey = request.filter.city.sort().join(',');
  const joinedYearKey = `${request.filter.joined_year.start || ''}-${request.filter.joined_year.end || ''}`;
  const annualRevenueKey = `${request.filter.annual_revenue.min || ''}-${request.filter.annual_revenue.max || ''}`;
  const employeesKey = `${request.filter.employees.min || ''}-${request.filter.employees.max || ''}`;
  
  const currentRequestKey = React.useMemo(() => {
    return JSON.stringify({
      dimension: request.dimension,
      level: levelKey,
      country: countryKey,
      city: cityKey,
      joined_year: joinedYearKey,
      annual_revenue: annualRevenueKey,
      employees: employeesKey,
    });
  }, [request.dimension, levelKey, countryKey, cityKey, joinedYearKey, annualRevenueKey, employeesKey]);

  // 过滤条件变了就调 API
  React.useEffect(() => {
    // 判断 request 是否真变了（初始加载也放行）
    const isInitialLoad = prevRequestKeyRef.current === '';
    const hasChanged = currentRequestKey !== prevRequestKeyRef.current;
    
    if (!isInitialLoad && !hasChanged) {
      return;
    }
    
    prevRequestKeyRef.current = currentRequestKey;
    requestRef.current = request;
    
    const fetchFilteredData = async () => {
      try {
        setFilterLoading(true);
        
        // 调试
        if (process.env.NODE_ENV === 'development') {
          console.log('[CompanyBarChart] 发送过滤请求:', JSON.stringify(requestRef.current, null, 2));
        }
        
        const result = await companiesService.getFilteredCompanies(requestRef.current);
        
        // 调试
        if (process.env.NODE_ENV === 'development') {
          console.log('[CompanyBarChart] 接收到的过滤数据:', result);
          console.log('[CompanyBarChart] labels:', result?.labels, '类型:', Array.isArray(result?.labels));
          console.log('[CompanyBarChart] counts:', result?.counts, '类型:', Array.isArray(result?.counts));
          console.log('[CompanyBarChart] labels 长度:', result?.labels?.length);
          console.log('[CompanyBarChart] counts 长度:', result?.counts?.length);
          console.log('[CompanyBarChart] labels 内容:', result?.labels);
          console.log('[CompanyBarChart] counts 内容:', result?.counts);
        }
        
        // 格式校验
        if (!result || !result.labels || !Array.isArray(result.labels) || !result.counts || !Array.isArray(result.counts)) {
          console.error('[CompanyBarChart] 数据格式不正确:', result);
          setGroupedData(null);
          return;
        }
        
        // 空数据也接受
        if (result.labels.length === 0 || result.counts.length === 0) {
          console.warn('[CompanyBarChart] 接收到空数据:', result);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[CompanyBarChart] 数据 OK，设置 groupedData');
          }
        }
        
        setGroupedData(result);
      } catch (err) {
        console.error('[CompanyBarChart] 获取过滤数据失败:', err);
        setGroupedData(null);
      } finally {
        setFilterLoading(false);
      }
    };

    // 不等 companies 拉完，直接请求
    fetchFilteredData();
  }, [currentRequestKey, request]);

  // Fast Refresh 后兼容旧 state：founded_year -> joined_year
  React.useEffect(() => {
    type LegacyFilter = company_bar_request["filter"] & {
      founded_year?: { start?: number; end?: number };
    };

    set_request((prev) => {
      const prev_filter = (prev.filter as LegacyFilter | undefined) ?? DEFAULT_REQUEST.filter;
      const joined_year =
        prev_filter.joined_year ?? prev_filter.founded_year ?? DEFAULT_REQUEST.filter.joined_year;

      return {
        ...DEFAULT_REQUEST,
        ...prev,
        filter: {
          ...DEFAULT_REQUEST.filter,
          ...prev.filter,
          joined_year,
        },
      };
    });
  }, []);

  // 滑块范围，从数据算
  const bounds = React.useMemo(() => {
    if (companies.length === 0) {
      return {
        joined: { min: 2010, max: 2024 },
        revenue: { min: 0, max: 1000000000 },
        employees: { min: 0, max: 10000 },
      };
    }

    const joined_years = companies.map((c) => c.joined_year);
    const revenues = companies.map((c) => c.annual_revenue);
    const employees = companies.map((c) => c.employees);

    return {
      joined: { min: Math.min(...joined_years), max: Math.max(...joined_years) },
      revenue: { min: Math.min(...revenues), max: Math.max(...revenues) },
      employees: { min: Math.min(...employees), max: Math.max(...employees) },
    };
  }, [companies]);

  // 下拉选项
  const country_options_all = React.useMemo(
    () => uniq_sorted(companies.map((c) => c.country)),
    [companies]
  );

  const city_options_all = React.useMemo(() => {
    const scoped = request.filter.country.length
      ? companies.filter((company) => request.filter.country.includes(company.country))
      : companies;
    return uniq_sorted(scoped.map((company) => company.city));
  }, [companies, request.filter.country]);

  // 按 option_search 筛选项
  const country_options = React.useMemo(() => {
    const keyword = option_search.trim().toLowerCase();
    if (!keyword) return country_options_all;
    return country_options_all.filter((c) => c.toLowerCase().includes(keyword));
  }, [country_options_all, option_search]);

  const city_options = React.useMemo(() => {
    const keyword = option_search.trim().toLowerCase();
    if (!keyword) return city_options_all;
    return city_options_all.filter((c) => c.toLowerCase().includes(keyword));
  }, [city_options_all, option_search]);

  const level_options = [1, 2, 3];

  // bubble 图要用 filtered_companies，这里沿用本地过滤逻辑（bar 图数据来自 API）
  const filtered_companies = React.useMemo(
    () => apply_company_filters(companies, request),
    [companies, request]
  );

  // 滑块取值，没设就用 bounds
  const joined_year_slider_value: [number, number] = React.useMemo(() => {
    const joined = request.filter.joined_year ?? {};
    const start = joined.start ?? bounds.joined.min;
    const end = joined.end ?? bounds.joined.max;

    return [
      clamp(start, bounds.joined.min, bounds.joined.max),
      clamp(end, bounds.joined.min, bounds.joined.max),
    ];
  }, [request.filter.joined_year, bounds.joined.min, bounds.joined.max]);

  const revenue_slider_value: [number, number] = React.useMemo(() => {
    const min = request.filter.annual_revenue.min ?? bounds.revenue.min;
    const max = request.filter.annual_revenue.max ?? bounds.revenue.max;
    return [
      clamp(min, bounds.revenue.min, bounds.revenue.max),
      clamp(max, bounds.revenue.min, bounds.revenue.max),
    ];
  }, [
    request.filter.annual_revenue.min,
    request.filter.annual_revenue.max,
    bounds.revenue.min,
    bounds.revenue.max,
  ]);

  const employees_slider_value: [number, number] = React.useMemo(() => {
    const min = request.filter.employees.min ?? bounds.employees.min;
    const max = request.filter.employees.max ?? bounds.employees.max;
    return [
      clamp(min, bounds.employees.min, bounds.employees.max),
      clamp(max, bounds.employees.min, bounds.employees.max),
    ];
  }, [
    request.filter.employees.min,
    request.filter.employees.max,
    bounds.employees.min,
    bounds.employees.max,
  ]);

  // 图表配色
  const grid_color = "rgba(255,255,255,0.08)";
  const tick_color = "rgba(255,255,255,0.75)";

  const chart_data: ChartData<"bar", number[], string> = React.useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CompanyBarChart] chart_data useMemo - groupedData:', groupedData);
    }
    
    if (!groupedData || !groupedData.labels || !Array.isArray(groupedData.labels) || !groupedData.counts || !Array.isArray(groupedData.counts)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CompanyBarChart] chart_data - 数据无效，返回空数据');
      }
      return {
        labels: [],
        datasets: [{ label: "company count", data: [], backgroundColor: [], borderColor: [] }],
      };
    }

    const labels = groupedData.labels;
    const values = groupedData.counts;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[CompanyBarChart] chart_data - labels:', labels, 'values:', values);
    }

    const bg_colors =
      request.dimension === "level"
        ? labels.map((label) => {
            if (label.includes("1")) return "rgba(255, 82, 82, 0.88)";
            if (label.includes("2")) return "rgba(255, 214, 0, 0.88)";
            return "rgba(64, 156, 255, 0.88)";
          })
        : labels.map(() => "rgba(0, 229, 255, 0.75)");

    const border_colors =
      request.dimension === "level"
        ? labels.map((label) => {
            if (label.includes("1")) return "rgba(255, 82, 82, 1)";
            if (label.includes("2")) return "rgba(255, 214, 0, 1)";
            return "rgba(64, 156, 255, 1)";
          })
        : labels.map(() => "rgba(0, 229, 255, 0.95)");

    return {
      labels,
      datasets: [
        {
          label: "company count",
          data: values,
          backgroundColor: bg_colors,
          borderColor: border_colors,
          borderWidth: 1,
          borderRadius: 10,
          hoverBorderColor: "rgba(255,255,255,0.65)",
          hoverBorderWidth: 1,
          categoryPercentage: 0.58,
          barPercentage: 0.58,
          maxBarThickness: 22,
        },
      ],
    };
  }, [groupedData, request.dimension]);

  const chart_height = is_sm_down ? 360 : 460;
  const bubble_height = is_sm_down ? 400 : 520;

  const chart_options: ChartOptions<"bar"> = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: !is_sm_down },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.parsed.y ?? 0} companies`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: tick_color,
            maxRotation: is_sm_down ? 45 : 0,
            minRotation: is_sm_down ? 30 : 0,
            maxTicksLimit: is_sm_down ? 4 : 8,
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: tick_color },
          grid: { color: grid_color },
        },
      },
    }),
    [grid_color, tick_color, is_sm_down]
  );

  function reset_filters() {
    set_request(DEFAULT_REQUEST);
    set_option_search("");
  }

  // bubble 也用同一套过滤；父节点缺失时挂到 root
  const filtered_relationships: company_relationship_row[] = React.useMemo(() => {
    if (!filtered_companies || filtered_companies.length === 0) {
      return [];
    }
    
    // 过滤后的公司 code
    const filteredCompanyCodes = new Set(filtered_companies.map(c => c.company_code));
    
    // 只保留两端都在结果里的关系
    const filtered = allRelationships.filter(rel => {
      const hasChild = filteredCompanyCodes.has(rel.company_code);
      const hasParent = filteredCompanyCodes.has(rel.parent_company);
      return hasChild && hasParent;
    });
    
    // 调试
    if (process.env.NODE_ENV === 'development') {
      console.log('[CompanyBarChart] 过滤后的关系数据:', filtered);
      console.log('[CompanyBarChart] 过滤后的关系数量:', filtered.length);
      console.log('[CompanyBarChart] 过滤后的公司数量:', filtered_companies.length);
    }
    
    return filtered;
  }, [filtered_companies, allRelationships]);

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: 4,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Company distribution
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            dynamic bar chart + bubble (circle packing) with shared multi-filters
          </Typography>
        </Box>

        <Grid container spacing={2.5} sx={{ minWidth: 0 }}>
          {/* left: chart */}
          <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
            {/* tabs switch */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Tabs
                value={mode}
                onChange={(_, v) => set_mode(v)}
                textColor="inherit"
                indicatorColor="primary"
                sx={{
                  minHeight: 36,
                  "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 900 },
                }}
              >
                <Tab value="bar" label="bar chart" />
                <Tab value="bubble" label="bubble (circle packing)" />
              </Tabs>

              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                {filterLoading ? "加载中..." : (groupedData?.counts && Array.isArray(groupedData.counts)) ? `${groupedData.counts.reduce((a, b) => a + b, 0)} companies` : "暂无数据"}
              </Typography>
            </Box>

            <Box sx={{ height: chart_height, minWidth: 0 }}>
              {mode === "bar" ? (
                (groupedData && groupedData.labels && groupedData.labels.length > 0) ? (
                  <Bar data={chart_data} options={chart_options} />
                ) : (
                  <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      {filterLoading ? "加载中..." : "暂无数据"}
                    </Typography>
                  </Box>
                )
              ) : (
                <BubbleCirclePacking
                  companies={filtered_companies}
                  relationships={filtered_relationships}
                  height={bubble_height}
                />
              )}
            </Box>

            {mode === "bar" && (
              <Box sx={{ mt: 1.5, opacity: 0.75 }}>
                <Typography variant="caption">
                  {filterLoading ? "加载中..." : (groupedData?.counts && Array.isArray(groupedData.counts)) ? `Current result: ${groupedData.counts.reduce((a, b) => a + b, 0)} companies after filters` : "暂无数据"}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* right: filters */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
            <Stack spacing={1.5}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1.5,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Filters
                </Typography>

                <Button size="small" onClick={reset_filters} sx={{ fontWeight: 800 }}>
                  reset
                </Button>
              </Box>

              <TextField
                size="small"
                label="search options (country/city)"
                value={option_search}
                onChange={(event) => set_option_search(event.target.value)}
              />

              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

              <FormControl fullWidth size="small">
                <InputLabel>dimension</InputLabel>
                <Select
                  label="dimension"
                  value={request.dimension}
                  onChange={(event) =>
                    set_request((prev) => ({
                      ...prev,
                      dimension: event.target.value as dimension_kind,
                    }))
                  }
                >
                  <MenuItem value="level">level</MenuItem>
                  <MenuItem value="country">country</MenuItem>
                  <MenuItem value="city">city</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                multiple
                options={level_options}
                value={request.filter.level}
                getOptionLabel={(option) => `level ${option}`}
                isOptionEqualToValue={(option, value) => option === value}
                onChange={(_, value) =>
                  set_request((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, level: value },
                  }))
                }
                renderInput={(params) => <TextField {...params} size="small" label="level (multi)" />}
              />

              <Autocomplete
                multiple
                options={country_options}
                value={request.filter.country}
                onChange={(_, value) =>
                  set_request((prev) => ({
                    ...prev,
                    filter: {
                      ...prev.filter,
                      country: value,
                      city: [],
                    },
                  }))
                }
                renderInput={(params) => <TextField {...params} size="small" label="country (multi)" />}
              />

              <Autocomplete
                multiple
                options={city_options}
                value={request.filter.city}
                onChange={(_, value) =>
                  set_request((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, city: value },
                  }))
                }
                renderInput={(params) => <TextField {...params} size="small" label="city (multi)" />}
              />

              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 800, opacity: 0.9 }}>
                joined year (range)
              </Typography>

              <Box sx={{ px: 1 }}>
                <Slider
                  value={joined_year_slider_value}
                  min={bounds.joined.min}
                  max={bounds.joined.max}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, value) => {
                    const [start, end] = value as number[];
                    set_request((prev) => ({
                      ...prev,
                      filter: {
                        ...prev.filter,
                        joined_year: { start, end },
                      },
                    }));
                  }}
                />
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    label="start"
                    value={request.filter.joined_year.start ?? ""}
                    onChange={(event) => {
                      const start = parse_number_or_undefined(event.target.value);
                      set_request((prev) => {
                        const normalized = normalize_min_max(start, prev.filter.joined_year.end);

                        const next_start =
                          normalized.min === undefined
                            ? undefined
                            : clamp(normalized.min, bounds.joined.min, bounds.joined.max);

                        const next_end =
                          normalized.max === undefined
                            ? prev.filter.joined_year.end
                            : clamp(normalized.max, bounds.joined.min, bounds.joined.max);

                        return {
                          ...prev,
                          filter: {
                            ...prev.filter,
                            joined_year: { start: next_start, end: next_end },
                          },
                        };
                      });
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    label="end"
                    value={request.filter.joined_year.end ?? ""}
                    onChange={(event) => {
                      const end = parse_number_or_undefined(event.target.value);
                      set_request((prev) => {
                        const normalized = normalize_min_max(prev.filter.joined_year.start, end);

                        const next_start =
                          normalized.min === undefined
                            ? prev.filter.joined_year.start
                            : clamp(normalized.min, bounds.joined.min, bounds.joined.max);

                        const next_end =
                          normalized.max === undefined
                            ? undefined
                            : clamp(normalized.max, bounds.joined.min, bounds.joined.max);

                        return {
                          ...prev,
                          filter: {
                            ...prev.filter,
                            joined_year: { start: next_start, end: next_end },
                          },
                        };
                      });
                    }}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, opacity: 0.9 }}>
                annual revenue (range)
              </Typography>

              <Box sx={{ px: 1 }}>
                <Slider
                  value={revenue_slider_value}
                  min={bounds.revenue.min}
                  max={bounds.revenue.max}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `$${format_compact_number(v)}`}
                  onChange={(_, value) => {
                    const [min, max] = value as number[];
                    set_request((prev) => ({
                      ...prev,
                      filter: {
                        ...prev.filter,
                        annual_revenue: { min, max },
                      },
                    }));
                  }}
                />
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    label="min"
                    value={request.filter.annual_revenue.min ?? ""}
                    onChange={(event) => {
                      const min = parse_number_or_undefined(event.target.value);
                      set_request((prev) => {
                        const normalized = normalize_min_max(min, prev.filter.annual_revenue.max);

                        const next_min =
                          normalized.min === undefined
                            ? undefined
                            : clamp(normalized.min, bounds.revenue.min, bounds.revenue.max);

                        const next_max =
                          normalized.max === undefined
                            ? prev.filter.annual_revenue.max
                            : clamp(normalized.max, bounds.revenue.min, bounds.revenue.max);

                        return {
                          ...prev,
                          filter: {
                            ...prev.filter,
                            annual_revenue: { min: next_min, max: next_max },
                          },
                        };
                      });
                    }}
                    helperText="USD"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    label="max"
                    value={request.filter.annual_revenue.max ?? ""}
                    onChange={(event) => {
                      const max = parse_number_or_undefined(event.target.value);
                      set_request((prev) => {
                        const normalized = normalize_min_max(prev.filter.annual_revenue.min, max);

                        const next_min =
                          normalized.min === undefined
                            ? prev.filter.annual_revenue.min
                            : clamp(normalized.min, bounds.revenue.min, bounds.revenue.max);

                        const next_max =
                          normalized.max === undefined
                            ? undefined
                            : clamp(normalized.max, bounds.revenue.min, bounds.revenue.max);

                        return {
                          ...prev,
                          filter: {
                            ...prev.filter,
                            annual_revenue: { min: next_min, max: next_max },
                          },
                        };
                      });
                    }}
                    helperText="USD"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, opacity: 0.9 }}>
                employees (range)
              </Typography>

              <Box sx={{ px: 1 }}>
                <Slider
                  value={employees_slider_value}
                  min={bounds.employees.min}
                  max={bounds.employees.max}
                  valueLabelDisplay="auto"
                  onChange={(_, value) => {
                    const [min, max] = value as number[];
                    set_request((prev) => ({
                      ...prev,
                      filter: {
                        ...prev.filter,
                        employees: { min, max },
                      },
                    }));
                  }}
                />
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    label="min"
                    value={request.filter.employees.min ?? ""}
                    onChange={(event) => {
                      const min = parse_number_or_undefined(event.target.value);
                      set_request((prev) => {
                        const normalized = normalize_min_max(min, prev.filter.employees.max);

                        const next_min =
                          normalized.min === undefined
                            ? undefined
                            : clamp(normalized.min, bounds.employees.min, bounds.employees.max);

                        const next_max =
                          normalized.max === undefined
                            ? prev.filter.employees.max
                            : clamp(normalized.max, bounds.employees.min, bounds.employees.max);

                        return {
                          ...prev,
                          filter: {
                            ...prev.filter,
                            employees: { min: next_min, max: next_max },
                          },
                        };
                      });
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    size="small"
                    label="max"
                    value={request.filter.employees.max ?? ""}
                    onChange={(event) => {
                      const max = parse_number_or_undefined(event.target.value);
                      set_request((prev) => {
                        const normalized = normalize_min_max(prev.filter.employees.min, max);

                        const next_min =
                          normalized.min === undefined
                            ? prev.filter.employees.min
                            : clamp(normalized.min, bounds.employees.min, bounds.employees.max);

                        const next_max =
                          normalized.max === undefined
                            ? undefined
                            : clamp(normalized.max, bounds.employees.min, bounds.employees.max);

                        return {
                          ...prev,
                          filter: {
                            ...prev.filter,
                            employees: { min: next_min, max: next_max },
                          },
                        };
                      });
                    }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
