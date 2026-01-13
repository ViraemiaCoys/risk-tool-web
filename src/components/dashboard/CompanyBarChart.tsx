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
import Grid from "@mui/material/Grid";

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
import { company_relationships, build_company_hierarchy } from "@/data/dummy";

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

function group_company_counts(filtered_companies: company_row[], dimension: dimension_kind) {
  const counts = new Map<string, number>();

  for (const company of filtered_companies) {
    const key =
      dimension === "level"
        ? `level ${company.level}`
        : dimension === "country"
          ? company.country
          : company.city;

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count);
}

/** =========================
 * bubble (d3 circle packing)
 * ========================= */
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

function use_resize_observer<T extends HTMLElement>() {
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

  const { ref, size } = use_resize_observer<HTMLDivElement>();

  const svg_ref = React.useRef<SVGSVGElement | null>(null);

  // tooltip (simple, MUI-free to keep it fast)
  const tooltip_ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!svg_ref.current) return;
    if (!tooltip_ref.current) return;
    if (size.width <= 10 || height <= 10) return;

    const width = size.width;
    const svg_height = height;

    // build hierarchy data from relationships (already aligned with your example)
    const tree = build_company_hierarchy(companies, relationships) as bubble_node;

    // d3 setup
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
        // 你可以用 revenue / employees 来决定气泡大小；这里先用 employees 更直观
        // 没有 employees 的节点（父节点）会由子节点累加
        return d.employees ? Math.sqrt(d.employees) : 0;
      })
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<bubble_node>().size([width, svg_height]).padding(10);

    pack(root);

    let focus = root;
    let view: [number, number, number] = [root.x, root.y, root.r * 2];

    const g = svg.append("g");

    const color = d3.scaleLinear<string>().domain([0, 3]).range(["rgba(0,229,255,0.25)", "rgba(0,229,255,0.85)"]);

    const nodes = g
      .selectAll("circle")
      .data(root.descendants())
      .join("circle")
      .attr("display", (d) => (d.depth === 0 ? "none" : "block")) // ✅ root 不画
      .attr("fill", (d) =>
        d.children ? "rgba(53, 204, 204, 0.05)" : "rgba(255, 255, 255, 0.5)"
      )
      .attr("stroke", (d) =>
        d.children ? "rgba(255,255,255,0.22)" : "rgba(255, 255, 255, 0.22)"
      )
      .attr("stroke-width", (d) => (d.children ? 1 : 1))
      .on("mousemove", (event, d) => {
        // optional tooltip：只对叶子节点展示详细信息
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
        // 防止太长顶出圈
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

    function zoom(d: typeof root) {
      focus = d;

      const transition = svg
        .transition()
        .duration(650)
        .ease(d3.easeCubicInOut)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2] as [number, number, number]);
          return (t) => zoom_to(i(t));
        });

      labels
        .filter(function (this: SVGTextElement, n) {
          return n.parent === focus || (this.style.display === "block" as any);
        })
        .transition(transition as any)
        .style("fill-opacity", (n) => (n.parent === focus ? 1 : 0))
        .on("start", function (this: SVGTextElement, n) {
          if (n.parent === focus) this.style.display = "block";
        })
        .on("end", function (this: SVGTextElement, n) {
          if (n.parent !== focus) this.style.display = "none";
        });
    }

    // initial fit
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

export default function CompanyBarChart(props: { companies: company_row[] }) {
  const { companies } = props;

  const [request, set_request] = React.useState<company_bar_request>(() => DEFAULT_REQUEST);
  const [mode, set_mode] = React.useState<chart_mode>("bar");

  // top search keyword to filter option lists (country/city)
  const [option_search, set_option_search] = React.useState("");

  // ✅ migrate old state shape after Fast Refresh (founded_year -> joined_year)
  React.useEffect(() => {
    set_request((prev) => {
      const prev_any: any = prev as any;
      const prev_filter: any = prev_any?.filter ?? {};

      const joined_year =
        prev_filter.joined_year ??
        prev_filter.founded_year ?? // legacy
        DEFAULT_REQUEST.filter.joined_year;

      return {
        ...DEFAULT_REQUEST,
        ...prev_any,
        filter: {
          ...DEFAULT_REQUEST.filter,
          ...prev_filter,
          joined_year,
        },
      } as company_bar_request;
    });
  }, []);

  // bounds from data (for sliders)
  const bounds = React.useMemo(() => {
    const joined_years = companies.map((c) => c.joined_year);
    const revenues = companies.map((c) => c.annual_revenue);
    const employees = companies.map((c) => c.employees);

    return {
      joined: { min: Math.min(...joined_years), max: Math.max(...joined_years) },
      revenue: { min: Math.min(...revenues), max: Math.max(...revenues) },
      employees: { min: Math.min(...employees), max: Math.max(...employees) },
    };
  }, [companies]);

  // options
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

  // apply option_search to option lists
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

  const filtered_companies = React.useMemo(
    () => apply_company_filters(companies, request),
    [companies, request]
  );

  const grouped = React.useMemo(
    () => group_company_counts(filtered_companies, request.dimension),
    [filtered_companies, request.dimension]
  );

  // slider derived values (fallback to bounds when unset)
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

  // chart colors
  const grid_color = "rgba(255,255,255,0.08)";
  const tick_color = "rgba(255,255,255,0.75)";

  const chart_data: ChartData<"bar", number[], string> = React.useMemo(() => {
    const labels = grouped.map((row) => row.label);
    const values = grouped.map((row) => row.count);

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
  }, [grouped, request.dimension]);

  const chart_options: ChartOptions<"bar"> = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => ` ${context.parsed.y ?? 0} companies`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: tick_color },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { color: tick_color },
          grid: { color: grid_color },
        },
      },
    }),
    []
  );

  function reset_filters() {
    set_request(DEFAULT_REQUEST);
    set_option_search("");
  }

  // bubble chart uses shared filters too:
  // 为了演示更合理：bubble 只显示过滤后的公司；缺失父节点时，会挂到 root（dummy builder 里处理）
  const filtered_relationships = React.useMemo(() => {
    const set = new Set(filtered_companies.map((c) => c.company_code));
    return company_relationships.filter((r) => set.has(r.company_code));
  }, [filtered_companies]);

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
      <CardContent sx={{ p: 2.5 }}>
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
                current: {filtered_companies.length} companies after filters
              </Typography>
            </Box>

            <Box sx={{ height: { xs: 420, md: 460 }, minWidth: 0 }}>
              {mode === "bar" ? (
                <Bar data={chart_data} options={chart_options} />
              ) : (
                <BubbleCirclePacking
                  companies={filtered_companies}
                  relationships={filtered_relationships}
                  height={460}
                />
              )}
            </Box>

            {mode === "bar" && (
              <Box sx={{ mt: 1.5, opacity: 0.75 }}>
                <Typography variant="caption">
                  Current result: {filtered_companies.length} companies after filters
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
