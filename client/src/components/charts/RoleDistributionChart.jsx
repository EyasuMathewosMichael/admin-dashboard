import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

/** Default color palette keyed by role name. */
const ROLE_COLORS = {
  admin: '#2563eb',
  user: '#10b981',
};

const FALLBACK_COLOR = '#f59e0b';

/**
 * Returns a background color for a given role string.
 * Known roles get a fixed color; anything else gets the fallback amber.
 */
function colorForRole(role) {
  return ROLE_COLORS[role] ?? FALLBACK_COLOR;
}

/**
 * RoleDistributionChart
 *
 * Renders a doughnut chart showing the distribution of users across roles.
 *
 * @param {{ data: Array<{ role: string, count: number }> }} props
 */
export default function RoleDistributionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#6b7280',
        }}
      >
        No data available
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.role),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => colorForRole(d.role)),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
}
