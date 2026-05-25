import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Asset } from "../types";
import { saveDoc, deleteDocFS, syncCollection } from "../lib/firestoreSync";

interface PortfolioState {
  assets: Asset[];
  addAsset: (asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) => void;
  updateAsset: (assetId: string, patch: Partial<Omit<Asset, "id" | "createdAt">>) => void;
  removeAsset: (assetId: string) => void;
  updateFetchedPrice: (assetId: string, price: number, updatedAt: string) => void;
  syncFromFirestore: (uid: string) => Promise<void>;
  setUser: (user: any) => void;
}

const localUid = () => Math.random().toString(36).slice(2, 10);

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => {
      let currentUid: string | null = null;
      return {
        assets: [],
        addAsset: async (asset) => {
          const now = new Date().toISOString();
          const userId = currentUid;
          const newAsset = {
            id: localUid(),
            ...asset,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({ assets: [...state.assets, newAsset] }));
          if (userId) await saveDoc(userId, "assets", newAsset);
        },
        updateAsset: async (assetId, patch) => {
          set((state) => {
            const updated = state.assets.map((asset) =>
              asset.id === assetId
                ? { ...asset, ...patch, updatedAt: new Date().toISOString() }
                : asset,
            );
            if (currentUid) {
              const changed = updated.find((a) => a.id === assetId);
              if (changed) saveDoc(currentUid, "assets", changed);
            }
            return { assets: updated };
          });
        },
        removeAsset: async (assetId) => {
          set((state) => ({ assets: state.assets.filter((asset) => asset.id !== assetId) }));
          if (currentUid) await deleteDocFS(currentUid, "assets", assetId);
        },
        updateFetchedPrice: async (assetId, price, updatedAt) => {
          set((state) => {
            const updated = state.assets.map((asset) =>
              asset.id === assetId
                ? { ...asset, fetchedPrice: price, lastUpdatedAt: updatedAt, updatedAt }
                : asset,
            );
            if (currentUid) {
              const changed = updated.find((a) => a.id === assetId);
              if (changed) saveDoc(currentUid, "assets", changed);
            }
            return { assets: updated };
          });
        },
        syncFromFirestore: async (uid: string) => {
          currentUid = uid;
          await syncCollection(uid, "assets", get().assets, (arr) => set({ assets: arr }));
        },
        setUser: (user: any) => {
          if (user?.uid) get().syncFromFirestore(user.uid);
        },
      };
    },
    {
      name: "rebalance-portfolio-store",
    },
  ),
);
