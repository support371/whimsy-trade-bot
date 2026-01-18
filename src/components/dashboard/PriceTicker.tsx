import { useState, useEffect, useCallback } from 'react';
import { CryptoPrice } from '@/types/crypto';
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff, Database, RefreshCw, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type DataSource = 'live' | 'cached' | 'fallback';

const COOLDOWN_SECONDS = 30;

interface PriceTickerProps {
  prices: CryptoPrice[];
  selectedSymbol: string;
  onSelect: (id: string) => void;
  dataSource?: DataSource;
  onRefresh?: () => void;
  watchlist?: string[];
  onToggleWatchlist?: (symbol: string, name: string) => void;
}

export function PriceTicker({ 
  prices, 
  selectedSymbol, 
  onSelect, 
  dataSource = 'live', 
  onRefresh,
  watchlist = [],
  onToggleWatchlist,
}: PriceTickerProps) {
  const [cooldown, setCooldown] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRefresh = useCallback(async () => {
    if (cooldown > 0 || !onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setCooldown(COOLDOWN_SECONDS);
    }
  }, [cooldown, onRefresh]);
  const getDataSourceInfo = () => {
    switch (dataSource) {
      case 'live':
        return { icon: Wifi, label: 'Live', color: 'text-accent', bg: 'bg-accent/10 border-accent/30' };
      case 'cached':
        return { icon: Database, label: 'Cached', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' };
      case 'fallback':
        return { icon: WifiOff, label: 'Offline', color: 'text-muted-foreground', bg: 'bg-muted border-muted-foreground/30' };
    }
  };

  const sourceInfo = getDataSourceInfo();
  const SourceIcon = sourceInfo.icon;

  return (
    <div className="w-full overflow-hidden bg-muted/30 border-b border-border">
      <div className="flex items-center gap-6 py-2 px-4 overflow-x-auto scrollbar-hide">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={cooldown > 0 || isRefreshing}
              className={cn(
                "h-7 px-2 shrink-0 transition-all",
                cooldown > 0 && "opacity-50"
              )}
            >
              <RefreshCw className={cn("w-3.5 h-3.5 mr-1", isRefreshing && "animate-spin")} />
              {cooldown > 0 ? (
                <span className="text-xs font-mono w-6">{cooldown}s</span>
              ) : (
                <span className="text-xs">Refresh</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {cooldown > 0 
              ? `Wait ${cooldown}s before refreshing again`
              : 'Refresh prices now'
            }
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={cn("flex items-center gap-1.5 shrink-0", sourceInfo.bg, sourceInfo.color)}>
              <SourceIcon className="w-3 h-3" />
              <span className="text-xs font-medium">{sourceInfo.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {dataSource === 'live' && 'Prices are updating in real-time'}
            {dataSource === 'cached' && 'Using cached prices (API rate limited)'}
            {dataSource === 'fallback' && 'Using fallback prices (API unavailable)'}
          </TooltipContent>
        </Tooltip>
        {prices.map((coin) => {
          const isPositive = coin.change24h >= 0;
          const isSelected = coin.id === selectedSymbol;
          const isWatchlisted = watchlist.includes(coin.symbol);
          
          return (
            <div
              key={coin.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap",
                "hover:bg-muted/50 border border-transparent",
                isSelected && "border-primary bg-muted/50 shadow-neon-cyan"
              )}
            >
              {onToggleWatchlist && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(coin.symbol, coin.name);
                      }}
                    >
                      <Star 
                        className={cn(
                          "w-3.5 h-3.5 transition-all",
                          isWatchlisted 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-muted-foreground hover:text-yellow-500"
                        )} 
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                  </TooltipContent>
                </Tooltip>
              )}
              
              <button
                onClick={() => onSelect(coin.id)}
                className="flex items-center gap-3"
              >
                <div className="flex flex-col items-start">
                  <span className={cn(
                    "font-display text-sm font-semibold",
                    isSelected && "text-primary neon-glow"
                  )}>
                    {coin.symbol}
                  </span>
                  <span className="text-xs text-muted-foreground">{coin.name}</span>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm font-medium">
                    ${coin.price.toLocaleString(undefined, { 
                      minimumFractionDigits: 2,
                      maximumFractionDigits: coin.price < 1 ? 6 : 2
                    })}
                  </span>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    isPositive ? "text-accent status-bullish" : "text-destructive status-bearish"
                  )}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : coin.change24h < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    <span>{isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
