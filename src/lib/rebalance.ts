import type {
  Asset,
  Category,
  RebalanceAssetSuggestion,
  RebalanceResult,
} from "../types";

export const resolveAssetPrice = (asset: Asset): number => {
  if (asset.ticker && typeof asset.fetchedPrice === "number" && asset.fetchedPrice > 0) {
    return asset.fetchedPrice;
  }

  return Math.max(0, asset.manualPrice || 0);
};

export const getAssetMarketValue = (asset: Asset): number => {
  const quantity = Number.isFinite(asset.quantity) ? asset.quantity : 0;
  return Math.max(0, quantity) * resolveAssetPrice(asset);
};

export const calculateRebalance = (assets: Asset[], categories: Category[]): RebalanceResult => {
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const assetsByCategory = new Map<string, Asset[]>();
  categories.forEach((category) => assetsByCategory.set(category.id, []));

  assets.forEach((asset) => {
    if (!assetsByCategory.has(asset.categoryId)) {
      assetsByCategory.set(asset.categoryId, []);
    }
    assetsByCategory.get(asset.categoryId)?.push(asset);
  });

  const categoryCurrentValue = new Map<string, number>();
  let totalValue = 0;

  assetsByCategory.forEach((categoryAssets, categoryId) => {
    const value = categoryAssets.reduce((sum, asset) => sum + getAssetMarketValue(asset), 0);
    categoryCurrentValue.set(categoryId, value);
    totalValue += value;
  });

  const categoriesSnapshot = categories.map((category) => {
    const currentValue = categoryCurrentValue.get(category.id) ?? 0;
    const currentPercent = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
    const targetValue = (category.targetPercent / 100) * totalValue;
    const delta = targetValue - currentValue;

    const action = delta > 0.01 ? "BUY" : delta < -0.01 ? "SELL" : "HOLD";

    return {
      categoryId: category.id,
      categoryName: category.name,
      color: category.color,
      currentValue,
      currentPercent,
      targetPercent: category.targetPercent,
      deviationPoints: currentPercent - category.targetPercent,
      action,
      actionAmount: Math.abs(delta),
    };
  });

  const assetSuggestions: RebalanceAssetSuggestion[] = [];

  categoriesSnapshot.forEach((snapshot) => {
    const categoryAssets = assetsByCategory.get(snapshot.categoryId) ?? [];
    if (categoryAssets.length === 0 || snapshot.action === "HOLD") {
      return;
    }

    const currentCategoryValue = categoryCurrentValue.get(snapshot.categoryId) ?? 0;

    if (snapshot.action === "BUY") {
      const split = snapshot.actionAmount / categoryAssets.length;
      categoryAssets.forEach((asset) => {
        assetSuggestions.push({
          assetId: asset.id,
          assetName: asset.name,
          categoryId: snapshot.categoryId,
          action: "BUY",
          amount: split,
        });
      });
      return;
    }

    if (currentCategoryValue <= 0) {
      return;
    }

    categoryAssets.forEach((asset) => {
      const weight = getAssetMarketValue(asset) / currentCategoryValue;
      assetSuggestions.push({
        assetId: asset.id,
        assetName: asset.name,
        categoryId: snapshot.categoryId,
        action: "SELL",
        amount: snapshot.actionAmount * weight,
      });
    });
  });

  return {
    totalValue,
    categories: categoriesSnapshot,
    assetSuggestions,
  };
};
