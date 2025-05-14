import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import SensorChart from '../components/SensorChart';
import useWebSocket from '../hooks/useWebSocket';
import { processSensorData } from '../utils/dataProcessingMBS';

const ECGView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('6h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data: sensorData, lastUpdated, reconnect } = useWebSocket('ws://192.168.45.249:8765');
  const processedData = processSensorData(sensorData);
  
  const formattedTime = lastUpdated ? 
    new Date(lastUpdated).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }) : '12:14:24 PM';

  // Filter only ECG channels
  const ecgChannels = Object.values(processedData).filter(
    sensor => sensor.name === 'ECG'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">12-Lead ECG Monitor</h1>
          <p className="text-gray-500">Monitoring cardiac activity | Last updated: {formattedTime}</p>
        </div>
        
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <span className="text-gray-700">Auto refresh</span>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={autoRefresh}
              onChange={() => setAutoRefresh(!autoRefresh)}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
          
          <button 
            onClick={reconnect}
            className="ml-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Now
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">ECG Graph</h2>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeRange('1h')}
              className={`px-3 py-1 rounded-md text-sm ${timeRange === '1h' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              1h
            </button>
            <button 
              onClick={() => setTimeRange('6h')}
              className={`px-3 py-1 rounded-md text-sm ${timeRange === '6h' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              6h
            </button>
            <button 
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 rounded-md text-sm ${timeRange === '24h' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              24h
            </button>
          </div>
        </div>
        
        <div className="h-[500px]">
          <SensorChart 
            data={processedData.ECG?.chartData || []} 
            timeRange={timeRange} 
            color="#EF4444" 
          />
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
            ECG Signal
          </div>
          <div className="flex space-x-6">
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
              <span>Normal Sinus Rhythm</span>
            </div>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
              <span>Abnormal: QT Prolongation</span>
            </div>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
              <span>Critical: Arrhythmia</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(lead => (
          <div key={lead} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium mb-2">Lead {lead}</h3>
            <div className="h-[100px] mb-2">
              <SensorChart 
                data={processedData.ECG?.chartData.slice(0, 50) || []} 
                timeRange="1h" 
                color="#EF4444"
                simplified={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ECGView;