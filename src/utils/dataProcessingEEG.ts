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
    'EEG_1': { displayName: 'EEG_1', unit: 'BPM' },
    'EEG_2': { displayName: 'EEG_2', unit: 'mmHg' },
    'EEG_3': { displayName: 'EEG_3', unit: 'dB' },
    'EEG_4': { displayName: 'EEG_4', unit: 'mV' },
    'EEG_5': { displayName: 'EEG_5', unit: 'mV' },
    'EEG_6': { displayName: 'EEG_6', unit: 'N' },
    'EEG_7': { displayName: 'EEG_7', unit: 'L/min' },
    'EEG_8': { displayName: 'EEG_8', unit: '°C' },
    'EEG_9': { displayName: 'EEG_9', unit: 'mmHg' },
    'EEG_10': { displayName: 'EEG_10', unit: '%' },
    'EEG_12': { displayName: 'EEG_12', unit: 'μV' },
    'EEG_13': { displayName: 'EEG_13', unit: 'μV' },
    'EEG_14': { displayName: 'EEG_14', unit: 'μV' },
    'EEG_15': { displayName: 'EEG_15', unit: 'μV' },
    'EEG_16': { displayName: 'EEG_16', unit: 'μV' },
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
