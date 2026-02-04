import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { CryptoPrice } from '@/types/crypto';
import { WatchlistItem } from '@/hooks/useWatchlist';

interface PriceSnapshot {
  price: number;
  timestamp: number;
}

interface UseWatchlistAlertsOptions {
  /** Percentage threshold to trigger alert (default: 5 = 5%) */
  threshold?: number;
  /** Minimum time between alerts for same coin in ms (default: 60000 = 1 minute) */
  cooldownMs?: number;
  /** Enable/disable alerts (default: true) */
  enabled?: boolean;
}

/**
 * Monitors watchlisted coins and shows notifications when prices move significantly.
 * Tracks price snapshots and compares against threshold to trigger alerts.
 */
export function useWatchlistAlerts(
  watchlist: WatchlistItem[],
  prices: CryptoPrice[],
  options: UseWatchlistAlertsOptions = {}
) {
  const {
    threshold = 5,
    cooldownMs = 60000,
    enabled = true,
  } = options;

  // Store baseline prices for comparison
  const basePrices = useRef<Map<string, PriceSnapshot>>(new Map());
  // Track last alert time per coin to prevent spam
  const lastAlertTime = useRef<Map<string, number>>(new Map());
  // Track if we've initialized (skip first render)
  const isInitialized = useRef(false);

  const showPriceAlert = useCallback((
    symbol: string,
    name: string,
    oldPrice: number,
    newPrice: number,
    changePercent: number
  ) => {
    const isUp = changePercent > 0;
    const emoji = isUp ? '🚀' : '📉';
    const direction = isUp ? 'up' : 'down';
    const color = isUp ? 'text-accent' : 'text-destructive';

    toast(
      `${emoji} ${symbol} moved ${direction} ${Math.abs(changePercent).toFixed(1)}%`,
      {
        description: `$${oldPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} → $${newPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        duration: 5000,
        className: color,
      }
    );
  }, []);

  useEffect(() => {
    if (!enabled || watchlist.length === 0 || prices.length === 0) {
      return;
    }

    const watchlistSymbols = new Set(watchlist.map(w => w.symbol));
    const now = Date.now();

    prices.forEach(coin => {
      // Only monitor watchlisted coins
      if (!watchlistSymbols.has(coin.symbol)) {
        return;
      }

      const currentPrice = coin.price;
      const baseSnapshot = basePrices.current.get(coin.symbol);

      // Initialize baseline on first encounter
      if (!baseSnapshot) {
        basePrices.current.set(coin.symbol, {
          price: currentPrice,
          timestamp: now,
        });
        return;
      }

      // Skip alerts on initial load
      if (!isInitialized.current) {
        return;
      }

      // Calculate percentage change from baseline
      const changePercent = ((currentPrice - baseSnapshot.price) / baseSnapshot.price) * 100;

      // Check if threshold exceeded
      if (Math.abs(changePercent) >= threshold) {
        const lastAlert = lastAlertTime.current.get(coin.symbol) || 0;
        
        // Check cooldown to prevent alert spam
        if (now - lastAlert >= cooldownMs) {
          const watchlistItem = watchlist.find(w => w.symbol === coin.symbol);
          showPriceAlert(
            coin.symbol,
            watchlistItem?.name || coin.name,
            baseSnapshot.price,
            currentPrice,
            changePercent
          );
          
          lastAlertTime.current.set(coin.symbol, now);
          
          // Update baseline after alert
          basePrices.current.set(coin.symbol, {
            price: currentPrice,
            timestamp: now,
          });
        }
      }
    });

    // Mark as initialized after first price update
    if (!isInitialized.current && prices.length > 0) {
      isInitialized.current = true;
    }
  }, [watchlist, prices, threshold, cooldownMs, enabled, showPriceAlert]);

  // Clean up removed coins from tracking
  useEffect(() => {
    const watchlistSymbols = new Set(watchlist.map(w => w.symbol));
    
    basePrices.current.forEach((_, symbol) => {
      if (!watchlistSymbols.has(symbol)) {
        basePrices.current.delete(symbol);
        lastAlertTime.current.delete(symbol);
      }
    });
  }, [watchlist]);

  // Reset function for manual clearing
  const resetBaselines = useCallback(() => {
    basePrices.current.clear();
    lastAlertTime.current.clear();
    isInitialized.current = false;
  }, []);

  return { resetBaselines };
}
