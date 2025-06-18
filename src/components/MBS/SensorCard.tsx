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
        flex justify-between items-center p-2 rounded-md shadow-sm transition
        cursor-pointer hover:bg-gray-800
        text-sm w-full max-w-[260px] bg-gray-900 text-gray-100
        border-l-4 border-blue-500
        ${isSelected ? 'ring-2 ring-blue-400 bg-gray-800' : ''}
        min-h-[72px]
      `}
      onClick={onClick}
    >
      {/* Kiri: Nama Sensor */}
      <div className="flex flex-col">
        <div className="flex items-center mb-0.5">
          <h3 className="text-gray-200 font-semibold text-base">{name}</h3>
        </div>
      </div>

      {/* Kanan: Kosong untuk keseimbangan layout */}
      <div className="w-4 h-4" />
    </div>
  );
};

export default SensorCard;
