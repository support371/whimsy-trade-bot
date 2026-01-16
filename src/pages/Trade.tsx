import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Navigation } from '@/components/dashboard/Navigation';
import { TradeForm } from '@/components/trading/TradeForm';
import { ExecutionLog } from '@/components/trading/ExecutionLog';
import { PnLDisplay } from '@/components/trading/PnLDisplay';
import { SystemMetrics } from '@/components/trading/SystemMetrics';
import { KillSwitchBanner } from '@/components/trading/KillSwitchBanner';
import { useSystemHealth } from '@/hooks/useTrading';

const Trade = () => {
  const { health, isLoading, resetKillSwitch } = useSystemHealth();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetKillSwitch = async () => {
    setIsResetting(true);
    try {
      await resetKillSwitch();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background scanlines">
      <KillSwitchBanner
        isActive={health?.kill_switch_active || false}
        reason={health?.kill_switch_reason}
        onReset={handleResetKillSwitch}
        isResetting={isResetting}
      />
      
      <Header onSettingsClick={() => {}} />
      <Navigation />

      <main className="container mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="cyber-card p-6">
              <h2 className="font-display text-xl text-primary mb-6 neon-glow">
                EXECUTE TRADE
              </h2>
              <TradeForm />
            </div>
          </div>

          <div className="lg:col-span-4">
            <ExecutionLog />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <PnLDisplay health={health} isLoading={isLoading} />
            <SystemMetrics health={health} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Trade;
