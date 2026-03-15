import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "../types";

interface SettingsState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: "EUR",
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "rebalance-settings-store",
    },
  ),
);
