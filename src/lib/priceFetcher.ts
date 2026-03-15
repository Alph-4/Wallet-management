export interface PriceQuote {
  price: number;
  currency: string;
  updatedAt: Date;
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        currency?: string;
        regularMarketTime?: number;
      };
    }>;
    error?: unknown;
  };
}

const buildYahooChartUrl = (ticker: string) => {
  const encodedTicker = encodeURIComponent(ticker.trim());
  return `/api/yahoo/v8/finance/chart/${encodedTicker}?interval=1d&range=1d`;
};

export const fetchYahooPrice = async (ticker: string): Promise<PriceQuote | null> => {
  const normalized = ticker.trim();
  if (!normalized) {
    return null;
  }

  const response = await fetch(buildYahooChartUrl(normalized));
  if (!response.ok) {
    throw new Error(`Yahoo request failed (${response.status})`);
  }

  const data = (await response.json()) as YahooChartResponse;
  const meta = data.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;

  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  const marketTime = typeof meta?.regularMarketTime === "number" ? meta.regularMarketTime * 1000 : Date.now();

  return {
    price,
    currency: meta?.currency || "N/A",
    updatedAt: new Date(marketTime),
  };
};

export const validateTicker = async (ticker: string): Promise<boolean> => {
  const result = await fetchYahooPrice(ticker);
  return result !== null;
};
