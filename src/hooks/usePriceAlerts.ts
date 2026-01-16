import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CryptoPrice } from '@/types/crypto';
import { toast } from 'sonner';

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export function usePriceAlerts(prices: CryptoPrice[]) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const triggeredAlertsRef = useRef<Set<string>>(new Set());

  const fetchAlerts = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedAlerts: PriceAlert[] = (data || []).map(a => ({
        id: a.id,
        userId: a.user_id,
        symbol: a.symbol,
        targetPrice: Number(a.target_price),
        condition: a.condition as 'above' | 'below',
        isActive: a.is_active,
        triggeredAt: a.triggered_at,
        createdAt: a.created_at,
      }));
      setAlerts(mappedAlerts);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createAlert = useCallback(async (
    symbol: string,
    targetPrice: number,
    condition: 'above' | 'below'
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id: user.id,
        symbol,
        target_price: targetPrice,
        condition,
      })
      .select()
      .single();

    if (!error && data) {
      const newAlert: PriceAlert = {
        id: data.id,
        userId: data.user_id,
        symbol: data.symbol,
        targetPrice: Number(data.target_price),
        condition: data.condition as 'above' | 'below',
        isActive: data.is_active,
        triggeredAt: data.triggered_at,
        createdAt: data.created_at,
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    return { data, error };
  }, [user]);

  const deleteAlert = useCallback(async (alertId: string) => {
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', alertId);

    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    }

    return { error };
  }, []);

  const triggerAlert = useCallback(async (alert: PriceAlert, currentPrice: number) => {
    // Mark as triggered in DB
    await supabase
      .from('price_alerts')
      .update({ is_active: false, triggered_at: new Date().toISOString() })
      .eq('id', alert.id);

    // Update local state
    setAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, isActive: false, triggeredAt: new Date().toISOString() }
        : a
    ));

    // Show in-app notification
    const direction = alert.condition === 'above' ? '↑' : '↓';
    toast.success(
      `🚨 Price Alert: ${alert.symbol.toUpperCase()} ${direction} $${currentPrice.toLocaleString()}`,
      { duration: 10000 }
    );

    // Browser push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Price Alert: ${alert.symbol.toUpperCase()}`, {
        body: `Price ${alert.condition} $${alert.targetPrice.toLocaleString()} - Now at $${currentPrice.toLocaleString()}`,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    }
  }, []);

  // Check alerts against current prices
  useEffect(() => {
    if (!prices.length || !alerts.length) return;

    alerts
      .filter(a => a.isActive && !triggeredAlertsRef.current.has(a.id))
      .forEach(alert => {
        const price = prices.find(p => p.id === alert.symbol);
        if (!price) return;

        const shouldTrigger = 
          (alert.condition === 'above' && price.price >= alert.targetPrice) ||
          (alert.condition === 'below' && price.price <= alert.targetPrice);

        if (shouldTrigger) {
          triggeredAlertsRef.current.add(alert.id);
          triggerAlert(alert, price.price);
        }
      });
  }, [prices, alerts, triggerAlert]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    isLoading,
    createAlert,
    deleteAlert,
    refetch: fetchAlerts,
    activeAlerts: alerts.filter(a => a.isActive),
    triggeredAlerts: alerts.filter(a => !a.isActive),
  };
}
