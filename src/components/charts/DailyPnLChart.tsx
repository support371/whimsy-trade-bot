import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePnLHistory } from '@/hooks/usePnLHistory';
import { BarChart3 } from 'lucide-react';

function DailyPnLChartImpl() {
  const { data: pnlHistory, isLoading } = usePnLHistory();

  if (isLoading) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-primary">Daily P&L</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!pnlHistory?.length) {
    return (
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-primary">Daily P&L</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">No trade data available</p>
        </CardContent>
      </Card>
    );
  }

  // Take last 14 days
  const recentData = pnlHistory.slice(-14);

  return (
    <Card className="cyber-card">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Daily P&L
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={recentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
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
              formatter={(value: number, name: string) => {
                if (name === 'pnl') return [`$${value.toFixed(2)}`, 'Daily P&L'];
                return [value, 'Trades'];
              }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {recentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
export const DailyPnLChart = memo(DailyPnLChartImpl);
