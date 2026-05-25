import React, { useState, useMemo } from "react";
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
    dividendYield: number;
  } | null>(null);

  // Global edit mode state
  const [isGlobalEditMode, setIsGlobalEditMode] = useState(false);
  const [globalDrafts, setGlobalDrafts] = useState<Record<string, {
    name: string;
    categoryId: string;
    ticker: string;
    quantity: number;
    manualPrice: number;
    dividendYield: number;
  }>>({});

  const cancelEdit = () => {
    setEditingAssetId(null);
    setDraft(null);
  };

  const saveEdit = (assetId: string) => {
    if (!draft) return;
    if (!draft.name.trim() || draft.quantity <= 0 || draft.manualPrice < 0 || draft.dividendYield < 0) return;
    onUpdateAsset(assetId, {
      name: draft.name.trim(),
      categoryId: draft.categoryId,
      ticker: draft.ticker.trim() || undefined,
      quantity: draft.quantity,
      manualPrice: draft.manualPrice,
      dividendYield: draft.dividendYield,
    });
    cancelEdit();
  };

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const categoryColorMap = new Map(categories.map((category) => [category.id, category.color]));

  // Regroup assets by category
  const groupedAssets = useMemo(() => {
    const groups: { category: Category; assets: Asset[] }[] = [];
    categories.forEach((category) => {
      const assetsInCat = assets.filter((a) => a.categoryId === category.id);
      if (assetsInCat.length > 0) {
        groups.push({ category, assets: assetsInCat });
      }
    });
    return groups;
  }, [assets, categories]);

  const startEdit = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setDraft({
      name: asset.name,
      categoryId: asset.categoryId,
      ticker: asset.ticker ?? "",
      quantity: asset.quantity,
      manualPrice: asset.manualPrice,
      dividendYield: asset.dividendYield ?? 0,
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-900">Portfolio Assets</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (!isGlobalEditMode) {
                // Init globalDrafts with current asset values
                const drafts: Record<string, any> = {};
                assets.forEach((a) => {
                  drafts[a.id] = {
                    name: a.name,
                    categoryId: a.categoryId,
                    ticker: a.ticker ?? "",
                    quantity: a.quantity,
                    manualPrice: a.manualPrice,
                    dividendYield: a.dividendYield ?? 0,
                  };
                });
                setGlobalDrafts(drafts);
              }
              setIsGlobalEditMode((v) => !v);
              setEditingAssetId(null);
              setDraft(null);
            }}
            variant={isGlobalEditMode ? "secondary" : "default"}
            disabled={assets.length === 0}
          >
            {isGlobalEditMode ? "Annuler édition globale" : "Éditer tout"}
          </Button>
          <Button onClick={onRefreshAll} variant="secondary" disabled={isRefreshing || assets.length === 0}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh All
          </Button>
        </div>
      </div>
      {/* Calcul du dividende moyen pondéré */}
      {assets.length > 0 && (
        <>
          <div className="mb-2 text-sm text-zinc-700">
            Moyenne pondérée du yield dividende : <span className="font-semibold">
              {(() => {
                const totalValue = assets.reduce((sum, a) => sum + (resolveAssetPrice(a) * a.quantity), 0);
                if (totalValue === 0) return "0%";
                const weightedYield = assets.reduce((sum, a) => {
                  const value = resolveAssetPrice(a) * a.quantity;
                  return sum + value * (a.dividendYield ?? 0) / 100;
                }, 0);
                return `${((weightedYield / totalValue) * 100).toFixed(2)}%`;
              })()}
            </span>
          </div>
          {/* Section dividendes estimés */}
          <div className="mb-4 text-sm text-zinc-700 bg-zinc-50 rounded p-3">
            {(() => {
              const totalValue = assets.reduce((sum, a) => sum + (resolveAssetPrice(a) * a.quantity), 0);
              if (totalValue === 0) return null;
              // Dividende annuel total (en euros)
              const totalDividendsYear = assets.reduce((sum, a) => {
                const value = resolveAssetPrice(a) * a.quantity;
                return sum + value * (a.dividendYield ?? 0) / 100;
              }, 0);
              const totalDividendsMonth = totalDividendsYear / 12;
              const totalDividendsDay = totalDividendsYear / 365;
              const avgDividendsPerAsset = assets.length > 0 ? totalDividendsYear / assets.length : 0;
              const percentOfPortfolio = totalValue > 0 ? (totalDividendsYear / totalValue) * 100 : 0;
              return (
                <>
                  <div className="font-semibold mb-1">Dividendes estimés</div>
                  <div className="flex flex-wrap gap-4">
                    <div>Annuel&nbsp;: <span className="font-semibold">{formatMoney(totalDividendsYear, currency)}</span></div>
                    <div>Mensuel&nbsp;: <span className="font-semibold">{formatMoney(totalDividendsMonth, currency)}</span></div>
                    <div>Quotidien&nbsp;: <span className="font-semibold">{formatMoney(totalDividendsDay, currency)}</span></div>
                    <div>Moyenne/ligne&nbsp;: <span className="font-semibold">{formatMoney(avgDividendsPerAsset, currency)}</span></div>
                    <div>Pourcentage du portefeuille (annualisé)&nbsp;: <span className="font-semibold">{percentOfPortfolio.toFixed(2)}%</span></div>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    <span className="font-semibold">Détail&nbsp;:</span> Somme des (valeur ligne × yield) sur toutes les lignes. Calculs annualisés, bruts, hors fiscalité.
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Ticker</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Yield (%)</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedAssets.map(({ category, assets: catAssets }) => (
            <React.Fragment key={category.id + "-group"}>
              <TableRow key={category.id + "-header"} className="bg-zinc-50">
                <TableCell colSpan={9} className="!p-2 !pl-4 font-semibold text-zinc-700" style={{ borderLeft: `6px solid ${category.color}` }}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </span>
                </TableCell>
              </TableRow>
              {catAssets.map((asset) => {
                const isEditing = editingAssetId === asset.id && draft !== null;
                const isGlobalEditing = isGlobalEditMode && globalDrafts[asset.id];
                const draftData = isGlobalEditing ? globalDrafts[asset.id] : draft;
                const price = resolveAssetPrice(isGlobalEditing ? { ...asset, ...draftData } : asset);
                const value = price * (isGlobalEditing ? draftData.quantity : asset.quantity);
                return (
                  <TableRow key={asset.id} style={{ backgroundColor: `${category.color}10` }}>
                    <TableCell className="font-medium">
                      {isEditing || isGlobalEditing ? (
                        <Input
                          value={draftData.name}
                          onChange={(event) => {
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], name: event.target.value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev));
                            }
                          }}
                        />
                      ) : (
                        asset.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing || isGlobalEditing ? (
                        <Select
                          value={draftData.categoryId}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], categoryId: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, categoryId: value } : prev));
                            }
                          }}
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
                      {isEditing || isGlobalEditing ? (
                        <Input
                          value={draftData.ticker}
                          onChange={(event) => {
                            const value = event.target.value.toUpperCase();
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], ticker: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, ticker: value } : prev));
                            }
                          }}
                        />
                      ) : (
                        asset.ticker ?? "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing || isGlobalEditing ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.0001}
                          value={draftData.quantity}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], quantity: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, quantity: value } : prev));
                            }
                          }}
                        />
                      ) : (
                        asset.quantity.toFixed(4)
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing || isGlobalEditing ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.0001}
                          value={draftData.manualPrice}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], manualPrice: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, manualPrice: value } : prev));
                            }
                          }}
                        />
                      ) : (
                        formatMoney(price, currency)
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMoney(value, currency)}
                    </TableCell>
                    <TableCell>
                      {isEditing || isGlobalEditing ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={draftData.dividendYield}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], dividendYield: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, dividendYield: value } : prev));
                            }
                          }}
                          placeholder="e.g. 2.5"
                          aria-label="Dividend yield"
                        />
                      ) : (
                        asset.dividendYield !== undefined ? `${asset.dividendYield.toFixed(2)}%` : "-"
                      )}
                    </TableCell>
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
                            <Button size="sm" variant="destructive" onClick={() => onDeleteAsset(asset.id)}>
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                            <Button size="sm" onClick={() => onRefreshAsset(asset)} disabled={isRefreshing}>
                              <RefreshCcw className="mr-1 h-4 w-4" />
                              Refresh
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
        {isGlobalEditMode && (
          <tfoot>
            <tr>
              <td colSpan={9} className="!p-2 !pl-4">
                <div className="flex gap-2 justify-end">
                  <Button size="sm" onClick={() => {
                    // Sauvegarder tout : appliquer tous les drafts
                    Object.entries(globalDrafts).forEach(([id, draft]) => {
                      onEditAsset(id, draft);
                    });
                    setIsGlobalEditMode(false);
                    setGlobalDrafts({});
                  }}>
                    Sauvegarder tout
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => {
                    setIsGlobalEditMode(false);
                    setGlobalDrafts({});
                  }}>
                    Annuler tout
                  </Button>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
        <TableBody>
          {groupedAssets.map(({ category, assets: catAssets }) => (
            <>
              <TableRow key={category.id + "-header"} className="bg-zinc-50">
                <TableCell colSpan={9} className="!p-2 !pl-4 font-semibold text-zinc-700" style={{ borderLeft: `6px solid ${category.color}` }}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </span>
                </TableCell>
              </TableRow>
              {catAssets.map((asset) => {
                const isEditing = editingAssetId === asset.id && draft !== null;
                const isGlobalEditing = isGlobalEditMode && globalDrafts[asset.id];
                const draftData = isGlobalEditing ? globalDrafts[asset.id] : draft;
                const price = resolveAssetPrice(isGlobalEditing ? { ...asset, ...draftData } : asset);
                const value = price * (isGlobalEditing ? draftData.quantity : asset.quantity);
                return (
                  <TableRow key={asset.id} style={{ backgroundColor: `${category.color}10` }}>
                    <TableCell className="font-medium">
                      {isEditing || isGlobalEditing ? (
                        <Input
                          value={draftData.name}
                          onChange={(event) => {
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], name: event.target.value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev));
                            }
                          }}
                        />
                      ) : (
                        asset.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing || isGlobalEditing ? (
                        <Select
                          value={draftData.categoryId}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], categoryId: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, categoryId: value } : prev));
                            }
                          }}
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
                      {isEditing || isGlobalEditing ? (
                        <Input
                          value={draftData.ticker}
                          onChange={(event) => {
                            const value = event.target.value.toUpperCase();
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], ticker: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, ticker: value } : prev));
                            }
                          }}
                        />
                      ) : (
                        asset.ticker ?? "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing || isGlobalEditing ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.0001}
                          value={draftData.quantity}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], quantity: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, quantity: value } : prev));
                            }
                          }}
                        />
                      ) : (
                        asset.quantity.toFixed(4)
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing || isGlobalEditing ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.0001}
                          value={draftData.manualPrice}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], manualPrice: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, manualPrice: value } : prev));
                            }
                          }}
                        />
                      ) : (
                        formatMoney(price, currency)
                      )}
                    </TableCell>
                    <TableCell>
                      {formatMoney(value, currency)}
                    </TableCell>
                    <TableCell>
                      {isEditing || isGlobalEditing ? (
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={draftData.dividendYield}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            if (isGlobalEditing) {
                              setGlobalDrafts((prev) => ({
                                ...prev,
                                [asset.id]: { ...prev[asset.id], dividendYield: value },
                              }));
                            } else {
                              setDraft((prev) => (prev ? { ...prev, dividendYield: value } : prev));
                            }
                          }}
                          placeholder="e.g. 2.5"
                          aria-label="Dividend yield"
                        />
                      ) : (
                        asset.dividendYield !== undefined ? `${asset.dividendYield.toFixed(2)}%` : "-"
                      )}
                    </TableCell>
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
                            <Button size="sm" variant="destructive" onClick={() => onDeleteAsset(asset.id)}>
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                            <Button size="sm" onClick={() => onRefreshAsset(asset)} disabled={isRefreshing}>
                              <RefreshCcw className="mr-1 h-4 w-4" />
                              Refresh
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


