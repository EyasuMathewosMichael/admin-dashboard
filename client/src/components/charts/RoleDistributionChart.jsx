import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ROLE_COLORS = { admin: '#2563eb', user: '#10b981' };
const FALLBACK_COLOR = '#f59e0b';

export default function RoleDistributionChart({ data, dark }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const borderColor = dark ? '#1e293b' : '#ffffff';
  const labelColor  = dark ? '#94a3b8' : '#6b7280';

  const chartData = {
    labels: data.map(d => d.role),
    datasets: [{
      data: data.map(d => d.count),
      backgroundColor: data.map(d => ROLE_COLORS[d.role] ?? FALLBACK_COLOR),
      borderWidth: 2,
      borderColor,
      hoverOffset: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: labelColor, font: { size: 12 }, padding: 16 },
      },
      tooltip: { enabled: true },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
