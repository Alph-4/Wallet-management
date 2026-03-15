import type { PortfolioCategorySnapshot } from "../types";

interface AllocationBarProps {
  categories: PortfolioCategorySnapshot[];
}

export function AllocationBar({ categories }: AllocationBarProps) {
  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">
        Current Allocation
      </h3>
      <div className="flex h-6 w-full overflow-hidden rounded-lg bg-zinc-100">
        {categories.map((category) => (
          <div
            key={category.categoryId}
            className="h-full transition-all"
            style={{
              width: `${Math.max(0, category.currentPercent)}%`,
              backgroundColor: category.color,
            }}
            title={`${category.categoryName}: ${category.currentPercent.toFixed(2)}%`}
          />
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <div key={category.categoryId} className="flex items-center gap-2 text-sm text-zinc-700">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
            <span className="font-medium">{category.categoryName}</span>
            <span className="ml-auto tabular-nums">{category.currentPercent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
