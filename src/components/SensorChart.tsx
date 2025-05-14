import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SensorChartProps {
  data: number[]; // sensor values per second
  timeRange: '1h' | '6h' | '24h'; // optional range switch
  color: string;
  simplified?: boolean;
}

const SensorChart: React.FC<SensorChartProps> = ({ data, timeRange, color, simplified = false }) => {
  const generateLabels = () => {
    const now = new Date();
    return data.map((_, i) => {
      const time = new Date(now.getTime() - (data.length - 1 - i) * 1000);
      return simplified
        ? ''
        : time.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
    });
  };

  const chartData = {
    labels: generateLabels(),
    datasets: [
      {
        label: '', // Hide label text on legend
        data,
        borderColor: color,
        backgroundColor: `${color}20`, // semi-transparent fill
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: !simplified,
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: !simplified,
        title: {
          display: false,
        },
        grid: {
          display: false,
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
        title: {
          display: false,
        },
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          font: { size: 10 },
        },
      },
    },
    animation: {
      duration: 500,
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default SensorChart;
