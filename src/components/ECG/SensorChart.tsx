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
  notch60Hz?: boolean;
  compactView?: boolean;
}

function applyNotch60HzFilter(data: { x: Date; y: number }[], sampleRate: number): { x: Date; y: number }[] {
  const notchFreq = 60;
  const Q = 30;
  const w0 = 2 * Math.PI * notchFreq / sampleRate;
  const alpha = Math.sin(w0) / (2 * Q);

  const b0 = 1;
  const b1 = -2 * Math.cos(w0);
  const b2 = 1;
  const a0 = 1 + alpha;
  const a1 = -2 * Math.cos(w0);
  const a2 = 1 - alpha;

  const b = [b0 / a0, b1 / a0, b2 / a0];
  const a = [1, a1 / a0, a2 / a0];

  const forward = biquadFilter(data.map(d => d.y), b, a);
  const backward = biquadFilter(forward.slice().reverse(), b, a).reverse();

  return data.map((d, i) => ({
    x: d.x,
    y: backward[i],
  }));
}

function biquadFilter(input: number[], b: number[], a: number[]): number[] {
  const output: number[] = [];
  let x1 = 0, x2 = 0;
  let y1 = 0, y2 = 0;

  for (let i = 0; i < input.length; i++) {
    const x0 = input[i];
    const y0 = b[0] * x0 + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;

    output.push(y0);

    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }

  return output;
}

const SensorChart: React.FC<SensorChartProps> = ({
  data,
  timeRange,
  color,
  simplified = false,
  notch60Hz = false,
  compactView = false,
}) => {
  const cleanedData = useMemo(() => {
    const allData = data
      .filter(d => d && d.x instanceof Date && !isNaN(d.x.getTime()) && typeof d.y === "number" && !isNaN(d.y))
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    const latestTime = allData.length > 0 ? allData[allData.length - 1].x.getTime() : 0;
    const fiveSecondsAgo = latestTime - 5000;
    let windowed = allData.filter(d => d.x.getTime() >= fiveSecondsAgo);

    if (notch60Hz && windowed.length > 1) {
      const dt = (windowed[1].x.getTime() - windowed[0].x.getTime()) / 1000;
      const sampleRate = dt > 0 ? 1 / dt : 250;
      windowed = applyNotch60HzFilter(windowed, sampleRate);
    }

    return windowed;
  }, [data, notch60Hz]);

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
          displayFormats: { second: "HH:mm:ss" },
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
    <div style={{ height: compactView ? "100px" : "150px" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default SensorChart;
