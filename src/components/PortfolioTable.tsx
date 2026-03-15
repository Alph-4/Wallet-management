import { RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import type { Asset, Category, Currency } from "../types";
import { resolveAssetPrice } from "../lib/rebalance";

interface PortfolioTableProps {
  assets: Asset[];
  categories: Category[];
  currency: Currency;
  onRefreshAsset: (asset: Asset) => Promise<void>;
  onRefreshAll: () => Promise<void>;
  onDeleteAsset: (assetId: string) => void;
  isRefreshing: boolean;
}

const formatMoney = (value: number, currency: Currency) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(value);

export function PortfolioTable({
  assets,
  categories,
  currency,
  onRefreshAsset,
  onRefreshAll,
  onDeleteAsset,
  isRefreshing,
}: PortfolioTableProps) {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900">Portfolio Assets</h3>
        <Button onClick={onRefreshAll} variant="secondary" disabled={isRefreshing || assets.length === 0}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh All
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Ticker</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const price = resolveAssetPrice(asset);
            const value = price * asset.quantity;
            return (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>{categoryMap.get(asset.categoryId) ?? "Unknown"}</TableCell>
                <TableCell>{asset.ticker ?? "-"}</TableCell>
                <TableCell>{asset.quantity.toFixed(4)}</TableCell>
                <TableCell>{formatMoney(price, currency)}</TableCell>
                <TableCell>{formatMoney(value, currency)}</TableCell>
                <TableCell>
                  {asset.lastUpdatedAt ? new Date(asset.lastUpdatedAt).toLocaleString() : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!asset.ticker || isRefreshing}
                      onClick={() => onRefreshAsset(asset)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDeleteAsset(asset.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-zinc-500">
                No assets yet. Add your first holding above.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
