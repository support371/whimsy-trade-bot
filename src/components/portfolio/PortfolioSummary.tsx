import { Wallet, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Portfolio } from '@/types/crypto';
import { cn } from '@/lib/utils';

interface PortfolioSummaryProps {
  portfolio: Portfolio | null;
  totalPnL: number;
  openTradesCount: number;
  isLoading: boolean;
}

export function PortfolioSummary({ 
  portfolio, 
  totalPnL, 
  openTradesCount,
  isLoading 
}: PortfolioSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="cyber-card p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-8 bg-muted rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  const pnlPercentage = portfolio 
    ? ((totalPnL / portfolio.startingBalance) * 100)
    : 0;

  const currentValue = portfolio?.currentBalance || 0;
  const startingValue = portfolio?.startingBalance || 10000;
  const overallPnL = currentValue - startingValue;
  const overallPnLPercent = (overallPnL / startingValue) * 100;

  const stats = [
    {
      label: 'Portfolio Value',
      value: `$${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      color: 'text-primary',
    },
    {
      label: 'Total P&L',
      value: `${overallPnL >= 0 ? '+' : ''}$${overallPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      subValue: `${overallPnLPercent >= 0 ? '+' : ''}${overallPnLPercent.toFixed(2)}%`,
      icon: overallPnL >= 0 ? TrendingUp : TrendingDown,
      color: overallPnL >= 0 ? 'text-accent' : 'text-destructive',
    },
    {
      label: 'Realized P&L',
      value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      subValue: `${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(2)}%`,
      icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: totalPnL >= 0 ? 'text-accent' : 'text-destructive',
    },
    {
      label: 'Open Positions',
      value: openTradesCount.toString(),
      icon: Activity,
      color: 'text-secondary',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-mono uppercase">
              {stat.label}
            </span>
            <stat.icon className={cn("w-4 h-4", stat.color)} />
          </div>
          <div className={cn("font-display text-xl font-bold", stat.color)}>
            {stat.value}
          </div>
          {stat.subValue && (
            <div className={cn("text-xs font-mono mt-1", stat.color)}>
              {stat.subValue}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
