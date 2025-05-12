import React from 'react';
import { ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { SensorData } from '../utils/mockData';

interface SummaryCardProps {
  sensor: SensorData;
  onClick: () => void;
  isSelected: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ sensor, onClick, isSelected }) => {
  const { name, currentValue, unit, status } = sensor;

  // Determine trend based on recent history
  const recentValues = sensor.history.slice(-6);
  const firstValue = recentValues[0]?.value || 0;
  const lastValue = recentValues[recentValues.length - 1]?.value || 0;
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'stable';
  
  const trendPercentage = firstValue === 0 ? 0 : 
    Math.abs(((lastValue - firstValue) / firstValue) * 100).toFixed(1);
  
  // Status-based styling
  const getBorderColor = () => {
    if (isSelected) return 'border-blue-500 dark:border-blue-400';
    
    switch (status) {
      case 'critical':
        return 'border-red-500 dark:border-red-400';
      case 'warning':
        return 'border-yellow-500 dark:border-yellow-400';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'critical':
        return <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>;
      case 'warning':
        return <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>;
      default:
        return <span className="h-3 w-3 bg-green-500 rounded-full"></span>;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center text-red-500">
            <ChevronUp className="h-4 w-4" />
            <span className="text-xs">{trendPercentage}%</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center text-green-500">
            <ChevronDown className="h-4 w-4" />
            <span className="text-xs">{trendPercentage}%</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500">
            <Activity className="h-4 w-4" />
            <span className="text-xs">Stable</span>
          </div>
        );
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${getBorderColor()} 
      transition-all duration-300 hover:shadow-md cursor-pointer 
      ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
            {name}
          </h3>
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
            <span className="text-xs capitalize text-gray-500 dark:text-gray-400">
              {status}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              {currentValue}
            </span>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
              {unit}
            </span>
          </div>
          {getTrendIcon()}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;