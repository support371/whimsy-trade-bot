import { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePnLHistory } from '@/hooks/usePnLHistory';
import { TrendingUp, TrendingDown } from 'lucide-react';

function PnLChartImpl() {
  const { data: pnlHistory, isLoading } = usePnLHistory();

  const { latestPnL, isPositive } = useMemo(() => {
    if (!pnlHistory?.length) return { latestPnL: 0, isPositive: true };
    const latest = pnlHistory[pnlHistory.length - 1];
    return {
      latestPnL: latest.cumulative,
      isPositive: latest.cumulative >= 0,
    };
  }, [pnlHistory]);

  if (isLoading) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-primary">Cumulative P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!pnlHistory?.length) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-primary">Cumulative P&L</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No trade data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cyber-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Cumulative P&L
        </CardTitle>
        <div className={`flex items-center gap-2 text-lg font-mono ${isPositive ? 'text-accent' : 'text-destructive'}`}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          {isPositive ? '+' : ''}${latestPnL.toFixed(2)}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={pnlHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGradientPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pnlGradientNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke={isPositive ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'}
              strokeWidth={2}
              fill={isPositive ? 'url(#pnlGradientPositive)' : 'url(#pnlGradientNegative)'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
export const PnLChart = memo(PnLChartImpl);
