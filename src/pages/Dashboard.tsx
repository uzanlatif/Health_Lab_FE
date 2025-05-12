import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import SensorChart from '../components/SensorChart';
import { generateSensorDataset, SensorData } from '../utils/mockData';

const Dashboard: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Initial load
  useEffect(() => {
    fetchSensorData();
  }, []);

  // Auto refresh
  useEffect(() => {
    let intervalId: number;
    
    if (autoRefresh) {
      intervalId = window.setInterval(() => {
        fetchSensorData(false);
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const fetchSensorData = (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const data = generateSensorDataset();
      setSensors(data);
      setLastUpdated(new Date());
      
      // Select the first sensor if none is selected
      if (selectedSensor === null && data.length > 0) {
        setSelectedSensor(data[0].id);
      }
      
      setLoading(false);
      setRefreshing(false);
    }, 800);
  };

  const handleRefresh = () => {
    if (!refreshing) {
      fetchSensorData(false);
    }
  };

  // Get the selected sensor data
  const getSelectedSensorData = (): SensorData | undefined => {
    return sensors.find(sensor => sensor.id === selectedSensor);
  };

  // Group sensors by status for better organization
  const groupedSensors = {
    critical: sensors.filter(sensor => sensor.status === 'critical'),
    warning: sensors.filter(sensor => sensor.status === 'warning'),
    normal: sensors.filter(sensor => sensor.status === 'normal')
  };

  const allSensorsOrdered = [
    ...groupedSensors.critical,
    ...groupedSensors.warning,
    ...groupedSensors.normal
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading sensor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Dashboard header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Monitoring Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitoring {sensors.length} health sensors | Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <label htmlFor="autoRefresh" className="mr-2 text-sm text-gray-600 dark:text-gray-400">
              Auto refresh
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input 
                type="checkbox" 
                id="autoRefresh" 
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in"
              />
              <label 
                htmlFor="autoRefresh" 
                className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${autoRefresh ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              ></label>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Sensor status overview */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Status summary cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">All Sensors</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{sensors.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Critical</h3>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{groupedSensors.critical.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Warning</h3>
            <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{groupedSensors.warning.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Normal</h3>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{groupedSensors.normal.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Auto-refresh</h3>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{autoRefresh ? 'On' : 'Off'}</p>
          </div>
        </div>
      </div>

      {/* Main content with fixed heights */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sensor cards with scrollable container */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 h-[calc(100vh-20rem)]">
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Health Readings</h2>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-3">
                {allSensorsOrdered.map(sensor => (
                  <SummaryCard
                    key={sensor.id}
                    sensor={sensor}
                    onClick={() => setSelectedSensor(sensor.id)}
                    isSelected={selectedSensor === sensor.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main chart with fixed height */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 h-[calc(100vh-20rem)]">
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Sensor Details</h2>
            <div className="flex-1">
              {getSelectedSensorData() ? (
                <SensorChart sensor={getSelectedSensorData()!} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">Select a sensor to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;