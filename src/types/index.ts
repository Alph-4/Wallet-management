export type Currency = "EUR" | "USD" | "GBP" | "CHF";

export interface Category {
  id: string;
  name: string;
  targetPercent: number;
  color: string;
}

export interface Template {
  id: string;
  name: string;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  name: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  walletId?: string;
  name: string;
  categoryId: string;
  ticker?: string;
  quantity: number;
  manualPrice: number;
  fetchedPrice?: number;
  lastUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioCategorySnapshot {
  categoryId: string;
  categoryName: string;
  color: string;
  currentValue: number;
  currentPercent: number;
  targetPercent: number;
  deviationPoints: number;
  action: "BUY" | "SELL" | "HOLD";
  actionAmount: number;
}

export interface RebalanceAssetSuggestion {
  assetId: string;
  assetName: string;
  categoryId: string;
  action: "BUY" | "SELL" | "HOLD";
  amount: number;
}

export interface RebalanceResult {
  totalValue: number;
  categories: PortfolioCategorySnapshot[];
  assetSuggestions: RebalanceAssetSuggestion[];
}

export interface Transaction {
  id: string;
  assetId: string;
  type: "BUY" | "SELL";
  amount: number;
  createdAt: string;
}
