"use client";

import * as React from "react";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { companies } from "@/data/dummy";
import LevelDonut from "@/components/dashboard/LevelDonut";
import CumulativeLine from "@/components/dashboard/CumulativeLine";
import KpiCard from "@/components/dashboard/KpiCard";

/* =======================
   formatting
   ======================= */

function format_compact_number(n: number) {
  const abs = Math.abs(n);

  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return String(Math.round(n));
}

/* =======================
   KPI helpers (dynamic)
   ======================= */

type kpi_kind = "company_count" | "employees" | "revenue" | "countries";
type delta_kind = "up" | "down" | "flat";

function calc_year_series(
  data: {
    joined_year: number;
    employees: number;
    annual_revenue: number;
    country: string;
  }[],
  start_year: number,
  end_year: number,
  kind: kpi_kind
) {
  // group "added" by year
  const added_by_year = new Map<number, typeof data>();
  for (let y = start_year; y <= end_year; y++) added_by_year.set(y, []);

  for (const c of data) {
    if (c.joined_year < start_year || c.joined_year > end_year) continue;
    added_by_year.get(c.joined_year)!.push(c);
  }

  // cumulative series to use as KPI sparkline (stable & meaningful)
  let cum_companies = 0;
  let cum_employees = 0;
  let cum_revenue = 0;
  const country_set = new Set<string>();

  const series: number[] = [];

  for (let y = start_year; y <= end_year; y++) {
    const added = added_by_year.get(y)!;

    for (const c of added) {
      cum_companies += 1;
      cum_employees += c.employees;
      cum_revenue += c.annual_revenue;
      country_set.add(c.country);
    }

    if (kind === "company_count") series.push(cum_companies);
    if (kind === "employees") series.push(cum_employees);
    if (kind === "revenue") series.push(cum_revenue);
    if (kind === "countries") series.push(country_set.size);
  }

  return series;
}

function calc_delta_from_series(series: number[]): { kind: delta_kind; label: string } {
  if (!series.length) return { kind: "flat", label: "0.0%" };

  const last = series[series.length - 1] ?? 0;
  const prev = series[series.length - 2] ?? last;

  if (prev === 0) return { kind: "flat", label: "0.0%" };

  const pct = ((last - prev) / prev) * 100;

  if (Math.abs(pct) < 0.0001) return { kind: "flat", label: "0.0%" };

  const kind: delta_kind = pct > 0 ? "up" : "down";
  const sign = pct > 0 ? "+" : "-";
  return { kind, label: `${sign}${Math.abs(pct).toFixed(1)}%` };
}

function spark_from_series(series: number[], points = 10) {
  // compress to fixed length for KpiCard small chart
  if (series.length <= points) return series.map((v) => Math.round(v));

  const step = (series.length - 1) / (points - 1);
  const out: number[] = [];

  for (let i = 0; i < points; i++) {
    const idx = Math.round(i * step);
    out.push(series[idx] ?? 0);
  }

  return out.map((v) => Math.round(v));
}

/* =======================
   main
   ======================= */

export default function Dashboard() {
  // headline KPI values (dynamic)
  const company_count = companies.length;
  const employees_sum = companies.reduce((acc, c) => acc + c.employees, 0);
  const revenue_sum = companies.reduce((acc, c) => acc + c.annual_revenue, 0);
  const countries_covered = new Set(companies.map((c) => c.country)).size;

  // align KPI series time window with your line chart
  const start_year = 2010;
  const end_year = 2024;

  const company_series = calc_year_series(companies, start_year, end_year, "company_count");
  const employees_series = calc_year_series(companies, start_year, end_year, "employees");
  const revenue_series = calc_year_series(companies, start_year, end_year, "revenue");
  const countries_series = calc_year_series(companies, start_year, end_year, "countries");

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={2.5}>
        {/* Top stats */}
        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard
              title="company count"
              value={String(company_count)}
              delta={calc_delta_from_series(company_series)}
              series={spark_from_series(company_series, 10)}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard
              title="employees"
              value={format_compact_number(employees_sum)}
              delta={calc_delta_from_series(employees_series)}
              series={spark_from_series(employees_series, 10)}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard
              title="total revenue"
              value={`$${format_compact_number(revenue_sum)}`}
              delta={calc_delta_from_series(revenue_series)}
              series={spark_from_series(revenue_series, 10)}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <KpiCard
              title="countries covered"
              value={String(countries_covered)}
              delta={calc_delta_from_series(countries_series)}
              series={spark_from_series(countries_series, 10)}
            />
          </Grid>
        </Grid>

        {/* Charts row */}
        <Grid container spacing={6} alignItems="stretch">
          {/* Left: donut */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                width: "100%",
                height: { xs: 620, md: 660 },
                borderRadius: 4,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  p: 2.5,
                }}
              >
                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        Current companies
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        by level (share of all companies)
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <LevelDonut companies={companies} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: line */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                width: "100%",
                height: { xs: 620, md: 660 },
                borderRadius: 4,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  p: 2.5,
                }}
              >
                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        Network growth
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        cumulative companies joined over years
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <CumulativeLine companies={companies} start_year={start_year} end_year={end_year} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
