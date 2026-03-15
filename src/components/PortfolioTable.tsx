import { useState } from "react";
import { Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
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
  onUpdateAsset: (assetId: string, patch: Partial<Omit<Asset, "id" | "createdAt">>) => void;
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
  onUpdateAsset,
  isRefreshing,
}: PortfolioTableProps) {
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    name: string;
    categoryId: string;
    ticker: string;
    quantity: number;
    manualPrice: number;
  } | null>(null);

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  const startEdit = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setDraft({
      name: asset.name,
      categoryId: asset.categoryId,
      ticker: asset.ticker ?? "",
      quantity: asset.quantity,
      manualPrice: asset.manualPrice,
    });
  };

  const cancelEdit = () => {
    setEditingAssetId(null);
    setDraft(null);
  };

  const saveEdit = (assetId: string) => {
    if (!draft) {
      return;
    }

    if (!draft.name.trim() || draft.quantity <= 0 || draft.manualPrice < 0) {
      return;
    }

    onUpdateAsset(assetId, {
      name: draft.name.trim(),
      categoryId: draft.categoryId,
      ticker: draft.ticker.trim() || undefined,
      quantity: draft.quantity,
      manualPrice: draft.manualPrice,
    });
    cancelEdit();
  };

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
            const isEditing = editingAssetId === asset.id && draft !== null;
            const price = resolveAssetPrice(asset);
            const value = price * asset.quantity;
            return (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">
                  {isEditing ? (
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        setDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                      }
                    />
                  ) : (
                    asset.name
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={draft.categoryId}
                      onChange={(event) =>
                        setDraft((prev) => (prev ? { ...prev, categoryId: event.target.value } : prev))
                      }
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    categoryMap.get(asset.categoryId) ?? "Unknown"
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={draft.ticker}
                      onChange={(event) =>
                        setDraft((prev) => (prev ? { ...prev, ticker: event.target.value.toUpperCase() } : prev))
                      }
                    />
                  ) : (
                    asset.ticker ?? "-"
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      step={0.0001}
                      value={draft.quantity}
                      onChange={(event) =>
                        setDraft((prev) => (prev ? { ...prev, quantity: Number(event.target.value) } : prev))
                      }
                    />
                  ) : (
                    asset.quantity.toFixed(4)
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      step={0.0001}
                      value={draft.manualPrice}
                      onChange={(event) =>
                        setDraft((prev) => (prev ? { ...prev, manualPrice: Number(event.target.value) } : prev))
                      }
                    />
                  ) : (
                    formatMoney(price, currency)
                  )}
                </TableCell>
                <TableCell>{formatMoney(value, currency)}</TableCell>
                <TableCell>
                  {asset.lastUpdatedAt ? new Date(asset.lastUpdatedAt).toLocaleString() : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button size="sm" onClick={() => saveEdit(asset.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="secondary" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => startEdit(asset)}>
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={!asset.ticker || isRefreshing}
                          onClick={() => onRefreshAsset(asset)}
                        >
                          <RefreshCcw className="mr-1 h-4 w-4" />
                          Refresh
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDeleteAsset(asset.id)}>
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
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
