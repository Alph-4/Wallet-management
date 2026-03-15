import { useState } from "react";
import { PieChart, Settings, SlidersHorizontal, Wallet } from "lucide-react";
import { PortfolioPage } from "./pages/Portfolio";
import { RebalancePage } from "./pages/Rebalance";
import { SettingsPage } from "./pages/Settings";
import { TemplatesPage } from "./pages/Templates";
import { Button } from "./components/ui/button";

type TabKey = "portfolio" | "rebalance" | "templates" | "settings";

function App() {
  const [tab, setTab] = useState<TabKey>("portfolio");

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl p-4 md:p-8">
      <header className="mb-6 rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Personal Tooling</p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-900 md:text-4xl">Portfolio Rebalancer</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Build templates, track assets, pull Finnhub quotes, and generate category-level BUY/SELL actions.
        </p>
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
        <Button variant={tab === "settings" ? "default" : "secondary"} onClick={() => setTab("settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </nav>

      <main>
        {tab === "portfolio" ? <PortfolioPage /> : null}
        {tab === "rebalance" ? <RebalancePage /> : null}
        {tab === "templates" ? <TemplatesPage /> : null}
        {tab === "settings" ? <SettingsPage /> : null}
      </main>
    </div>
  );
}

export default App;
