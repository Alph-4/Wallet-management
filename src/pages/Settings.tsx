import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { useSettingsStore } from "../stores/settingsStore";

export function SettingsPage() {
  const { finnhubApiKey, currency, setFinnhubApiKey, setCurrency } = useSettingsStore();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>API & Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Finnhub API Key</label>
            <Input
              value={finnhubApiKey}
              onChange={(e) => setFinnhubApiKey(e.target.value)}
              placeholder="Paste your Finnhub token"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Display Currency</label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="CHF">CHF</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ticker Cheat Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-zinc-700">
            <li>Stocks: MC.PA, AAPL</li>
            <li>ETFs: IWDA.L</li>
            <li>Gold CFD: OANDA:XAU_USD</li>
            <li>Crypto spot: BINANCE:BTCUSDT</li>
            <li>Cash: keep ticker empty and use manual price</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
