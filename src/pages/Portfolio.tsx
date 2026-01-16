import { Header } from '@/components/dashboard/Header';
import { Navigation } from '@/components/dashboard/Navigation';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { AllocationChart } from '@/components/portfolio/AllocationChart';
import { TradeHistory } from '@/components/portfolio/TradeHistory';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useState } from 'react';
import { SettingsModal, UserSettings, DEFAULT_SETTINGS } from '@/components/dashboard/SettingsModal';
import { toast } from 'sonner';

const Portfolio = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  
  const { prices } = useCryptoPrices();
  const { 
    portfolio, 
    holdings, 
    trades, 
    isLoading, 
    error, 
    totalPnL, 
    openTradesCount 
  } = usePortfolio();

  const handleSettingsChange = (newSettings: UserSettings) => {
    setSettings(newSettings);
    toast.success('Settings updated successfully');
  };

  // Calculate cash balance (portfolio balance minus holdings value)
  const holdingsValue = holdings.reduce((sum, h) => {
    const price = prices.find(p => p.id === h.symbol);
    return sum + (price ? h.quantity * price.price : h.quantity * h.avgBuyPrice);
  }, 0);
  const cashBalance = (portfolio?.currentBalance || 10000) - holdingsValue;

  return (
    <div className="min-h-screen bg-background scanlines">
      <Header onSettingsClick={() => setSettingsOpen(true)} />
      <Navigation />
      
      <main className="container mx-auto p-4 lg:p-6 space-y-6">
        {error && (
          <div className="cyber-card p-4 border-destructive bg-destructive/10">
            <p className="text-destructive font-mono text-sm">⚠ {error}</p>
          </div>
        )}

        <PortfolioSummary 
          portfolio={portfolio}
          totalPnL={totalPnL}
          openTradesCount={openTradesCount}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HoldingsTable 
              holdings={holdings} 
              prices={prices}
              isLoading={isLoading}
            />
          </div>
          <div>
            <AllocationChart 
              holdings={holdings}
              prices={prices}
              cashBalance={Math.max(0, cashBalance)}
              isLoading={isLoading}
            />
          </div>
        </div>

        <TradeHistory trades={trades} isLoading={isLoading} />
      </main>

      <footer className="border-t border-border bg-muted/20 py-4 mt-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground font-mono">
          <span>LOVABLE AI RISK AGENT v1.0 // PORTFOLIO TRACKER</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            SYSTEM OPERATIONAL
          </span>
        </div>
      </footer>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
};

export default Portfolio;
