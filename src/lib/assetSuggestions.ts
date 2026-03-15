export interface AssetSuggestion {
  name: string;
  ticker: string;
  kind: "Stock" | "ETF" | "Commodity" | "Crypto" | "Cash";
}

export const ASSET_SUGGESTIONS: AssetSuggestion[] = [
  { name: "Apple", ticker: "AAPL", kind: "Stock" },
  { name: "Microsoft", ticker: "MSFT", kind: "Stock" },
  { name: "NVIDIA", ticker: "NVDA", kind: "Stock" },
  { name: "LVMH", ticker: "MC.PA", kind: "Stock" },
  { name: "Airbus", ticker: "AIR.PA", kind: "Stock" },
  { name: "TotalEnergies", ticker: "TTE.PA", kind: "Stock" },
  { name: "ASML", ticker: "ASML.AS", kind: "Stock" },
  { name: "SAP", ticker: "SAP.DE", kind: "Stock" },
  { name: "MSCI World UCITS", ticker: "IWDA.L", kind: "ETF" },
  { name: "S&P 500 UCITS", ticker: "CSPX.L", kind: "ETF" },
  { name: "FTSE All-World", ticker: "VWCE.DE", kind: "ETF" },
  { name: "Euro Gov Bonds", ticker: "EUNA.DE", kind: "ETF" },
  { name: "Physical Gold", ticker: "SGLN.L", kind: "ETF" },
  { name: "Gold Spot", ticker: "OANDA:XAU_USD", kind: "Commodity" },
  { name: "Silver Spot", ticker: "OANDA:XAG_USD", kind: "Commodity" },
  { name: "Bitcoin", ticker: "BINANCE:BTCUSDT", kind: "Crypto" },
  { name: "Ethereum", ticker: "BINANCE:ETHUSDT", kind: "Crypto" },
  { name: "BNB", ticker: "BINANCE:BNBUSDT", kind: "Crypto" },
  { name: "Solana", ticker: "BINANCE:SOLUSDT", kind: "Crypto" },
  { name: "Cash EUR", ticker: "", kind: "Cash" },
  { name: "Cash USD", ticker: "", kind: "Cash" },
  { name: "Cash GBP", ticker: "", kind: "Cash" },
  { name: "Cash CHF", ticker: "", kind: "Cash" },
];
