import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PnLDataPoint {
  date: string;
  pnl: number;
  cumulative: number;
  trades: number;
}

interface TradeDistribution {
  name: string;
  value: number;
  color: string;
}

export function usePnLHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pnl-history', user?.id],
    queryFn: async (): Promise<PnLDataPoint[]> => {
      if (!user) return [];

      // Get user's portfolios first
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id);

      if (!portfolios?.length) return [];

      const portfolioIds = portfolios.map(p => p.id);

      // Get trades with PnL
      const { data: trades, error } = await supabase
        .from('trades')
        .select('created_at, pnl, status')
        .in('portfolio_id', portfolioIds)
        .not('pnl', 'is', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!trades?.length) return [];

      // Group by date and calculate cumulative PnL
      const dailyPnL: Record<string, { pnl: number; trades: number }> = {};
      
      trades.forEach((trade) => {
        const date = new Date(trade.created_at).toISOString().split('T')[0];
        if (!dailyPnL[date]) {
          dailyPnL[date] = { pnl: 0, trades: 0 };
        }
        dailyPnL[date].pnl += trade.pnl || 0;
        dailyPnL[date].trades += 1;
      });

      // Convert to array with cumulative PnL
      let cumulative = 0;
      return Object.entries(dailyPnL)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => {
          cumulative += data.pnl;
          return {
            date,
            pnl: Number(data.pnl.toFixed(2)),
            cumulative: Number(cumulative.toFixed(2)),
            trades: data.trades,
          };
        });
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useTradeDistribution() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trade-distribution', user?.id],
    queryFn: async (): Promise<TradeDistribution[]> => {
      if (!user) return [];

      // Get user's portfolios first
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id);

      if (!portfolios?.length) return [];

      const portfolioIds = portfolios.map(p => p.id);

      const { data: trades, error } = await supabase
        .from('trades')
        .select('symbol, pnl, side')
        .in('portfolio_id', portfolioIds);

      if (error) throw error;
      if (!trades?.length) return [];

      // Calculate distribution by symbol
      const bySymbol: Record<string, number> = {};
      trades.forEach((trade) => {
        if (!bySymbol[trade.symbol]) {
          bySymbol[trade.symbol] = 0;
        }
        bySymbol[trade.symbol] += 1;
      });

      const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];
      
      return Object.entries(bySymbol)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, value], index) => ({
          name,
          value,
          color: colors[index % colors.length],
        }));
    },
    enabled: !!user,
  });
}

export function useWinLossRatio() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['win-loss-ratio', user?.id],
    queryFn: async () => {
      if (!user) return { wins: 0, losses: 0, winRate: 0, totalPnL: 0 };

      // Get user's portfolios first
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id);

      if (!portfolios?.length) return { wins: 0, losses: 0, winRate: 0, totalPnL: 0 };

      const portfolioIds = portfolios.map(p => p.id);

      const { data: trades, error } = await supabase
        .from('trades')
        .select('pnl')
        .in('portfolio_id', portfolioIds)
        .not('pnl', 'is', null);

      if (error) throw error;
      if (!trades?.length) return { wins: 0, losses: 0, winRate: 0, totalPnL: 0 };

      const wins = trades.filter((t) => (t.pnl || 0) > 0).length;
      const losses = trades.filter((t) => (t.pnl || 0) < 0).length;
      const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

      return {
        wins,
        losses,
        winRate: Number(winRate.toFixed(1)),
        totalPnL: Number(totalPnL.toFixed(2)),
      };
    },
    enabled: !!user,
  });
}
