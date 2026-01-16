import { TrendingUp, TrendingDown } from 'lucide-react';
import { Holding } from '@/hooks/usePortfolio';
import { CryptoPrice } from '@/types/crypto';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HoldingsTableProps {
  holdings: Holding[];
  prices: CryptoPrice[];
  isLoading: boolean;
}

export function HoldingsTable({ holdings, prices, isLoading }: HoldingsTableProps) {
  if (isLoading) {
    return (
      <div className="cyber-card p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="cyber-card p-8 text-center">
        <p className="text-muted-foreground font-mono">No holdings yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Execute trades to build your portfolio
        </p>
      </div>
    );
  }

  const getHoldingValue = (holding: Holding) => {
    const price = prices.find(p => p.id === holding.symbol);
    return price ? holding.quantity * price.price : holding.quantity * holding.avgBuyPrice;
  };

  const getHoldingPnL = (holding: Holding) => {
    const price = prices.find(p => p.id === holding.symbol);
    if (!price) return { pnl: 0, pnlPercent: 0 };
    const costBasis = holding.quantity * holding.avgBuyPrice;
    const currentValue = holding.quantity * price.price;
    const pnl = currentValue - costBasis;
    const pnlPercent = (pnl / costBasis) * 100;
    return { pnl, pnlPercent };
  };

  return (
    <div className="cyber-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-lg font-semibold">Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-mono text-xs">Asset</TableHead>
              <TableHead className="font-mono text-xs text-right">Quantity</TableHead>
              <TableHead className="font-mono text-xs text-right">Avg. Price</TableHead>
              <TableHead className="font-mono text-xs text-right">Current</TableHead>
              <TableHead className="font-mono text-xs text-right">Value</TableHead>
              <TableHead className="font-mono text-xs text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const currentPrice = prices.find(p => p.id === holding.symbol);
              const { pnl, pnlPercent } = getHoldingPnL(holding);
              const value = getHoldingValue(holding);
              const isPositive = pnl >= 0;

              return (
                <TableRow key={holding.id} className="border-border">
                  <TableCell className="font-mono">
                    <div>
                      <div className="font-semibold">{holding.symbol.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">{holding.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${holding.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${currentPrice?.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={cn(
                      "flex items-center justify-end gap-1 font-mono",
                      isPositive ? "text-accent" : "text-destructive"
                    )}>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className={cn(
                      "text-xs font-mono",
                      isPositive ? "text-accent" : "text-destructive"
                    )}>
                      {isPositive ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
