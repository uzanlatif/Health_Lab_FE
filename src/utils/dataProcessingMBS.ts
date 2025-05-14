interface SensorData {
  name: string;
  displayName: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  change: number;
  chartData: number[];
}

export const processSensorData = (data: Record<string, number[]>): Record<string, SensorData> => {
  const result: Record<string, SensorData> = {};

  const sensorConfig: Record<string, { displayName: string; unit: string }> = {
    'ECG': { displayName: 'ECG', unit: 'BPM' },
    'PPG': { displayName: 'PPG', unit: 'mmHg' },
    'PCG': { displayName: 'PCG Phonocardiogram', unit: 'dB' },
    'EMG1': { displayName: 'EMG Channel 1', unit: 'mV' },
    'EMG2': { displayName: 'EMG Channel 2', unit: 'mV' },
    'MYOMETER': { displayName: 'MYOMETER - Muscle Strength', unit: 'N' },
    'SPIRO': { displayName: 'SPIRO - Spirometry', unit: 'L/min' },
    'TEMPERATURE': { displayName: 'TEMPERATURE - Body', unit: '°C' },
    'NIBP': { displayName: 'NIBP - Blood Pressure', unit: 'mmHg' },
    'OXYGEN': { displayName: 'Oxygen Saturation', unit: '%' },
    'EEG CH11': { displayName: 'EEG Channel 11', unit: 'μV' },
    'EEG CH12': { displayName: 'EEG Channel 12', unit: 'μV' },
    'EEG CH13': { displayName: 'EEG Channel 13', unit: 'μV' },
    'EEG CH14': { displayName: 'EEG Channel 14', unit: 'μV' },
    'EEG CH15': { displayName: 'EEG Channel 15', unit: 'μV' },
    'EEG CH16': { displayName: 'EEG Channel 16', unit: 'μV' }
  };

  Object.entries(data).forEach(([key, values]) => {
    let value: number;

    if (key === 'ECG' || key.includes('EEG')) {
      const lastValues = values.slice(-10);
      value = lastValues.reduce((sum, val) => sum + val, 0) / lastValues.length;
    } else {
      value = values[values.length - 1] || 0;
    }

    // Calculate change using last two values (if available)
    let change = 0;
    if (values.length >= 2) {
      const latest = values[values.length - 1];
      const prev = values[values.length - 2];
      change = ((latest - prev) / (prev || 1)) * 100;
    }

    // Determine sensor status
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    switch (key) {
      case 'ECG':
        if (value > 120) status = 'critical';
        else if (value > 100) status = 'warning';
        break;
      case 'TEMPERATURE':
        if (value > 38.5) status = 'critical';
        else if (value > 37.5) status = 'warning';
        break;
      case 'OXYGEN':
        if (value < 90) status = 'critical';
        else if (value < 95) status = 'warning';
        break;
      case 'NIBP':
        if (value > 140) status = 'critical';
        else if (value > 120) status = 'warning';
        break;
      case 'PPG':
        if (value > 160) status = 'critical';
        else if (value > 140) status = 'warning';
        break;
      default:
        status = 'normal'; // EEG, EMG, etc., no random status
    }

    const config = sensorConfig[key] || { displayName: key, unit: '' };

    result[key] = {
      name: key,
      displayName: config.displayName,
      value,
      unit: config.unit,
      status,
      change,
      chartData: values
    };
  });

  return result;
};
