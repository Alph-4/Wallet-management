import { useMemo } from "react";
import { RebalanceView } from "../components/RebalanceView";
import { calculateRebalance } from "../lib/rebalance";
import { usePortfolioStore } from "../stores/portfolioStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useTemplateStore } from "../stores/templateStore";

export function RebalancePage() {
  const { assets } = usePortfolioStore();
  const { currency } = useSettingsStore();
  const { getActiveTemplate } = useTemplateStore();
  const activeTemplate = getActiveTemplate();

  const result = useMemo(() => {
    if (!activeTemplate) {
      return null;
    }

    const categoryIds = new Set(activeTemplate.categories.map((category) => category.id));
    const filteredAssets = assets.filter((asset) => categoryIds.has(asset.categoryId));
    return calculateRebalance(filteredAssets, activeTemplate.categories);
  }, [assets, activeTemplate]);

  if (!activeTemplate || !result) {
    return <p className="text-sm text-zinc-700">Create and select a template to see rebalancing insights.</p>;
  }

  return <RebalanceView result={result} currency={currency} />;
}
