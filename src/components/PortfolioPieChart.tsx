
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


        // Répartition par pays
        // Palette de couleurs (20 couleurs)
        const PALETTE = [
            '#2563eb', '#d97706', '#059669', '#be185d', '#7c3aed', '#f59e42', '#10b981', '#f43f5e', '#6366f1', '#fbbf24',
            '#22d3ee', '#f87171', '#a3e635', '#f472b6', '#facc15', '#38bdf8', '#eab308', '#14b8a6', '#e11d48', '#a21caf',
        ];
        const countryMap = new Map<string, { value: number, code: string }>();
        assets.forEach((a) => {
            const price = a.fetchedPrice ?? a.manualPrice;
            const v = price * a.quantity;
            if (!a.country) return;
            if (!countryMap.has(a.country)) countryMap.set(a.country, { value: 0, code: a.country });
            countryMap.get(a.country)!.value += v;
        });
        const countryData = Array.from(countryMap.values())
            .filter((d) => d.value > 0)
            .map((d, i) => ({
                title: d.code,
                value: d.value,
                color: PALETTE[i % PALETTE.length],
            }));

        if (data.length === 0 && countryData.length === 0) return null;

        return (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm flex flex-col items-center gap-8">
                {data.length > 0 && (
                    <div className="flex flex-col items-center w-full">
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
                )}
                {countryData.length > 0 && (
                    <div className="flex flex-col items-center w-full">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-600">Répartition par pays</h3>
                        <PieChart
                            data={countryData}
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
                        <div className="flex flex-wrap gap-2 mt-2 justify-center">
                            {countryData.map((d) => (
                                <span key={d.title} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: d.color + '22' }}>
                                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }} />
                                    {d.title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
}
