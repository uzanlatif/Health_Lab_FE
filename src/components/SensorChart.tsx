import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SensorData } from '../utils/mockData';

interface SensorChartProps {
  sensor: SensorData;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {format(new Date(label), 'MMM d, h:mm a')}
        </p>
        <p className="text-sm font-semibold" style={{ color: payload[0].color }}>
          {`${payload[0].value} ${payload[0].unit}`}
        </p>
      </div>
    );
  }

  return null;
};

const SensorChart: React.FC<SensorChartProps> = ({ sensor }) => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('6h');
  
  // Convert history data to a format Recharts can use
  const formatDataForChart = () => {
    const { history, unit } = sensor;
    let filteredData = history;
    
    // Filter based on selected time range
    if (timeRange === '1h') {
      const oneHourAgo = Date.now() - 3600000;
      filteredData = history.filter(point => point.timestamp > oneHourAgo);
    } else if (timeRange === '6h') {
      const sixHoursAgo = Date.now() - 6 * 3600000;
      filteredData = history.filter(point => point.timestamp > sixHoursAgo);
    }
    
    return filteredData.map(point => ({
      timestamp: point.timestamp,
      value: point.value,
      unit
    }));
  };

  const chartData = formatDataForChart();
  
  // Calculate domain for Y axis (min and max with some padding)
  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          {sensor.name}
        </h2>
        <div className="flex space-x-1">
          {['1h', '6h', '24h'].map((range) => (
            <button
              key={range}
              className={`px-3 py-1 text-xs rounded-md transition-colors
                ${timeRange === range 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              onClick={() => setTimeRange(range as '1h' | '6h' | '24h')}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(timestamp) => format(new Date(timestamp), 'h:mm a')}
              stroke="#9ca3af"
            />
            <YAxis 
              domain={[Math.max(0, minValue - padding), maxValue + padding]}
              stroke="#9ca3af" 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={sensor.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
              name={`${sensor.name} (${sensor.unit})`}
              unit={sensor.unit}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: sensor.color }}></span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Current: {sensor.currentValue} {sensor.unit}</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {sensor.warningThreshold && (
            <span className="inline-flex items-center mr-2">
              <span className="h-2 w-2 bg-yellow-400 rounded-full mr-1"></span>
              Warning: {sensor.warningThreshold} {sensor.unit}
            </span>
          )}
          {sensor.criticalThreshold && (
            <span className="inline-flex items-center">
              <span className="h-2 w-2 bg-red-500 rounded-full mr-1"></span>
              Critical: {sensor.criticalThreshold} {sensor.unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorChart;