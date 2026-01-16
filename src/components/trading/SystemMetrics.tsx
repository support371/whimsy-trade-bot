import { Activity, AlertTriangle, Server, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { SystemHealth } from '@/types/trading';

interface SystemMetricsProps {
  health: SystemHealth | null;
  isLoading?: boolean;
}

export function SystemMetrics({ health, isLoading }: SystemMetricsProps) {
  if (isLoading || !health) {
    return (
      <div className="cyber-card p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-6 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const apiErrorPercent = (health.api_error_count / health.thresholds.max_api_errors) * 100;
  const failedOrderPercent = (health.failed_order_count / health.thresholds.max_failed_orders) * 100;

  return (
    <div className="cyber-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm text-primary">SYSTEM METRICS</h3>
        </div>
        <div className={`flex items-center gap-2 text-xs font-mono ${
          health.system_status === 'OPERATIONAL' ? 'text-accent' : 'text-destructive'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            health.system_status === 'OPERATIONAL' ? 'bg-accent animate-pulse' : 'bg-destructive'
          }`} />
          {health.system_status}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              API Errors
            </span>
            <span className="font-mono">
              {health.api_error_count} / {health.thresholds.max_api_errors}
            </span>
          </div>
          <Progress 
            value={apiErrorPercent} 
            className={apiErrorPercent >= 80 ? 'bg-destructive/20' : ''}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Failed Orders
            </span>
            <span className="font-mono">
              {health.failed_order_count} / {health.thresholds.max_failed_orders}
            </span>
          </div>
          <Progress 
            value={failedOrderPercent}
            className={failedOrderPercent >= 80 ? 'bg-destructive/20' : ''}
          />
        </div>

        <div className="pt-2 border-t border-border grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Mode</span>
            <div className={`font-mono mt-1 ${
              health.trading_mode === 'live' ? 'text-destructive' : 'text-accent'
            }`}>
              {health.trading_mode.toUpperCase()}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Kill Switch</span>
            <div className={`font-mono mt-1 ${
              health.kill_switch_active ? 'text-destructive' : 'text-accent'
            }`}>
              {health.kill_switch_active ? 'ACTIVE' : 'INACTIVE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
