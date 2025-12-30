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

import { companies } from "@/data/dummy";

ChartJS.register(ArcElement, Tooltip, Legend);

type center_state = {
  value: number;
  label: string;
};

function count_by_level(list: typeof companies) {
  const l1 = list.filter((c) => c.level === 1).length;
  const l2 = list.filter((c) => c.level === 2).length;
  const l3 = list.filter((c) => c.level === 3).length;
  return { l1, l2, l3, total: list.length };
}

export default function LevelDonut() {
  const counts = React.useMemo(() => count_by_level(companies), []);
  const [center, set_center] = React.useState<center_state>({
    value: counts.total,
    label: "Total companies",
  });

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
    maintainAspectRatio: false, // 关键：让图表撑满容器高度
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

    // hover 时更新中心文字
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
        minHeight: { xs: 520, md: 640 }, // 你要更大可以继续加
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

      {/* 可选：底部提示（不想要就删掉） */}
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
