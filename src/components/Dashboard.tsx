"use client";

import * as React from "react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { companies } from "@/data/dummy";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function format_compact_number(value: number, unit: "usd" | "count") {
  if (!Number.isFinite(value)) return "-";

  if (unit === "count") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}m`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}k`;
    return `${Math.round(value)}`;
  }

  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}b`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}m`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}k`;
  return `$${Math.round(value)}`;
}

type region = "americas" | "asia" | "europe" | "other";

function country_to_region(country: string): region {
  const c = (country || "").trim().toLowerCase();
  if (["usa", "united states", "canada", "mexico", "brazil", "argentina"].includes(c)) return "americas";
  if (["china", "japan", "korea", "singapore", "india", "vietnam", "thailand", "malaysia"].includes(c)) return "asia";
  if (["uk", "united kingdom", "france", "germany", "italy", "spain", "netherlands"].includes(c)) return "europe";
  return "other";
}

export default function Dashboard() {
  const kpis = React.useMemo(() => {
    const company_count = companies.length;

    const total_revenue = companies.reduce(
      (sum, item) => sum + (Number(item.annual_revenue) || 0),
      0
    );

    const countries_covered = new Set(
      companies.map((item) => (item.country ?? "").trim().toLowerCase()).filter(Boolean)
    ).size;

    const total_employees = companies.reduce(
      (sum, item) => sum + (Number(item.employees) || 0),
      0
    );

    return [
      { label: "company count", value: `${company_count}`, helper: "count(companies)" },
      { label: "employees", value: format_compact_number(total_employees, "count"), helper: "sum(employees)" },
      { label: "total revenue", value: format_compact_number(total_revenue, "usd"), helper: "sum(annual_revenue)" },
      { label: "countries covered", value: `${countries_covered}`, helper: "unique(country)" },
    ];
  }, []);

  // 左图：按 region（由 country mock）做 pie
  const region_counts = React.useMemo(() => {
    const m: Record<region, number> = { americas: 0, asia: 0, europe: 0, other: 0 };
    for (const c of companies) {
      m[country_to_region(String(c.country || ""))] += 1;
    }
    return m;
  }, []);

  const pie_data = React.useMemo(() => {
    return {
      labels: ["Americas", "Asia", "Europe", "Other"],
      datasets: [
        {
          label: "companies",
          data: [
            region_counts.americas,
            region_counts.asia,
            region_counts.europe,
            region_counts.other,
          ],
          // 明显区别于黑色：绿 / 蓝 / 黄 / 红
          backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
          borderColor: "rgba(255,255,255,0.18)",
          borderWidth: 2,
        },
      ],
    };
  }, [region_counts]);

  const pie_options = React.useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: { position: "bottom" as const, labels: { color: "rgba(229,231,235,0.9)" } },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const label = ctx.label ?? "";
              const value = Number(ctx.raw) || 0;
              const total = Object.values(region_counts).reduce((a, b) => a + b, 0);
              const pct = total === 0 ? 0 : (value / total) * 100;
              return `${label}: ${value} (${pct.toFixed(1)}%)`;
            },
          },
        },
      },
    };
  }, [region_counts]);

  // 右图：堆叠柱状图（模仿你给的 Area installed）
  // 用 founded_year 做 bucket（12 个桶） -> 生成三条堆叠系列
  const bar_series = React.useMemo(() => {
    const years = companies
      .map((c) => Number(c.founded_year))
      .filter((y) => Number.isFinite(y))
      .sort((a, b) => a - b);

    const min_y = years[0] ?? 2000;
    const max_y = years[years.length - 1] ?? 2024;

    const bucket_count = 12;
    const span = Math.max(1, max_y - min_y + 1);
    const step = Math.max(1, Math.floor(span / bucket_count));

    const labels: string[] = [];
    for (let i = 0; i < bucket_count; i++) {
      const start = min_y + i * step;
      labels.push(String(start));
    }

    const asia = new Array(bucket_count).fill(0);
    const europe = new Array(bucket_count).fill(0);
    const americas = new Array(bucket_count).fill(0);

    for (const c of companies) {
      const y = Number(c.founded_year);
      if (!Number.isFinite(y)) continue;

      const idx = Math.min(bucket_count - 1, Math.max(0, Math.floor((y - min_y) / step)));
      const r = country_to_region(String(c.country || ""));

      // 三条堆叠：Asia / Europe / Americas（Other 不显示，避免太杂）
      if (r === "asia") asia[idx] += 1;
      else if (r === "europe") europe[idx] += 1;
      else if (r === "americas") americas[idx] += 1;
    }

    return { labels, asia, europe, americas };
  }, []);

  const bar_data = React.useMemo(() => {
    return {
      labels: bar_series.labels,
      datasets: [
        {
          label: "Asia",
          data: bar_series.asia,
          backgroundColor: "#22d3ee", // 青
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Europe",
          data: bar_series.europe,
          backgroundColor: "#fbbf24", // 黄
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Americas",
          data: bar_series.americas,
          backgroundColor: "#38bdf8", // 蓝青
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [bar_series]);

  const bar_options = React.useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" as const, labels: { color: "rgba(229,231,235,0.9)" } },
        title: { display: false },
        tooltip: { mode: "index" as const, intersect: false },
      },
      interaction: { mode: "index" as const, intersect: false },
      scales: {
        x: {
          stacked: true,
          ticks: { color: "rgba(229,231,235,0.55)" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: { color: "rgba(229,231,235,0.55)" },
          grid: { color: "rgba(255,255,255,0.06)" },
        },
      },
    };
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Hi, Welcome back
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
        analytics · overview
      </Typography>

      {/* KPI row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card variant="outlined" sx={{ borderRadius: 999 }}>
              <CardContent sx={{ py: 2.2 }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 900 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {item.helper}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* two charts: exactly half / half */}
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%", borderRadius: 6 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Current visits
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                by region (mocked from company country)
              </Typography>

              <Box sx={{ height: 360 }}>
                <Pie data={pie_data} options={pie_options as any} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%", borderRadius: 6 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Area installed
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                mocked stacked bars (bucketed by founded_year)
              </Typography>

              <Box sx={{ height: 360 }}>
                <Bar data={bar_data} options={bar_options as any} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
