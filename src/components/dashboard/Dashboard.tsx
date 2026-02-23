"use client";

import * as React from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid"; // v6 Grid
import LevelDonut from "@/components/dashboard/LevelDonut";
import CumulativeLine from "@/components/dashboard/CumulativeLine";
import KpiCard from "@/components/dashboard/KpiCard";
import CompanyBarChart from "@/components/dashboard/CompanyBarChart";
import { companiesService } from "@/services/companies.service";


function format_compact_number(n: number | null | undefined): string {
  // 空值、NaN 直接返回 0
  if (n == null || isNaN(n) || !isFinite(n) || n === 0) {
    return "0";
  }
  
  const abs = Math.abs(n);
  
  // 万亿
  if (abs >= 1_000_000_000_000) {
    return `${(n / 1_000_000_000_000).toFixed(2)}T`;
  }
  // 十亿
  if (abs >= 1_000_000_000) {
    return `${(n / 1_000_000_000).toFixed(2)}B`;
  }
  // 百万
  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(2)}M`;
  }
  // 千
  if (abs >= 1_000) {
    return `${(n / 1_000).toFixed(2)}K`;
  }
  // 小于 1000 直接取整
  return String(Math.round(n));
}

type delta_kind = "up" | "down" | "flat";

type DashboardStatsResponse = {
  company_count?: number | string;
  employees_sum?: number | string;
  employees?: number | string;
  revenue_sum?: number | string;
  total_revenue?: number | string;
  countries_covered?: number | string;
  company_series?: number[];
  employees_series?: number[];
  revenue_series?: number[];
  countries_series?: number[];
};

// 数据已从 API 拉，这个函数保留做备用

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
  if (series.length <= points) return series.map((v) => Math.round(v));
  const step = (series.length - 1) / (points - 1);
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const idx = Math.round(i * step);
    out.push(series[idx] ?? 0);
  }
  return out.map((v) => Math.round(v));
}

export default function Dashboard() {
  const [stats, setStats] = React.useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  // 结束年用当前年，把最新数据算进去
  const currentYear = new Date().getFullYear();
  const start_year = 2010;
  const end_year = currentYear;

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await companiesService.getDashboardStats();
        
        // 调试输出
        if (process.env.NODE_ENV === 'development') {
          console.log('[Dashboard] 接收到的统计数据:', data);
          console.log('[Dashboard] employees_sum 类型:', typeof data.employees_sum, '值:', data.employees_sum);
          console.log('[Dashboard] revenue_sum 类型:', typeof data.revenue_sum, '值:', data.revenue_sum);
        }
        
        setStats(data);
      } catch (err) {
        console.error('获取 dashboard 统计数据失败:', err);
        setError(err instanceof Error ? err : new Error('获取统计数据失败'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: "100%", minWidth: 0, py: 4, textAlign: "center" }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          加载中...
        </Typography>
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box sx={{ width: "100%", minWidth: 0, py: 4, textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "error.main" }}>
          加载失败: {error?.message || '未知错误'}
        </Typography>
      </Box>
    );
  }

  const toNumber = (value: unknown): number => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const employees_sum_raw = stats.employees_sum ?? stats.employees ?? 0;
  const revenue_sum_raw = stats.revenue_sum ?? stats.total_revenue ?? 0;
  const company_count = toNumber(stats.company_count);
  const countries_covered = toNumber(stats.countries_covered);
  const company_series = Array.isArray(stats.company_series) ? stats.company_series : [];
  const employees_series = Array.isArray(stats.employees_series) ? stats.employees_series : [];
  const revenue_series = Array.isArray(stats.revenue_series) ? stats.revenue_series : [];
  const countries_series = Array.isArray(stats.countries_series) ? stats.countries_series : [];

  // 统一转成数字，支持字符串
  const safe_employees_sum = toNumber(employees_sum_raw);
  const safe_revenue_sum = toNumber(revenue_sum_raw);
  
  // series 里的值也转数字
  const safe_employees_series = Array.isArray(employees_series) 
    ? employees_series.map(toNumber).filter(n => n >= 0)
    : [];
  const safe_revenue_series = Array.isArray(revenue_series)
    ? revenue_series.map(toNumber).filter(n => n >= 0)
    : [];

  // 调试输出
  if (process.env.NODE_ENV === 'development') {
    console.log('[Dashboard] 转换后的值:', {
      employees_sum: safe_employees_sum,
      revenue_sum: safe_revenue_sum,
      employees_series_length: safe_employees_series.length,
      revenue_series_length: safe_revenue_series.length,
    });
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Stack spacing={2.5} sx={{ minWidth: 0 }}>
        {/* top stats */}
        <Grid container spacing={2} sx={{ minWidth: 0 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="company count"
              value={String(company_count)}
              delta={calc_delta_from_series(company_series)}
              series={spark_from_series(company_series, 10)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="employees"
              value={format_compact_number(safe_employees_sum)}
              delta={calc_delta_from_series(safe_employees_series)}
              series={spark_from_series(safe_employees_series, 10)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="total revenue"
              value={`$${format_compact_number(safe_revenue_sum)}`}
              delta={calc_delta_from_series(safe_revenue_series)}
              series={spark_from_series(safe_revenue_series, 10)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="countries covered"
              value={String(countries_covered)}
              delta={calc_delta_from_series(countries_series)}
              series={spark_from_series(countries_series, 10)}
            />
          </Grid>
        </Grid>

        {/* charts row */}
        <Grid container spacing={3} sx={{ minWidth: 0 }}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                width: "100%",
                height: "100%",
                minHeight: { xs: 420, md: 560 },
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
                  p: { xs: 2, md: 2.5 },
                  gap: 1,
                }}
              >
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Current companies
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    by level (share of all companies)
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minHeight: { xs: 280, md: 360 }, minWidth: 0 }}>
                  <LevelDonut />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
            <Card
              sx={{
                width: "100%",
                height: "100%",
                minHeight: { xs: 420, md: 560 },
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
                  p: { xs: 2, md: 2.5 },
                  gap: 1,
                }}
              >
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    Network growth
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    cumulative companies joined over years
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minHeight: { xs: 280, md: 360 }, minWidth: 0 }}>
                  <CumulativeLine start_year={start_year} end_year={end_year} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* dynamic bar chart (new week) */}
        <Grid container spacing={3} sx={{ minWidth: 0 }}>
          <Grid size={{ xs: 12 }} sx={{ minWidth: 0 }}>
            <CompanyBarChart />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
