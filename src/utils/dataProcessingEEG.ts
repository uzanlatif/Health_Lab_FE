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
    'EEG_1': { displayName: 'LEAD_I', unit: 'BPM' },
    'EEG_2': { displayName: 'LEAD_II', unit: 'mmHg' },
    'EEG_3': { displayName: 'LEAD_III', unit: 'dB' },
    'EEG_4': { displayName: 'AVR', unit: 'mV' },
    'EEG_5': { displayName: 'AVL', unit: 'mV' },
    'EEG_6': { displayName: 'AVF', unit: 'N' },
    'EEG_7': { displayName: 'V1', unit: 'L/min' },
    'EEG_8': { displayName: 'V2', unit: '°C' },
    'EEG_9': { displayName: 'V3', unit: 'mmHg' },
    'EEG_10': { displayName: 'V4', unit: '%' },
    'EEG_12': { displayName: 'V5', unit: 'μV' },
    'EEG_13': { displayName: 'V6', unit: 'μV' },
    'EEG_14': { displayName: 'V6', unit: 'μV' },
    'EEG_15': { displayName: 'V6', unit: 'μV' },
    'EEG_16': { displayName: 'V6', unit: 'μV' },
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
