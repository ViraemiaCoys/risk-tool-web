"use client";

import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";

type delta_kind = "up" | "down" | "flat";

export type kpi_card_props = {
  title: string;
  value: string;
  delta?: { kind: delta_kind; label: string }; // e.g. { kind:"up", label:"+12.4%" }
  series?: number[]; // spark bars, 8~14 points is best
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalize_series(series: number[]) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  return series.map((v) => (v - min) / span);
}

export default function KpiCard(props: kpi_card_props) {
  const norm = React.useMemo(
    () => (props.series && props.series.length ? normalize_series(props.series) : []),
    [props.series]
  );

  const delta_color =
    props.delta?.kind === "up"
      ? "rgba(46, 204, 113, 0.95)"
      : props.delta?.kind === "down"
      ? "rgba(255, 107, 107, 0.95)"
      : "rgba(255,255,255,0.55)";

  const delta_icon =
    props.delta?.kind === "up" ? "▲" : props.delta?.kind === "down" ? "▼" : "•";

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        borderRadius: 3, // 比你之前小：更“现代”，不那么圆
        p: 1.5, // 减小 padding，使上边框更整齐
        pt: 1.5, // 顶部 padding 对齐
        bgcolor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 10px 35px rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}
    >
      {/* subtle glow */}
      <Box
        sx={{
          position: "absolute",
          inset: -120,
          background:
            "radial-gradient(circle at 20% 10%, rgba(100, 200, 255, 0.12), transparent 40%), radial-gradient(circle at 80% 70%, rgba(46, 204, 113, 0.10), transparent 45%)",
          pointerEvents: "none",
        }}
      />

      {/* delta */}
      {props.delta ? (
        <Box
          sx={{
            position: "absolute",
            top: 12, // 调整位置，与顶部 padding 对齐
            right: 12,
            px: 0.75,
            py: 0.4,
            borderRadius: 999,
            bgcolor: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: delta_color,
            fontSize: 10, // 减小字体
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 9, opacity: 0.9 }}>{delta_icon}</span>
          <span style={{ fontWeight: 700 }}>{props.delta.label}</span>
        </Box>
      ) : null}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
        alignItems={{ xs: "flex-start", sm: "flex-end" }}
        sx={{ position: "relative", zIndex: 1 }}
      >
        {/* left text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 1,
              opacity: 0.75,
              display: "block",
              mb: 0.5,
              fontSize: '0.65rem', // 减小标题字体
              lineHeight: 1.2,
            }}
          >
            {props.title}
          </Typography>

          <Typography
            sx={{
              fontSize: 28, // 从 34 减小到 28
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: -0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {props.value}
          </Typography>

          {/* 这里不再显示 count()/sum() 那行 */}
        </Box>

        {/* right mini bars */}
        {norm.length ? (
          <Box
            sx={{
              width: { xs: "100%", sm: 96 },
              height: { xs: 48, sm: 52 },
              display: "flex",
              alignItems: "flex-end",
              justifyContent: { xs: "flex-start", sm: "flex-end" },
              gap: 0.6,
              opacity: 0.9,
              maxWidth: "100%",
            }}
            aria-label="spark bars"
          >
            {norm.map((p, i) => (
              <Box
                key={i}
                sx={{
                  width: 6,
                  height: `${clamp(10 + p * 42, 10, 52)}px`,
                  borderRadius: 1.25,
                  bgcolor: "rgba(84, 175, 255, 0.95)",
                }}
              />
            ))}
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}
