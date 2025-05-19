export interface SensorData {
  name: string;
  displayName: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  change: number;
  chartData: { x: Date; y: number }[];
}

export const processSensorData = (
  data: Record<string, { x: Date; y: number }[]>
): Record<string, SensorData> => {
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
    'EEG CH16': { displayName: 'EEG Channel 16', unit: 'μV' },
  };

  Object.entries(data).forEach(([key, values]) => {
    const validValues = values.filter(v => v && typeof v.y === "number");
    const ys = validValues.map((v) => v.y);

    const value =
      key === "ECG" || key.includes("EEG")
        ? ys.slice(-10).reduce((sum, v) => sum + v, 0) / Math.max(ys.slice(-10).length, 1)
        : ys.length > 0 ? ys[ys.length - 1] : 0;

    const latest = ys[ys.length - 1] ?? 0;
    const previous = ys[ys.length - 2] ?? latest;
    const change = ((latest - previous) / (previous || 1)) * 100;

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
    }

    const config = sensorConfig[key] || { displayName: key, unit: '' };

    result[key] = {
      name: key,
      displayName: config.displayName,
      value,
      unit: config.unit,
      status,
      change,
      chartData: validValues,
    };
  });

  return result;
};
