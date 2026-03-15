import { useMemo, useState } from "react";
import { AssetForm } from "../components/AssetForm";
import { PortfolioTable } from "../components/PortfolioTable";
import { fetchFinnhubPrice } from "../lib/finnhub";
import { usePortfolioStore } from "../stores/portfolioStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useTemplateStore } from "../stores/templateStore";
import type { Asset } from "../types";

export function PortfolioPage() {
  const { assets, addAsset, removeAsset, updateFetchedPrice } = usePortfolioStore();
  const { finnhubApiKey, currency } = useSettingsStore();
  const { getActiveTemplate } = useTemplateStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeTemplate = getActiveTemplate();

  const assetsInActiveTemplate = useMemo(() => {
    if (!activeTemplate) {
      return [];
    }
    const categoryIds = new Set(activeTemplate.categories.map((category) => category.id));
    return assets.filter((asset) => categoryIds.has(asset.categoryId));
  }, [assets, activeTemplate]);

  const refreshOne = async (asset: Asset) => {
    if (!asset.ticker) {
      return;
    }

    const price = await fetchFinnhubPrice(asset.ticker, finnhubApiKey);
    updateFetchedPrice(asset.id, price, new Date().toISOString());
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all(
        assetsInActiveTemplate
          .filter((asset) => Boolean(asset.ticker))
          .map(async (asset) => {
            try {
              await refreshOne(asset);
            } catch {
              return null;
            }
          }),
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!activeTemplate) {
    return <p className="text-sm text-zinc-700">Create a template before adding assets.</p>;
  }

  return (
    <div className="space-y-5">
      <AssetForm categories={activeTemplate.categories} onSubmit={addAsset} />
      <PortfolioTable
        assets={assetsInActiveTemplate}
        categories={activeTemplate.categories}
        currency={currency}
        onRefreshAsset={refreshOne}
        onRefreshAll={refreshAll}
        onDeleteAsset={removeAsset}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
