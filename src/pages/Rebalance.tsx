import { useMemo } from "react";
import { RebalanceView } from "../components/RebalanceView";
import { calculateRebalance } from "../lib/rebalance";
import { usePortfolioStore } from "../stores/portfolioStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useTemplateStore } from "../stores/templateStore";
import { useWalletStore } from "../stores/walletStore";

export function RebalancePage() {
  const { assets } = usePortfolioStore();
  const { currency } = useSettingsStore();
  const { getActiveTemplate, getTemplateById } = useTemplateStore();
  const { getActiveWallet } = useWalletStore();
  const activeWallet = getActiveWallet();
  const activeTemplate = (activeWallet?.templateId ? getTemplateById(activeWallet.templateId) : null) ?? getActiveTemplate();

  const result = useMemo(() => {
    if (!activeTemplate || !activeWallet) {
      return null;
    }

    const categoryIds = new Set(activeTemplate.categories.map((category) => category.id));
    const filteredAssets = assets.filter(
      (asset) => (asset.walletId ?? "wallet-default") === activeWallet.id && categoryIds.has(asset.categoryId),
    );
    return calculateRebalance(filteredAssets, activeTemplate.categories);
  }, [assets, activeTemplate, activeWallet]);

  if (!activeWallet) {
    return <p className="text-sm text-zinc-700">Create a wallet first to see rebalancing insights.</p>;
  }

  if (!activeTemplate || !result) {
    return <p className="text-sm text-zinc-700">Create and select a template to see rebalancing insights.</p>;
  }

  return <RebalanceView result={result} currency={currency} />;
}
