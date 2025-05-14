import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import 'chartjs-adapter-date-fns';
import type { ChartData, ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

interface SensorChartProps {
  data: { x: Date; y: number }[];
  timeRange: "1h" | "6h" | "24h";
  color: string;
  simplified?: boolean;
}

const SensorChart: React.FC<SensorChartProps> = ({
  data,
  timeRange,
  color,
  simplified = false,
}) => {
  const chartData: ChartData<"line", { x: Date; y: number }[], unknown> = useMemo(() => ({
    datasets: [
      {
        label: "",
        data: data?.filter(d => d?.x && typeof d.y === "number") || [],
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: true,
        tension: 0.3,
      },
    ],
  }), [data, color]);

  const chartOptions: ChartOptions<"line"> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: !simplified,
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        type: "time",
        display: !simplified,
        grid: { display: false },
        time: {
          tooltipFormat: "HH:mm:ss",
          unit: "minute",
          displayFormats: {
            second: "HH:mm:ss",
            minute: "HH:mm",
            hour: "HH:mm",
          },
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          font: { size: 10 },
        },
      },
      y: {
        display: !simplified,
        grid: { color: "#E5E7EB" },
        ticks: { font: { size: 10 } },
      },
    },
    animation: false,
    normalized: true,
  }), [simplified]);

  return <Line data={chartData} options={chartOptions} />;
};

export default SensorChart;
