export function TickerHelp() {
  return (
    <ul className="space-y-2 text-sm text-zinc-700">
      <li>French stocks (Euronext Paris): ML.PA, MC.PA, BNP.PA, AIR.PA, SAN.PA</li>
      <li>German ETFs (Xetra): EXUS.DE, EXW1.DE, DBXD.DE, VUSA.DE</li>
      <li>Paris-listed ETFs: CW8.PA, PAEEM.PA, MWRD.PA</li>
      <li>London ETFs: IWDA.L, VWRL.L, CSPX.L</li>
      <li>US stocks: AAPL, MSFT, NVDA</li>
      <li>Gold futures: GC=F</li>
      <li>Silver futures: SI=F</li>
      <li>Bitcoin: BTC-USD</li>
      <li>Ethereum: ETH-USD</li>
      <li>Cash/Livret: leave ticker empty and enter price manually</li>
    </ul>
  );
}
