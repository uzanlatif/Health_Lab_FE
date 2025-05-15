import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import SensorChart from '../components/SensorChart';
import useWebSocket from '../hooks/useWebSocket';
import { processSensorData } from '../utils/dataProcessingMBS';

const EEGView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('6h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data: sensorData, lastUpdated, reconnect } = useWebSocket('ws://192.168.45.249:8765');
  // const processedData = processSensorData(sensorData);

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : '12:14:24 PM';

  // Filter only EEG channels
  // // const eegChannels = Object.entries(processedData)
  //   .filter(([key]) => key.includes('EEG'))
  //   .map(([, value]) => value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">16-Channel EEG Monitor</h1>
          <p className="text-gray-500">
            Monitoring brain activity<br />
            <span className="font-medium">Last updated:</span> {formattedTime}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Auto refresh</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <button
            onClick={reconnect}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* EEG Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col mb-4 space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">EEG Summary</h2>
          <p className="text-sm text-gray-500">
            Menampilkan aktivitas otak dari kanal EEG utama (CH11) dalam periode waktu tertentu.
          </p>

          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('1h')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === '1h'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1h
            </button>
            <button
              onClick={() => setTimeRange('6h')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === '6h'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              6h
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === '24h'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              24h
            </button>
          </div>
        </div>

        <div className="h-[300px]">
          {/* <SensorChart
            // data={processedData['EEG CH11']?.chartData || []}
            timeRange={timeRange}
            color="#3B82F6"
          /> */}
        </div>

        <div className="mt-4 text-sm">
          <h4 className="font-medium text-gray-700 mb-2">Warna Gelombang Otak:</h4>
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
              <span>Alpha Waves - rileks, meditasi</span>
            </div>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
              <span>Beta Waves - konsentrasi, fokus</span>
            </div>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-purple-500 mr-2"></span>
              <span>Theta Waves - tidur ringan, kreativitas</span>
            </div>
          </div>
        </div>
      </div>

      {/* EEG Channel Cards */}
      <div className="flex flex-col space-y-4">
        {[11, 12, 13, 14, 15, 16].map(channel => (
          <div key={channel} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium mb-2">EEG CH{channel}</h3>
            <div className="h-[100px] mb-2">
              {/* <SensorChart
                data={processedData[`EEG CH${channel}`]?.chartData || []}
                timeRange="1h"
                color="#3B82F6"
                simplified={true}
              /> */}
            </div>
            <p className="text-sm text-gray-500">
              Aktivitas sinyal otak dari kanal CH{channel} dalam 1 jam terakhir.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EEGView;
