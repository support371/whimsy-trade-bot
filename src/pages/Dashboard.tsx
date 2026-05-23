import { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Navigation } from '@/components/dashboard/Navigation';
import { PnLDisplay } from '@/components/trading/PnLDisplay';
import { SystemMetrics } from '@/components/trading/SystemMetrics';
import { PnLChart } from '@/components/charts/PnLChart';
import { DailyPnLChart } from '@/components/charts/DailyPnLChart';
import { TradeDistributionChart } from '@/components/charts/TradeDistributionChart';
import { MarketOverviewPanel } from '@/components/dashboard/MarketOverviewPanel';
import { WinLossDisplay } from '@/components/charts/WinLossDisplay';
import { KillSwitchBanner } from '@/components/trading/KillSwitchBanner';
import { useSystemHealth, useTradingConfig } from '@/hooks/useTrading';
import { useAllRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
import { Activity, Shield, Wallet, Settings, AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { health, isLoading: healthLoading, error: healthError, resetKillSwitch, refetch: refetchHealth } = useSystemHealth();
  const { config, isLoading: configLoading, error: configError, refetch: refetchConfig } = useTradingConfig();
  const [isResetting, setIsResetting] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Enable realtime subscriptions
  useAllRealtimeSubscriptions();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleResetKillSwitch = async () => {
    setIsResetting(true);
    try {
      await resetKillSwitch();
    } finally {
      setIsResetting(false);
    }
  };

  const handleRetry = () => {
    refetchHealth();
    refetchConfig();
  };

  const isLoading = healthLoading || configLoading;
  const hasError = healthError || configError;

  // Offline state
  if (isOffline) {
    return (
      <div className="min-h-screen bg-background scanlines">
        <Header onSettingsClick={() => {}} />
        <Navigation />
        <main className="container mx-auto p-4 lg:p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="cyber-card p-8 text-center max-w-md">
              <WifiOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl text-foreground mb-2">You&apos;re Offline</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Please check your internet connection to access the trading dashboard.
              </p>
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (hasError && !isLoading) {
    return (
      <div className="min-h-screen bg-background scanlines">
        <Header onSettingsClick={() => {}} />
        <Navigation />
        <main className="container mx-auto p-4 lg:p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="cyber-card p-8 text-center max-w-md border-destructive/50">
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="font-display text-xl text-foreground mb-2">Failed to Load Data</h2>
              <p className="text-muted-foreground text-sm mb-4">
                {healthError || configError || 'Unable to connect to the trading system.'}
              </p>
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background scanlines">
        <Header onSettingsClick={() => {}} />
        <Navigation />
        <main className="container mx-auto p-4 lg:p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background scanlines">
      {/* Kill Switch Banner - Always visible when active */}
      <KillSwitchBanner
        isActive={health?.kill_switch_active || false}
        reason={health?.kill_switch_reason}
        onReset={handleResetKillSwitch}
        isResetting={isResetting}
      />

      <Header onSettingsClick={() => {}} />
      <Navigation />

      <main className="container mx-auto p-4 lg:p-6 space-y-6">
        {/* Title with Environment Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="font-display text-2xl text-primary neon-glow">
            TRADING DASHBOARD
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-mono">
              {import.meta.env.MODE === 'production' ? 'PRODUCTION' : 'PREVIEW'}
            </Badge>
            <Badge 
              variant={config?.trading_mode === 'live' ? 'destructive' : 'secondary'}
              className="font-mono"
            >
              {config?.trading_mode === 'live' ? 'LIVE TRADING' : 'PAPER TRADING'}
            </Badge>
            {health?.kill_switch_active && (
              <Badge variant="destructive" className="font-mono animate-pulse">
                EMERGENCY STOP ACTIVE
              </Badge>
            )}
          </div>
        </div>

        {/* Risk Warning Banner */}
        {config?.trading_mode === 'live' && (
          <div className="cyber-card p-4 border-destructive bg-destructive/10">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
              <div>
                <p className="text-destructive font-display font-bold">LIVE TRADING MODE</p>
                <p className="text-destructive/80 text-sm">Real funds are at risk. All trades will be executed on the exchange.</p>
              </div>
            </div>
          </div>
        )}

        {/* Paper Mode Info */}
        {config?.trading_mode !== 'live' && (
          <div className="cyber-card p-3 border-accent/30 bg-accent/5">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent flex-shrink-0" />
              <p className="text-accent text-sm font-mono">
                Paper trading mode - Simulated trades only, no real money at risk.
              </p>
            </div>
          </div>
        )}

        {/* Config Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="cyber-card p-4 flex items-center gap-4">
            <Wallet className="w-8 h-8 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">BASE CAPITAL</div>
              <div className="text-xl font-display truncate">${config?.base_capital?.toLocaleString() || '1,000'}</div>
            </div>
          </div>
          <div className="cyber-card p-4 flex items-center gap-4">
            <Shield className="w-8 h-8 text-accent flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">MAX RISK/TRADE</div>
              <div className="text-xl font-display">{((config?.max_risk_per_trade || 0.02) * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div className="cyber-card p-4 flex items-center gap-4">
            <Activity className="w-8 h-8 text-secondary flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">MAX LEVERAGE</div>
              <div className="text-xl font-display">{config?.max_leverage || 3}x</div>
            </div>
          </div>
          <div className="cyber-card p-4 flex items-center gap-4">
            <Settings className="w-8 h-8 text-warning flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">MODE</div>
              <div className={`text-xl font-display ${config?.trading_mode === 'live' ? 'text-destructive' : 'text-accent'}`}>
                {config?.trading_mode?.toUpperCase() || 'PAPER'}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Limits Summary */}
        <div className="cyber-card p-4">
          <h3 className="font-display text-sm text-primary mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            ACTIVE RISK LIMITS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Max Daily Loss:</span>
              <span className="font-mono ml-2">${config?.max_daily_loss || 50}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Volatility Limit:</span>
              <span className="font-mono ml-2">{((config?.volatility_limit || 0.05) * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Max Slippage:</span>
              <span className="font-mono ml-2">{((config?.max_slippage || 0.01) * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Kill Switch:</span>
              <span className={`font-mono ml-2 ${health?.kill_switch_active ? 'text-destructive' : 'text-accent'}`}>
                {health?.kill_switch_active ? 'ACTIVE' : 'READY'}
              </span>
            </div>
          </div>
        </div>

        {/* P&L Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PnLDisplay health={health} isLoading={healthLoading} />
          <SystemMetrics health={health} isLoading={healthLoading} />
        </div>

        {/* Global Market Overview (provider integration) */}
        <MarketOverviewPanel />

        {/* Cumulative P&L Chart */}
        <PnLChart />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DailyPnLChart />
          <TradeDistributionChart />
          <WinLossDisplay />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
