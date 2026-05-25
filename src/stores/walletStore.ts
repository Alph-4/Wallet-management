
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Wallet } from "../types";
import { saveDoc, deleteDocFS, syncCollection } from "../lib/firestoreSync";


interface WalletState {
  wallets: Wallet[];
  activeWalletId: string;
  addWallet: (name: string) => Promise<void>;
  updateWallet: (walletId: string, patch: Partial<Omit<Wallet, "id" | "createdAt">>) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
  setActiveWallet: (walletId: string) => void;
  setWalletTemplate: (walletId: string, templateId?: string) => Promise<void>;
  getActiveWallet: () => Wallet | null;
  syncFromFirestore: (uid: string) => Promise<void>;
  setUser: (user: any) => void;
}

const localUid = () => Math.random().toString(36).slice(2, 10);

const defaultWallet: Wallet = {
  id: "wallet-default",
  name: "Main Wallet",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => {
      let currentUid: string | null = null;
      return {
        wallets: [defaultWallet],
        activeWalletId: defaultWallet.id,
        addWallet: async (name) => {
          const now = new Date().toISOString();
          const userId = currentUid;
          const wallet: Wallet = {
            id: localUid(),
            name,
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({
            wallets: [...state.wallets, wallet],
          }));
          if (userId) await saveDoc(userId, "wallets", wallet);
        },
        updateWallet: async (walletId, patch) => {
          set((state) => {
            const updated = state.wallets.map((wallet) =>
              wallet.id === walletId
                ? {
                  ...wallet,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                }
                : wallet,
            );
            if (currentUid) {
              const changed = updated.find((w) => w.id === walletId);
              if (changed) saveDoc(currentUid, "wallets", changed);
            }
            return { wallets: updated };
          });
        },
        deleteWallet: async (walletId) => {
          set((state) => {
            const wallets = state.wallets.filter((wallet) => wallet.id !== walletId);
            const activeWalletId =
              state.activeWalletId === walletId && wallets.length > 0
                ? wallets[0].id
                : state.activeWalletId;
            return {
              wallets,
              activeWalletId,
            };
          });
          if (currentUid) await deleteDocFS(currentUid, "wallets", walletId);
        },
        setActiveWallet: (walletId) => set({ activeWalletId: walletId }),
        setWalletTemplate: async (walletId, templateId) => {
          set((state) => {
            const updated = state.wallets.map((wallet) =>
              wallet.id === walletId
                ? {
                  ...wallet,
                  templateId,
                  updatedAt: new Date().toISOString(),
                }
                : wallet,
            );
            if (currentUid) {
              const changed = updated.find((w) => w.id === walletId);
              if (changed) saveDoc(currentUid, "wallets", changed);
            }
            return { wallets: updated };
          });
        },
        getActiveWallet: () => {
          const state = get();
          return state.wallets.find((wallet) => wallet.id === state.activeWalletId) ?? null;
        },
        syncFromFirestore: async (uid: string) => {
          currentUid = uid;
          await syncCollection(uid, "wallets", get().wallets, (arr) => set({ wallets: arr }));
        },
        setUser: (user: any) => {
          if (user?.uid) get().syncFromFirestore(user.uid);
        },
      };
    },
    {
      name: "rebalance-wallet-store",
    },
  ),
);
