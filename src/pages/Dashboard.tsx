import { Header } from '@/components/dashboard/Header';
import { Navigation } from '@/components/dashboard/Navigation';
import { PnLDisplay } from '@/components/trading/PnLDisplay';
import { SystemMetrics } from '@/components/trading/SystemMetrics';
import { useSystemHealth, useTradingConfig } from '@/hooks/useTrading';
import { Activity, Shield, Wallet, Settings } from 'lucide-react';

const Dashboard = () => {
  const { health, isLoading: healthLoading } = useSystemHealth();
  const { config, isLoading: configLoading } = useTradingConfig();

  return (
    <div className="min-h-screen bg-background scanlines">
      <Header onSettingsClick={() => {}} />
      <Navigation />

      <main className="container mx-auto p-4 lg:p-6 space-y-6">
        <h1 className="font-display text-2xl text-primary neon-glow">
          TRADING DASHBOARD
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="cyber-card p-4 flex items-center gap-4">
            <Wallet className="w-8 h-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">BASE CAPITAL</div>
              <div className="text-xl font-display">${config?.base_capital?.toLocaleString() || '1,000'}</div>
            </div>
          </div>
          <div className="cyber-card p-4 flex items-center gap-4">
            <Shield className="w-8 h-8 text-accent" />
            <div>
              <div className="text-xs text-muted-foreground">MAX RISK/TRADE</div>
              <div className="text-xl font-display">{((config?.max_risk_per_trade || 0.02) * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div className="cyber-card p-4 flex items-center gap-4">
            <Activity className="w-8 h-8 text-secondary" />
            <div>
              <div className="text-xs text-muted-foreground">MAX LEVERAGE</div>
              <div className="text-xl font-display">{config?.max_leverage || 3}x</div>
            </div>
          </div>
          <div className="cyber-card p-4 flex items-center gap-4">
            <Settings className="w-8 h-8 text-warning" />
            <div>
              <div className="text-xs text-muted-foreground">MODE</div>
              <div className={`text-xl font-display ${config?.trading_mode === 'live' ? 'text-destructive' : 'text-accent'}`}>
                {config?.trading_mode?.toUpperCase() || 'PAPER'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PnLDisplay health={health} isLoading={healthLoading} />
          <SystemMetrics health={health} isLoading={healthLoading} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
