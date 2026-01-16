import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { SystemHealth } from '@/types/trading';

interface PnLDisplayProps {
  health: SystemHealth | null;
  isLoading?: boolean;
}

export function PnLDisplay({ health, isLoading }: PnLDisplayProps) {
  if (isLoading || !health) {
    return (
      <div className="cyber-card p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-8 bg-muted rounded w-32" />
        </div>
      </div>
    );
  }

  const dailyPnl = health.daily_pnl || 0;
  const unrealizedPnl = health.unrealized_pnl || 0;
  const realizedPnl = health.realized_pnl || 0;
  const totalPnl = dailyPnl + unrealizedPnl;

  const isPositive = totalPnl >= 0;
  const PnlIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="cyber-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="font-display text-sm text-primary">PROFIT & LOSS</h3>
      </div>

      <div className={`text-3xl font-display font-bold ${isPositive ? 'text-accent neon-glow-green' : 'text-destructive'}`}>
        {isPositive ? '+' : ''}{totalPnl.toFixed(2)}
        <span className="text-sm ml-1 text-muted-foreground">USD</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-muted-foreground">DAILY</span>
          <div className={dailyPnl >= 0 ? 'text-accent' : 'text-destructive'}>
            {dailyPnl >= 0 ? '+' : ''}{dailyPnl.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">UNREALIZED</span>
          <div className={unrealizedPnl >= 0 ? 'text-accent' : 'text-destructive'}>
            {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toFixed(2)}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">REALIZED</span>
          <div className={realizedPnl >= 0 ? 'text-accent' : 'text-destructive'}>
            {realizedPnl >= 0 ? '+' : ''}{realizedPnl.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Orders Today</span>
          <span className="font-mono">{health.stats.orders_today}</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">Rejections Today</span>
          <span className="font-mono text-destructive">{health.stats.rejections_today}</span>
        </div>
      </div>
    </div>
  );
}
