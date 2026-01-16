import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Holding } from '@/hooks/usePortfolio';
import { CryptoPrice } from '@/types/crypto';

interface AllocationChartProps {
  holdings: Holding[];
  prices: CryptoPrice[];
  cashBalance: number;
  isLoading: boolean;
}

const COLORS = [
  'hsl(180, 100%, 50%)',   // cyan
  'hsl(320, 100%, 60%)',   // magenta
  'hsl(145, 100%, 50%)',   // green
  'hsl(55, 100%, 55%)',    // yellow
  'hsl(280, 100%, 60%)',   // purple
  'hsl(35, 100%, 55%)',    // orange
  'hsl(200, 100%, 50%)',   // blue
  'hsl(0, 85%, 55%)',      // red
];

export function AllocationChart({ holdings, prices, cashBalance, isLoading }: AllocationChartProps) {
  if (isLoading) {
    return (
      <div className="cyber-card p-4 h-80">
        <div className="animate-pulse h-full flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  const getHoldingValue = (holding: Holding) => {
    const price = prices.find(p => p.id === holding.symbol);
    return price ? holding.quantity * price.price : holding.quantity * holding.avgBuyPrice;
  };

  const data = [
    ...holdings.map(h => ({
      name: h.symbol.toUpperCase(),
      value: getHoldingValue(h),
    })),
    { name: 'Cash', value: cashBalance },
  ].filter(d => d.value > 0);

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || totalValue === 0) {
    return (
      <div className="cyber-card p-8 h-80 flex items-center justify-center">
        <p className="text-muted-foreground font-mono text-center">
          No allocation data
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = ((item.value / totalValue) * 100).toFixed(1);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-mono text-sm font-semibold">{item.name}</p>
          <p className="font-mono text-xs text-muted-foreground">
            ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="font-mono text-xs text-primary">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cyber-card p-4">
      <h3 className="font-display text-lg font-semibold mb-4">Allocation</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(230, 30%, 8%)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => (
                <span className="font-mono text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
