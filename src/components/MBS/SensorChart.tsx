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
  const cleanedData = useMemo(() => {
    const allData = data
      .filter(
        (d) =>
          d &&
          d.x instanceof Date &&
          !isNaN(d.x.getTime()) &&
          typeof d.y === "number" &&
          !isNaN(d.y)
      )
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    const latestTime = allData.length > 0 ? allData[allData.length - 1].x.getTime() : 0;
    const tenSecondsAgo = latestTime - 10_000;

    return allData.filter((d) => d.x.getTime() >= tenSecondsAgo);
  }, [data]);

  const chartData: ChartData<"line", { x: Date; y: number }[], unknown> = useMemo(() => ({
    datasets: [
      {
        label: "Sensor Data",
        data: cleanedData,
        borderColor: color,
        backgroundColor: `${color}33`,
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
        grid: { display: false },
        time: {
          tooltipFormat: "HH:mm:ss",
          unit: "second",
          displayFormats: {
            second: "HH:mm:ss",
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
        grid: { color: "#E5E7EB" },
        ticks: { font: { size: 10 } },
      },
    },
    animation: false,
    normalized: true,
  }), [simplified]);

  if (cleanedData.length === 0) {
    return <div className="text-gray-400 text-sm px-2 py-1">No data available.</div>;
  }

  return (
    <div style={{ height: "150px" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default SensorChart;
