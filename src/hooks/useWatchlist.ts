import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  created_at: string;
}

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('watchlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watchlist',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchWatchlist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchWatchlist]);

  const addToWatchlist = useCallback(async (symbol: string, name: string) => {
    if (!user) {
      toast.error('Please sign in to use watchlist');
      return false;
    }

    try {
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          symbol,
          name,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info(`${symbol} is already in your watchlist`);
          return false;
        }
        throw error;
      }

      toast.success(`Added ${symbol} to watchlist`);
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
      return false;
    }
  }, [user]);

  const removeFromWatchlist = useCallback(async (symbol: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('symbol', symbol);

      if (error) throw error;

      toast.success(`Removed ${symbol} from watchlist`);
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
      return false;
    }
  }, [user]);

  const isInWatchlist = useCallback((symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  }, [watchlist]);

  const toggleWatchlist = useCallback(async (symbol: string, name: string) => {
    if (isInWatchlist(symbol)) {
      return removeFromWatchlist(symbol);
    } else {
      return addToWatchlist(symbol, name);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    refetch: fetchWatchlist,
  };
}
