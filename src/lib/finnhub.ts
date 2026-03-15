const FINNHUB_BASE_URL = "https://finnhub.io/api/v1/quote";

interface FinnhubQuoteResponse {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export const fetchFinnhubPrice = async (symbol: string, token: string): Promise<number> => {
  const normalized = symbol.trim();
  if (!normalized) {
    throw new Error("Ticker symbol is required");
  }

  if (!token.trim()) {
    throw new Error("Finnhub API key is missing");
  }

  const url = new URL(FINNHUB_BASE_URL);
  url.searchParams.set("symbol", normalized);
  url.searchParams.set("token", token);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Finnhub request failed (${response.status})`);
  }

  const data = (await response.json()) as FinnhubQuoteResponse;
  if (typeof data.c !== "number" || data.c <= 0) {
    throw new Error("Finnhub returned an invalid price");
  }

  return data.c;
};
