import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Portfolio, Trade } from '@/types/crypto';

export interface Holding {
  id: string;
  portfolioId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  createdAt: string;
  updatedAt: string;
}

export function usePortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch or create portfolio
      let { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (portfolioError) throw portfolioError;

      // Create default portfolio if none exists
      if (!portfolioData) {
        const { data: newPortfolio, error: createError } = await supabase
          .from('portfolios')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        portfolioData = newPortfolio;
      }

      const mappedPortfolio: Portfolio = {
        id: portfolioData.id,
        userId: portfolioData.user_id,
        name: portfolioData.name,
        startingBalance: Number(portfolioData.starting_balance),
        currentBalance: Number(portfolioData.current_balance),
        createdAt: portfolioData.created_at,
        updatedAt: portfolioData.updated_at,
      };
      setPortfolio(mappedPortfolio);

      // Fetch holdings
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolioData.id);

      if (holdingsError) throw holdingsError;

      const mappedHoldings: Holding[] = (holdingsData || []).map(h => ({
        id: h.id,
        portfolioId: h.portfolio_id,
        symbol: h.symbol,
        name: h.name,
        quantity: Number(h.quantity),
        avgBuyPrice: Number(h.avg_buy_price),
        createdAt: h.created_at,
        updatedAt: h.updated_at,
      }));
      setHoldings(mappedHoldings);

      // Fetch trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('portfolio_id', portfolioData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (tradesError) throw tradesError;

      const mappedTrades: Trade[] = (tradesData || []).map(t => ({
        id: t.id,
        portfolioId: t.portfolio_id,
        symbol: t.symbol,
        side: t.side as 'BUY' | 'SELL',
        quantity: Number(t.quantity),
        entryPrice: Number(t.entry_price),
        exitPrice: t.exit_price ? Number(t.exit_price) : undefined,
        pnl: t.pnl ? Number(t.pnl) : undefined,
        status: t.status as 'OPEN' | 'CLOSED',
        signalConfidence: t.signal_confidence ? Number(t.signal_confidence) : undefined,
        riskScore: t.risk_score ? Number(t.risk_score) : undefined,
        createdAt: t.created_at,
        closedAt: t.closed_at || undefined,
      }));
      setTrades(mappedTrades);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch portfolio';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateBalance = useCallback(async (newBalance: number) => {
    if (!portfolio) return;

    const { error } = await supabase
      .from('portfolios')
      .update({ current_balance: newBalance })
      .eq('id', portfolio.id);

    if (!error) {
      setPortfolio(prev => prev ? { ...prev, currentBalance: newBalance } : null);
    }
    return error;
  }, [portfolio]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const totalPnL = trades
    .filter(t => t.status === 'CLOSED' && t.pnl !== undefined)
    .reduce((sum, t) => sum + (t.pnl || 0), 0);

  const openTradesCount = trades.filter(t => t.status === 'OPEN').length;

  return {
    portfolio,
    holdings,
    trades,
    isLoading,
    error,
    refetch: fetchPortfolio,
    updateBalance,
    totalPnL,
    openTradesCount,
  };
}
