import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Wallet } from "../types";

interface WalletState {
  wallets: Wallet[];
  activeWalletId: string;
  addWallet: (name: string) => void;
  updateWallet: (walletId: string, patch: Partial<Omit<Wallet, "id" | "createdAt">>) => void;
  deleteWallet: (walletId: string) => void;
  setActiveWallet: (walletId: string) => void;
  setWalletTemplate: (walletId: string, templateId?: string) => void;
  getActiveWallet: () => Wallet | null;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultWallet: Wallet = {
  id: "wallet-default",
  name: "Main Wallet",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallets: [defaultWallet],
      activeWalletId: defaultWallet.id,
      addWallet: (name) => {
        const now = new Date().toISOString();
        const wallet: Wallet = {
          id: uid(),
          name,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          wallets: [...state.wallets, wallet],
        }));
      },
      updateWallet: (walletId, patch) => {
        set((state) => ({
          wallets: state.wallets.map((wallet) =>
            wallet.id === walletId
              ? {
                  ...wallet,
                  ...patch,
                  updatedAt: new Date().toISOString(),
                }
              : wallet,
          ),
        }));
      },
      deleteWallet: (walletId) => {
        set((state) => {
          const wallets = state.wallets.filter((wallet) => wallet.id !== walletId);
          if (wallets.length === 0) {
            return state;
          }

          return {
            wallets,
            activeWalletId: state.activeWalletId === walletId ? wallets[0].id : state.activeWalletId,
          };
        });
      },
      setActiveWallet: (walletId) => set({ activeWalletId: walletId }),
      setWalletTemplate: (walletId, templateId) => {
        set((state) => ({
          wallets: state.wallets.map((wallet) =>
            wallet.id === walletId
              ? {
                  ...wallet,
                  templateId,
                  updatedAt: new Date().toISOString(),
                }
              : wallet,
          ),
        }));
      },
      getActiveWallet: () => {
        const state = get();
        return state.wallets.find((wallet) => wallet.id === state.activeWalletId) ?? null;
      },
    }),
    {
      name: "rebalance-wallet-store",
    },
  ),
);
