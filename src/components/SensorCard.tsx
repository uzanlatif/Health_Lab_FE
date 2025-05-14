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
    normal: 'bg-green-800 text-green-100',
    warning: 'bg-yellow-700 text-yellow-100',
    critical: 'bg-red-800 text-red-100',
  };

  const isPositiveChange = change > 0;
  const changeColor = isPositiveChange ? 'text-red-400' : 'text-green-400';
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
        cursor-pointer hover:bg-gray-800
        text-sm w-full max-w-[260px] bg-gray-900 text-gray-100
        ${borderColor[status]}
        ${isSelected ? 'ring-2 ring-blue-400 bg-gray-800' : ''}
      `}
      onClick={onClick}
    >
      {/* Kiri: Nama dan status */}
      <div className="flex flex-col">
        <div className="flex items-center mb-0.5">
          <h3 className="text-gray-200 font-medium text-sm">{name}</h3>
          <span
            className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${statusColors[status]}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <p className="text-lg font-bold text-white leading-snug">
          {formattedValue}{' '}
          <span className="text-xs font-normal text-gray-400">{unit}</span>
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
