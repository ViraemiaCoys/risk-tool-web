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
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { companiesService } from "@/services/companies.service";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

type Props = {
  start_year: number;
  end_year: number;
};

export default function CumulativeLine({ start_year, end_year }: Props) {
  const [data, setData] = React.useState<{ years: number[]; cumulative: number[] } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchCumulativeGrowth = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await companiesService.getCumulativeGrowth(start_year, end_year);
        
        // 调试
        if (process.env.NODE_ENV === 'development') {
          console.log('[CumulativeLine] 获取到的累积增长数据:', result);
          console.log('[CumulativeLine] years:', result.years);
          console.log('[CumulativeLine] cumulative:', result.cumulative);
          if (result.cumulative && result.cumulative.length > 0) {
            const lastValue = result.cumulative[result.cumulative.length - 1];
            console.log('[CumulativeLine] 最后一年累积值:', lastValue);
            console.log('[CumulativeLine] 最后一年:', result.years[result.years.length - 1]);
          }
        }
        
        setData(result);
      } catch (err) {
        console.error('获取累积增长数据失败:', err);
        setError(err instanceof Error ? err : new Error('获取累积增长数据失败'));
      } finally {
        setLoading(false);
      }
    };

    fetchCumulativeGrowth();
  }, [start_year, end_year]);

  if (loading || !data) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ opacity: 0.7 }}>{loading ? "加载中..." : "暂无数据"}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "red" }}>加载失败: {error.message}</span>
      </div>
    );
  }

  const { years, cumulative } = data;

  const chartData = {
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

  const options: ChartOptions<"line"> = {
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
          autoSkip: true, // 避免标签挤在一起
          maxTicksLimit: 10,
          maxRotation: 0,
          minRotation: 0,
          padding: 6,
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { 
          color: "rgba(255,255,255,0.6)", 
          precision: 0,
          font: {
            size: 11,
          },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
