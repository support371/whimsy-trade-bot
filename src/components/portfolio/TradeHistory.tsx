import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Trade } from '@/types/crypto';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface TradeHistoryProps {
  trades: Trade[];
  isLoading: boolean;
}

export function TradeHistory({ trades, isLoading }: TradeHistoryProps) {
  if (isLoading) {
    return (
      <div className="cyber-card p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="cyber-card p-8 text-center">
        <p className="text-muted-foreground font-mono">No trade history</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your executed trades will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="cyber-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-lg font-semibold">Trade History</h3>
      </div>
      <div className="overflow-x-auto max-h-96">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-mono text-xs">Date</TableHead>
              <TableHead className="font-mono text-xs">Asset</TableHead>
              <TableHead className="font-mono text-xs">Side</TableHead>
              <TableHead className="font-mono text-xs text-right">Qty</TableHead>
              <TableHead className="font-mono text-xs text-right">Entry</TableHead>
              <TableHead className="font-mono text-xs text-right">Exit</TableHead>
              <TableHead className="font-mono text-xs text-right">P&L</TableHead>
              <TableHead className="font-mono text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => {
              const isBuy = trade.side === 'BUY';
              const hasPnL = trade.pnl !== undefined;
              const isProfit = hasPnL && trade.pnl! >= 0;

              return (
                <TableRow key={trade.id} className="border-border">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(new Date(trade.createdAt), 'MM/dd HH:mm')}
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {trade.symbol.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "flex items-center gap-1 font-mono text-sm",
                      isBuy ? "text-accent" : "text-destructive"
                    )}>
                      {isBuy ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {trade.side}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {trade.quantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {trade.exitPrice 
                      ? `$${trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    {hasPnL ? (
                      <span className={cn(
                        "font-mono text-sm",
                        isProfit ? "text-accent" : "text-destructive"
                      )}>
                        {isProfit ? '+' : ''}${trade.pnl!.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={trade.status === 'OPEN' ? 'default' : 'secondary'}
                      className={cn(
                        "font-mono text-xs",
                        trade.status === 'OPEN' 
                          ? "bg-primary/20 text-primary border-primary/30" 
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {trade.status}
                    </Badge>
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
