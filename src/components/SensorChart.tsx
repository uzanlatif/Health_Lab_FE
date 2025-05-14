import React, { useMemo, useEffect } from "react";
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

// Register necessary Chart.js components
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
  // Debugging: optional logs
  useEffect(() => {
    if (!data || data.length === 0) {
      console.warn("SensorChart received empty or invalid data.");
    } else {
      const sample = data[0];
      console.log("SensorChart sample data:", sample);
    }
  }, [data]);

  // Ensure data is clean: no NaNs, and x is a valid Date object
  const cleanedData = useMemo(() => {
    return (data || []).filter(
      (d) =>
        d &&
        d.x instanceof Date &&
        !isNaN(d.x.getTime()) &&
        typeof d.y === "number" &&
        !isNaN(d.y)
    );
  }, [data]);

  const chartData: ChartData<"line", { x: Date; y: number }[], unknown> = useMemo(() => ({
    datasets: [
      {
        label: "Sensor Data",
        data: cleanedData,
        borderColor: color,
        backgroundColor: `${color}20`, // Transparent fill
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: true,
        tension: 0.3,
      },
    ],
  }), [cleanedData, color]);

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
