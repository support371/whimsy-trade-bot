import { Bell, BellOff, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PriceAlert } from '@/hooks/usePriceAlerts';
import { CryptoPrice } from '@/types/crypto';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AlertsListProps {
  alerts: PriceAlert[];
  prices: CryptoPrice[];
  onDelete: (alertId: string) => void;
  isLoading: boolean;
}

export function AlertsList({ alerts, prices, onDelete, isLoading }: AlertsListProps) {
  if (isLoading) {
    return (
      <div className="cyber-card p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="cyber-card p-8 text-center">
        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-mono">No alerts set</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create an alert to get notified when prices hit your targets
        </p>
      </div>
    );
  }

  const getProgress = (alert: PriceAlert) => {
    const price = prices.find(p => p.id === alert.symbol);
    if (!price) return 0;
    
    const current = price.price;
    const target = alert.targetPrice;
    
    if (alert.condition === 'above') {
      // Progress towards going above
      return Math.min(100, (current / target) * 100);
    } else {
      // Progress towards going below
      return Math.min(100, (target / current) * 100);
    }
  };

  return (
    <div className="cyber-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-lg font-semibold">Your Alerts</h3>
      </div>
      <div className="divide-y divide-border">
        {alerts.map((alert) => {
          const currentPrice = prices.find(p => p.id === alert.symbol);
          const progress = getProgress(alert);
          const isAbove = alert.condition === 'above';

          return (
            <div 
              key={alert.id} 
              className={cn(
                "p-4 transition-colors",
                !alert.isActive && "bg-muted/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold text-lg">
                      {alert.symbol.toUpperCase()}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-mono text-xs",
                        isAbove 
                          ? "border-accent text-accent" 
                          : "border-destructive text-destructive"
                      )}
                    >
                      {isAbove ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {alert.condition}
                    </Badge>
                    {alert.isActive ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30 font-mono text-xs">
                        <Bell className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-mono text-xs">
                        <BellOff className="w-3 h-3 mr-1" />
                        Triggered
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-sm text-muted-foreground font-mono">Target:</span>
                    <span className="font-mono font-semibold">
                      ${alert.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {currentPrice && (
                      <>
                        <span className="text-sm text-muted-foreground font-mono">Current:</span>
                        <span className="font-mono">
                          ${currentPrice.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </>
                    )}
                  </div>

                  {alert.isActive && (
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          isAbove ? "bg-accent" : "bg-destructive"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {alert.triggeredAt && (
                    <p className="text-xs text-muted-foreground font-mono mt-2">
                      Triggered: {format(new Date(alert.triggeredAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(alert.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
