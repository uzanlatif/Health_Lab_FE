// Utility to generate random numbers within a range
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Sensor types with their configurations
export interface SensorConfig {
  id: number;
  name: string;
  unit: string;
  min: number;
  max: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  color: string;
}

// Define our 15 health sensors
export const sensorConfigs: SensorConfig[] = [
  {
    id: 1,
    name: 'Heart Rate',
    unit: 'BPM',
    min: 40,
    max: 200,
    warningThreshold: 100,
    criticalThreshold: 120,
    color: '#EF4444'
  },
  {
    id: 2,
    name: 'Blood Oxygen',
    unit: '%',
    min: 80,
    max: 100,
    warningThreshold: 92,
    criticalThreshold: 90,
    color: '#3B82F6'
  },
  {
    id: 3,
    name: 'Body Temperature',
    unit: '°C',
    min: 35,
    max: 42,
    warningThreshold: 37.5,
    criticalThreshold: 38.5,
    color: '#F59E0B'
  },
  {
    id: 4,
    name: 'Blood Pressure (Systolic)',
    unit: 'mmHg',
    min: 90,
    max: 200,
    warningThreshold: 130,
    criticalThreshold: 140,
    color: '#8B5CF6'
  },
  {
    id: 5,
    name: 'Blood Pressure (Diastolic)',
    unit: 'mmHg',
    min: 60,
    max: 130,
    warningThreshold: 85,
    criticalThreshold: 90,
    color: '#10B981'
  },
  {
    id: 6,
    name: 'Respiratory Rate',
    unit: 'breaths/min',
    min: 8,
    max: 30,
    warningThreshold: 24,
    criticalThreshold: 26,
    color: '#6366F1'
  },
  {
    id: 7,
    name: 'Blood Glucose',
    unit: 'mg/dL',
    min: 70,
    max: 200,
    warningThreshold: 140,
    criticalThreshold: 180,
    color: '#EC4899'
  },
  {
    id: 8,
    name: 'ECG',
    unit: 'mV',
    min: -2,
    max: 2,
    color: '#14B8A6'
  },
  {
    id: 9,
    name: 'EMG',
    unit: 'µV',
    min: 0,
    max: 500,
    color: '#F97316'
  },
  {
    id: 10,
    name: 'Hydration Level',
    unit: '%',
    min: 30,
    max: 100,
    warningThreshold: 50,
    criticalThreshold: 40,
    color: '#8B5CF6'
  },
  {
    id: 11,
    name: 'Stress Level',
    unit: 'index',
    min: 0,
    max: 100,
    warningThreshold: 70,
    criticalThreshold: 85,
    color: '#64748B'
  },
  {
    id: 12,
    name: 'Sleep Quality',
    unit: '%',
    min: 0,
    max: 100,
    warningThreshold: 40,
    criticalThreshold: 30,
    color: '#22C55E'
  },
  {
    id: 13,
    name: 'Activity Level',
    unit: 'steps/hr',
    min: 0,
    max: 1000,
    color: '#0EA5E9'
  },
  {
    id: 14,
    name: 'Posture Angle',
    unit: '°',
    min: 0,
    max: 90,
    warningThreshold: 45,
    criticalThreshold: 60,
    color: '#A855F7'
  },
  {
    id: 15,
    name: 'Body Fat',
    unit: '%',
    min: 5,
    max: 50,
    warningThreshold: 30,
    criticalThreshold: 35,
    color: '#F43F5E'
  }
];

// Determine sensor status based on value and thresholds
export const getSensorStatus = (
  value: number,
  config: SensorConfig
): 'normal' | 'warning' | 'critical' => {
  if (config.criticalThreshold && value >= config.criticalThreshold) {
    return 'critical';
  }
  if (config.warningThreshold && value >= config.warningThreshold) {
    return 'warning';
  }
  return 'normal';
};

// Generate a random value for a sensor
export const generateSensorValue = (sensorConfig: SensorConfig): number => {
  return parseFloat(randomInRange(sensorConfig.min, sensorConfig.max).toFixed(2));
};

// Generate current readings for all sensors
export const generateCurrentReadings = () => {
  return sensorConfigs.map(config => {
    const value = generateSensorValue(config);
    return {
      ...config,
      value,
      status: getSensorStatus(value, config)
    };
  });
};

// Generate historical data points
export interface DataPoint {
  timestamp: number;
  value: number;
}

export interface SensorData extends SensorConfig {
  currentValue: number;
  status: 'normal' | 'warning' | 'critical';
  history: DataPoint[];
}

// Generate a series of data points for a specific time range
export const generateHistoricalData = (
  sensorConfig: SensorConfig,
  hours = 24,
  pointsPerHour = 12
): DataPoint[] => {
  const now = Date.now();
  const points: DataPoint[] = [];
  
  // Generate data points for the past [hours]
  for (let i = hours * pointsPerHour - 1; i >= 0; i--) {
    const timestamp = now - i * (3600000 / pointsPerHour);
    let value = generateSensorValue(sensorConfig);
    
    // Add some trend to make data look more realistic
    // Values closer to current time are affected by previous values
    if (points.length > 0) {
      const prevValue = points[points.length - 1].value;
      // 70% of the previous value, 30% random
      value = 0.7 * prevValue + 0.3 * value;
      
      // Ensure value is still within range
      value = Math.max(sensorConfig.min, Math.min(value, sensorConfig.max));
      value = parseFloat(value.toFixed(2));
    }
    
    points.push({
      timestamp,
      value
    });
  }
  
  return points;
};

// Generate a complete sensor dataset with current values and history
export const generateSensorDataset = (): SensorData[] => {
  return sensorConfigs.map(config => {
    const currentValue = generateSensorValue(config);
    const history = generateHistoricalData(config);
    
    return {
      ...config,
      currentValue,
      status: getSensorStatus(currentValue, config),
      history
    };
  });
};