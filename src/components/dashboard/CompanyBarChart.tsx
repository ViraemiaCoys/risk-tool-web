"use client";

import * as React from "react";
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
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import type { company_row } from "@/data/dummy";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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
    joined_year: year_range_filter; // ✅ 加入供应链年份（2010..）
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

    // ✅ joined_year range (加入供应链年份)
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

export default function CompanyBarChart(props: { companies: company_row[] }) {
  const { companies } = props;

  const [request, set_request] = React.useState<company_bar_request>(() => DEFAULT_REQUEST);

  // top search keyword to filter option lists (country/city)
  const [option_search, set_option_search] = React.useState("");

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
  const country_options_all = React.useMemo(() => uniq_sorted(companies.map((c) => c.country)), [companies]);

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
    const start = request.filter.joined_year.start ?? bounds.joined.min;
    const end = request.filter.joined_year.end ?? bounds.joined.max;
    return [
      clamp(start, bounds.joined.min, bounds.joined.max),
      clamp(end, bounds.joined.min, bounds.joined.max),
    ];
  }, [
    request.filter.joined_year.start,
    request.filter.joined_year.end,
    bounds.joined.min,
    bounds.joined.max,
  ]);

  const revenue_slider_value: [number, number] = React.useMemo(() => {
    const min = request.filter.annual_revenue.min ?? bounds.revenue.min;
    const max = request.filter.annual_revenue.max ?? bounds.revenue.max;
    return [clamp(min, bounds.revenue.min, bounds.revenue.max), clamp(max, bounds.revenue.min, bounds.revenue.max)];
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

    // ✅ dimension=level 时：红黄蓝；其他维度统一高亮色（黑底清晰）
    const bg_colors =
      request.dimension === "level"
        ? labels.map((label) => {
            if (label.includes("1")) return "rgba(255, 82, 82, 0.88)"; // red
            if (label.includes("2")) return "rgba(255, 214, 0, 0.88)"; // yellow
            return "rgba(64, 156, 255, 0.88)"; // blue
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

          // ✅ 柱子更细（自适应 + 限制最大厚度）
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
            dynamic bar chart with dimension + multi-filters (Y = company count)
          </Typography>
        </Box>

        <Grid container spacing={2.5} sx={{ minWidth: 0 }}>
          {/* left: chart */}
          <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
            <Box sx={{ height: { xs: 420, md: 460 }, minWidth: 0 }}>
              <Bar data={chart_data} options={chart_options} />
            </Box>

            <Box sx={{ mt: 1.5, opacity: 0.75 }}>
              <Typography variant="caption">
                Current result: {filtered_companies.length} companies after filters
              </Typography>
            </Box>
          </Grid>

          {/* right: filters */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
            <Stack spacing={1.5}>
              {/* header: reset + search */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
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

              {/* dimension (single select) */}
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

              {/* level multi-select */}
              <Autocomplete
                multiple
                options={level_options}
                value={request.filter.level}
                onChange={(_, value) =>
                  set_request((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, level: value },
                  }))
                }
                renderInput={(params) => <TextField {...params} size="small" label="level (multi)" />}
              />

              {/* country multi-select (with search) */}
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
                      city: [], // country changed => clear city to avoid illegal residuals
                    },
                  }))
                }
                renderInput={(params) => <TextField {...params} size="small" label="country (multi)" />}
              />

              {/* city multi-select (with search) */}
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

              {/* joined year range: slider + inputs */}
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

              {/* annual revenue range: slider + inputs */}
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

              {/* employees range: slider + inputs */}
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

              {/* request preview */}
              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, opacity: 0.9 }}>
                request preview
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.25,
                  borderRadius: 2,
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "auto",
                  fontSize: 12,
                  lineHeight: 1.35,
                }}
              >
                {JSON.stringify(request, null, 2)}
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
