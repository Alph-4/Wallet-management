import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select } from "../components/ui/select";
import { TickerHelp } from "../components/TickerHelp";
import { useSettingsStore } from "../stores/settingsStore";

export function SettingsPage() {
  const { currency, setCurrency } = useSettingsStore();

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>API & Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
              Yahoo Finance price feed is enabled. No API key required.
            </p>
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
          <TickerHelp />
        </CardContent>
      </Card>
    </div>
  );
}
