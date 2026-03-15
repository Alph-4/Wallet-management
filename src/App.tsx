import { useState } from "react";
import { BriefcaseBusiness, PieChart, Settings, SlidersHorizontal, Wallet } from "lucide-react";
import { PortfolioPage } from "./pages/Portfolio";
import { RebalancePage } from "./pages/Rebalance";
import { SettingsPage } from "./pages/Settings";
import { TemplatesPage } from "./pages/Templates";
import { WalletsPage } from "./pages/Wallets";
import { Button } from "./components/ui/button";
import { Select } from "./components/ui/select";
import { useWalletStore } from "./stores/walletStore";

type TabKey = "portfolio" | "rebalance" | "templates" | "wallets" | "settings";

function App() {
  const [tab, setTab] = useState<TabKey>("portfolio");
  const { wallets, activeWalletId, setActiveWallet } = useWalletStore();
  const activeWallet = wallets.find((wallet) => wallet.id === activeWalletId) ?? wallets[0];

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl p-4 md:p-8">
      <header className="mb-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Personal Tooling</p>
            <h1 className="mt-1 text-3xl font-bold text-zinc-900 md:text-4xl">Portfolio Rebalancer</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600">
              Build templates, track assets, pull Finnhub quotes, and generate category-level BUY/SELL actions.
            </p>
          </div>
          <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Active Wallet</p>
            <Select value={activeWallet?.id ?? ""} onChange={(event) => setActiveWallet(event.target.value)}>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        <Button variant={tab === "portfolio" ? "default" : "secondary"} onClick={() => setTab("portfolio")}>
          <Wallet className="mr-2 h-4 w-4" />
          Portfolio
        </Button>
        <Button variant={tab === "rebalance" ? "default" : "secondary"} onClick={() => setTab("rebalance")}>
          <PieChart className="mr-2 h-4 w-4" />
          Rebalance
        </Button>
        <Button variant={tab === "templates" ? "default" : "secondary"} onClick={() => setTab("templates")}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Templates
        </Button>
        <Button variant={tab === "wallets" ? "default" : "secondary"} onClick={() => setTab("wallets")}>
          <BriefcaseBusiness className="mr-2 h-4 w-4" />
          Wallets
        </Button>
        <Button variant={tab === "settings" ? "default" : "secondary"} onClick={() => setTab("settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>

      <main>
        {tab === "portfolio" ? <PortfolioPage /> : null}
        {tab === "rebalance" ? <RebalancePage /> : null}
        {tab === "templates" ? <TemplatesPage /> : null}
        {tab === "wallets" ? <WalletsPage /> : null}
        {tab === "settings" ? <SettingsPage /> : null}
      </main>
    </div>
  );
}

export default App;
