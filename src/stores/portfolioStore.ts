import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Asset } from "../types";

interface PortfolioState {
  assets: Asset[];
  addAsset: (asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) => void;
  updateAsset: (assetId: string, patch: Partial<Omit<Asset, "id" | "createdAt">>) => void;
  removeAsset: (assetId: string) => void;
  updateFetchedPrice: (assetId: string, price: number, updatedAt: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      assets: [],
      addAsset: (asset) => {
        const now = new Date().toISOString();
        set((state) => ({
          assets: [
            ...state.assets,
            {
              id: uid(),
              ...asset,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
      },
      updateAsset: (assetId, patch) => {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === assetId
              ? {
                  ...asset,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                }
              : asset,
          ),
        }));
      },
      removeAsset: (assetId) => {
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== assetId),
        }));
      },
      updateFetchedPrice: (assetId, price, updatedAt) => {
        set((state) => ({
          assets: state.assets.map((asset) =>
            asset.id === assetId
              ? {
                  ...asset,
                  fetchedPrice: price,
                  lastUpdatedAt: updatedAt,
                  updatedAt,
                }
              : asset,
          ),
        }));
      },
    }),
    {
      name: "rebalance-portfolio-store",
    },
  ),
);
