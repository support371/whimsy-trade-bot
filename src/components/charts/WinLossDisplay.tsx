import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useWinLossRatio } from '@/hooks/usePnLHistory';
import { Target, TrendingUp, TrendingDown, Percent } from 'lucide-react';

export function WinLossDisplay() {
  const { data, isLoading } = useWinLossRatio();

  if (isLoading) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-primary">Win/Loss Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const { wins = 0, losses = 0, winRate = 0, totalPnL = 0 } = data || {};

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Target className="w-5 h-5" />
          Win/Loss Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Win Rate Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Win Rate</span>
            <span className={`font-mono ${winRate >= 50 ? 'text-accent' : 'text-destructive'}`}>
              {winRate}%
            </span>
          </div>
          <Progress value={winRate} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-accent">
              <TrendingUp className="w-4 h-4" />
              <span className="text-2xl font-display">{wins}</span>
            </div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-destructive">
              <TrendingDown className="w-4 h-4" />
              <span className="text-2xl font-display">{losses}</span>
            </div>
            <div className="text-xs text-muted-foreground">Losses</div>
          </div>
          
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1 ${totalPnL >= 0 ? 'text-accent' : 'text-destructive'}`}>
              <Percent className="w-4 h-4" />
              <span className="text-lg font-display">
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(0)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">Total P&L</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
