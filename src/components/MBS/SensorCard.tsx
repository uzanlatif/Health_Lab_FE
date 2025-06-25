import React from 'react';

interface SensorCardProps {
  name: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const SensorCard: React.FC<SensorCardProps> = ({
  name,
  onClick,
  isSelected = false,
}) => {
  return (
    <div
      className={`
        flex justify-between items-center p-6 rounded-xl shadow-md transition
        cursor-pointer hover:bg-gray-800
        w-full bg-gray-900 text-gray-100
        border-l-4 border-blue-500
        ${isSelected ? 'ring-2 ring-blue-400 bg-gray-800' : ''}
        min-h-[120px]
      `}
      onClick={onClick}
    >
      {/* Kiri: Nama Sensor */}
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <h3 className="text-gray-200 font-bold text-3xl">{name}</h3>
        </div>
      </div>

      {/* Kanan: Placeholder kosong */}
      <div className="w-6 h-6" />
    </div>
  );
};

export default SensorCard;
