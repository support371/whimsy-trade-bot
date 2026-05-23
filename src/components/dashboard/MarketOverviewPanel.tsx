import { memo } from "react";
import { useMarketOverview } from "@/hooks/useMarketOverview";
import { Globe, TrendingUp, TrendingDown, Coins, BarChart3 } from "lucide-react";

const fmtUsd = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
};

export const MarketOverviewPanel = memo(() => {
  const { data, isLoading, error } = useMarketOverview();
  const change = data?.marketCapChange24h ?? 0;
  const positive = change >= 0;

  return (
    <div className="cyber-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-display text-sm text-primary neon-glow">
            GLOBAL MARKET OVERVIEW
          </h2>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          CoinGecko
        </span>
      </div>

      {isLoading && (
        <div className="text-xs font-mono text-muted-foreground animate-pulse">
          Loading market data…
        </div>
      )}

      {error && (
        <div className="text-xs font-mono text-destructive">
          Market data unavailable
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
              <BarChart3 className="w-3 h-3" /> Market Cap
            </div>
            <div className="font-display text-lg">{fmtUsd(data.totalMarketCapUsd)}</div>
            <div
              className={`flex items-center gap-1 text-xs font-mono ${
                positive ? "text-accent" : "text-destructive"
              }`}
            >
              {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change.toFixed(2)}%
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase">24h Volume</div>
            <div className="font-display text-lg">{fmtUsd(data.totalVolumeUsd)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase">BTC / ETH Dom.</div>
            <div className="font-display text-lg">
              {data.btcDominance.toFixed(1)}% / {data.ethDominance.toFixed(1)}%
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
              <Coins className="w-3 h-3" /> Active Assets
            </div>
            <div className="font-display text-lg">
              {data.activeCryptos.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MarketOverviewPanel.displayName = "MarketOverviewPanel";
