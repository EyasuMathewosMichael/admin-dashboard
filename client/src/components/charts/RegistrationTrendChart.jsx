import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function RegistrationTrendChart({ data, dark }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const gridColor  = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const labelColor = dark ? '#94a3b8' : '#6b7280';

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [{
      label: 'Registrations',
      data: data.map(d => d.count),
      borderColor: '#2563eb',
      backgroundColor: dark ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.08)',
      tension: 0.35,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: labelColor, font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: labelColor, precision: 0, font: { size: 11 } },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
