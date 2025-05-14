import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SensorCardProps {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  change: number;
  onClick?: () => void;
  isSelected?: boolean;
}

const SensorCard: React.FC<SensorCardProps> = ({
  name,
  value,
  unit,
  status,
  change,
  onClick,
  isSelected = false,
}) => {
  const formattedValue = value.toFixed(2);

  const statusColors = {
    normal: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  const isPositiveChange = change > 0;
  const changeColor = isPositiveChange ? 'text-red-500' : 'text-green-500';
  const ChangeIcon = isPositiveChange ? ArrowUp : ArrowDown;
  const absChange = Math.abs(change).toFixed(1);

  const borderColor = {
    normal: 'border-l-4 border-green-500',
    warning: 'border-l-4 border-yellow-500',
    critical: 'border-l-4 border-red-500',
  };

  return (
    <div
      className={`
        flex justify-between items-center p-2 rounded-md shadow-sm transition
        cursor-pointer hover:bg-gray-50
        text-sm w-full max-w-[260px]
        ${borderColor[status]}
        ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''}
      `}
      onClick={onClick}
    >
      {/* Kiri: Nama dan status */}
      <div className="flex flex-col">
        <div className="flex items-center mb-0.5">
          <h3 className="text-gray-700 font-medium text-sm">{name}</h3>
          <span
            className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${statusColors[status]}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <p className="text-lg font-bold text-gray-800 leading-snug">
          {formattedValue}{' '}
          <span className="text-xs font-normal text-gray-500">{unit}</span>
        </p>
      </div>

      {/* Kanan: Perubahan */}
      <div className={`flex items-center ${changeColor} text-xs`}>
        <ChangeIcon className="w-3 h-3 mr-1" />
        <span>{absChange}%</span>
      </div>
    </div>
  );
};

export default SensorCard;
