import { useMemo, useState, useCallback } from "react";
import { Auth } from "../components/Auth";
import { AssetForm } from "../components/AssetForm";
import { PortfolioTable } from "../components/PortfolioTable";
import { PortfolioPieChart } from "../components/PortfolioPieChart";
import { fetchYahooPrice } from "../lib/priceFetcher";
import { usePortfolioStore } from "../stores/portfolioStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useTemplateStore } from "../stores/templateStore";
import { useWalletStore } from "../stores/walletStore";

import type { Asset } from "../types";

export function PortfolioPage() {

  const [user, setUser] = useState<any>(null);
  const { assets, addAsset, removeAsset, updateAsset, updateFetchedPrice, setUser: setUserStore } = usePortfolioStore();
  const { setUser: setTemplateUser, getActiveTemplate, getTemplateById } = useTemplateStore();
  const { setUser: setWalletUser, getActiveWallet } = useWalletStore();
  const { currency } = useSettingsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Hydrate all stores on login
  const handleUser = useCallback((u: any) => {
    setUser(u);
    setUserStore(u);
    setTemplateUser(u);
    setWalletUser(u);
  }, [setUserStore, setTemplateUser, setWalletUser]);

  const activeWallet = getActiveWallet();
  const activeTemplate = (activeWallet?.templateId ? getTemplateById(activeWallet.templateId) : null) ?? getActiveTemplate();

  const assetsInActiveTemplate = useMemo(() => {
    if (!activeTemplate || !activeWallet) {
      return [];
    }
    const categoryIds = new Set(activeTemplate.categories.map((category) => category.id));
    return assets.filter(
      (asset) => (asset.walletId ?? "wallet-default") === activeWallet.id && categoryIds.has(asset.categoryId),
    );
  }, [assets, activeTemplate, activeWallet]);

  const refreshOne = async (asset: Asset) => {
    if (!asset.ticker) {
      return;
    }

    const quote = await fetchYahooPrice(asset.ticker);
    if (!quote) {
      return;
    }
    updateFetchedPrice(asset.id, quote.price, quote.updatedAt.toISOString());
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

  const addAssetWithAutoPrice = async (asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) => {
    const payload: Omit<Asset, "id" | "createdAt" | "updatedAt"> = {
      ...asset,
      walletId: activeWallet?.id,
      ticker: asset.ticker?.trim() || undefined,
    };

    if (payload.ticker) {
      try {
        const quote = await fetchYahooPrice(payload.ticker);
        if (quote) {
          payload.fetchedPrice = quote.price;
          payload.lastUpdatedAt = quote.updatedAt.toISOString();
        }
      } catch {
        // Keep manual price if live fetch fails so asset can still be created.
      }
    }

    addAsset(payload);
  };


  if (!user) {
    return <Auth onUser={handleUser} />;
  }
  if (!activeWallet) {
    return <p className="text-sm text-zinc-700">Create a wallet first.</p>;
  }
  if (!activeTemplate) {
    return <p className="text-sm text-zinc-700">Create a template before adding assets.</p>;
  }

  return (
    <div className="space-y-5">
      <AssetForm categories={activeTemplate.categories} onSubmit={addAssetWithAutoPrice} />
      <PortfolioPieChart categories={activeTemplate.categories} assets={assetsInActiveTemplate} />
      <PortfolioTable
        assets={assetsInActiveTemplate}
        categories={activeTemplate.categories}
        currency={currency}
        onRefreshAsset={refreshOne}
        onRefreshAll={refreshAll}
        onDeleteAsset={removeAsset}
        onUpdateAsset={updateAsset}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
