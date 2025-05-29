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
    'LEAD_I': { displayName: 'LEAD_I', unit: 'mV' },
    'LEAD_II': { displayName: 'LEAD_II', unit: 'mV' },
    'LEAD_III': { displayName: 'LEAD_III', unit: 'mV' },
    'AVR': { displayName: 'AVR', unit: 'mV' },
    'AVL': { displayName: 'AVL', unit: 'mV' },
    'AVF': { displayName: 'AVF', unit: 'mV' },
    'V1': { displayName: 'V1', unit: 'mV' },
    'V2': { displayName: 'V2', unit: 'mV' },
    'V3': { displayName: 'V3', unit: 'mV' },
    'V4': { displayName: 'V4', unit: 'mV' },
    'V5': { displayName: 'V5', unit: 'mV' },
    'V6': { displayName: 'V6', unit: 'mV' },
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
