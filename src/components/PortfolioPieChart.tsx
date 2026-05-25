import { PieChart } from 'react-minimal-pie-chart';
import type { Category, Asset } from '../types';

interface PortfolioPieChartProps {
  categories: Category[];
  assets: Asset[];
}

export function PortfolioPieChart({ categories, assets }: PortfolioPieChartProps) {
  // Compute value per category
  const data = categories.map((cat) => {
    const value = assets
      .filter((a) => a.categoryId === cat.id)
      .reduce((sum, a) => {
        const price = a.fetchedPrice ?? a.manualPrice;
        return sum + price * a.quantity;
      }, 0);
    return {
      title: cat.name,
      value,
      color: cat.color,
    };
  }).filter((d) => d.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col items-center">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-600">Répartition par catégorie</h3>
      <PieChart
        data={data}
        lineWidth={40}
        label={({ dataEntry }) => `${dataEntry.title}: ${Math.round(dataEntry.percentage)}%`}
        labelStyle={{
          fontSize: '0.7rem',
          fontWeight: 500,
          fill: '#444',
        }}
        labelPosition={70}
        animate
        style={{ height: 220 }}
      />
    </div>
  );
}
