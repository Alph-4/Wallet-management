import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "../types";

interface SettingsState {
  finnhubApiKey: string;
  currency: Currency;
  setFinnhubApiKey: (key: string) => void;
  setCurrency: (currency: Currency) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      finnhubApiKey: "",
      currency: "EUR",
      setFinnhubApiKey: (finnhubApiKey) => set({ finnhubApiKey }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "rebalance-settings-store",
    },
  ),
);
