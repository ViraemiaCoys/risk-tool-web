"use client";

import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import type { ChartData, ChartOptions, ActiveElement } from "chart.js";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartEvent,
} from "chart.js";

import { companiesService } from "@/services/companies.service";

ChartJS.register(ArcElement, Tooltip, Legend);

type center_state = {
  value: number;
  label: string;
};

export default function LevelDonut() {
  const [counts, setCounts] = React.useState<{ l1: number; l2: number; l3: number; total: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [center, set_center] = React.useState<center_state>({
    value: 0,
    label: "Total companies",
  });

  React.useEffect(() => {
    const fetchLevelDistribution = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await companiesService.getLevelDistribution();
        setCounts(data);
        // 初始中心文字
        set_center({
          value: data.total,
          label: "Total companies",
        });
      } catch (err) {
        console.error('获取级别分布数据失败:', err);
        setError(err instanceof Error ? err : new Error('获取级别分布数据失败'));
      } finally {
        setLoading(false);
      }
    };

    fetchLevelDistribution();
  }, []);

  // counts 变了就同步 center
  React.useEffect(() => {
    if (counts) {
      set_center((prev) => {
        if (prev.value === counts.total && prev.label === "Total companies") return prev;
        return { value: counts.total, label: "Total companies" };
      });
    }
  }, [counts]);

  if (loading || !counts) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {loading ? "加载中..." : "暂无数据"}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" sx={{ color: "error.main" }}>
          加载失败: {error.message}
        </Typography>
      </Box>
    );
  }

  const labels = ["Level 1", "Level 2", "Level 3"];
  const values = [counts.l1, counts.l2, counts.l3];

  const data: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ["#5aa2ff", "#3ddc97", "#ffc933"],
        borderColor: "rgba(0,0,0,0.35)",
        borderWidth: 2,
        hoverBorderColor: "rgba(255,255,255,0.25)",
        hoverBorderWidth: 2,
        spacing: 2,
        cutout: "72%",
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false, // 撑满容器
    animation: { duration: 250 },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "rgba(255,255,255,0.85)",
          boxWidth: 20,
          boxHeight: 12,
          padding: 18,
          font: { size: 13, weight: "600" },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => {
            const v = Number(ctx.raw ?? 0);
            const total = values.reduce((a, b) => a + b, 0) || 1;
            const pct = ((v / total) * 100).toFixed(1);
            return `${ctx.label}: ${v} (${pct}%)`;
          },
        },
      },
    },

    // 鼠标悬停时改中心数字
    onHover: (event: ChartEvent, active: ActiveElement[]) => {
      if (!active?.length) return;

      const idx = active[0].index;
      const next_value = values[idx] ?? counts.total;
      const next_label = labels[idx] ?? "Total companies";

      set_center((prev) => {
        if (prev.value === next_value && prev.label === next_label) return prev;
        return { value: next_value, label: next_label };
      });
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: { xs: 520, md: 640 },
        position: "relative",
        p: 0,
      }}
      onMouseLeave={() =>
        set_center({ value: counts.total, label: "Total companies" })
      }
    >
      {/* Chart canvas */}
      <Box sx={{ width: "100%", height: "100%" }}>
        <Doughnut data={data} options={options} />
      </Box>

      {/* Center overlay */}
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "54%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 54, md: 72 },
            fontWeight: 900,
            letterSpacing: 0.2,
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1,
          }}
        >
          {center.value}
        </Typography>
        <Typography
          sx={{
            mt: 1,
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {center.label}
        </Typography>
      </Box>

      {/* 底部提示 */}
      <Stack
        direction="row"
        justifyContent="center"
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 8,
          pointerEvents: "none",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          hover a slice to update the center total
        </Typography>
      </Stack>
    </Box>
  );
}
