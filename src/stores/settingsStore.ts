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
      finnhubApiKey: "cnb2b31r01qks5iut2v0cnb2b31r01qks5iut2vg",
      currency: "EUR",
      setFinnhubApiKey: (finnhubApiKey) => set({ finnhubApiKey }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "rebalance-settings-store",
    },
  ),
);
