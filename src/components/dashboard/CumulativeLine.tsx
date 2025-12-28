"use client";

import * as React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { company_row } from "@/data/dummy";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Props = {
  companies: company_row[];
  start_year: number;
  end_year: number;
};

export default function CumulativeLine({ companies, start_year, end_year }: Props) {
  const years = React.useMemo(
    () => Array.from({ length: end_year - start_year + 1 }, (_, i) => start_year + i),
    [start_year, end_year]
  );

  const cumulative = React.useMemo(() => {
    let total = 0;
    return years.map((year) => {
      const added = companies.filter((c) => c.joined_year === year).length;
      total += added;
      return total;
    });
  }, [years, companies]);

  const data = {
    labels: years.map(String),
    datasets: [
      {
        label: "Cumulative companies",
        data: cumulative,
        borderColor: "#5da9ff",
        backgroundColor: "rgba(93,169,255,0.25)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#5da9ff",
        borderWidth: 2,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        labels: { color: "rgba(255,255,255,0.8)", boxWidth: 28 },
      },
      tooltip: {
        backgroundColor: "rgba(20,20,20,0.9)",
        titleColor: "#fff",
        bodyColor: "#ddd",
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: {
          color: "rgba(255,255,255,0.6)",
          autoSkip: true,
          maxTicksLimit: 8,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "rgba(255,255,255,0.6)", precision: 0 },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0 }}>
      <Line data={data} options={options} />
    </div>
  );
}
