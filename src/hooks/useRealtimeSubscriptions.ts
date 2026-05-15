import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { ExecutionIntent, RiskEvent } from '@/types/trading';

export function useRealtimeIntents() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`${user.id}:intents-realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'execution_intents',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Intent update:', payload);
          
          // Invalidate query to refetch
          queryClient.invalidateQueries({ queryKey: ['execution-intents'] });
          
          // Show toast notification
          if (payload.eventType === 'INSERT') {
            const intent = payload.new as ExecutionIntent;
            toast.info(`New order: ${intent.side} ${intent.quantity} ${intent.symbol}`);
          } else if (payload.eventType === 'UPDATE') {
            const intent = payload.new as ExecutionIntent;
            const statusColors: Record<string, 'success' | 'error' | 'info'> = {
              FILLED: 'success',
              REJECTED_RISK: 'error',
              FAILED: 'error',
              CANCELLED: 'info',
            };
            const toastType = statusColors[intent.status || ''] || 'info';
            toast[toastType](`Order ${intent.status}: ${intent.symbol}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

export function useRealtimeHealth() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`${user.id}:health-realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_health',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Health update:', payload);
          queryClient.invalidateQueries({ queryKey: ['system-health'] });
          
          // Alert on kill switch activation
          if (payload.eventType === 'UPDATE') {
            const health = payload.new;
            if (health.kill_switch_active && !payload.old?.kill_switch_active) {
              toast.error(`⚠️ Kill Switch Activated: ${health.kill_switch_reason}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

export function useRealtimeTrades() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`${user.id}:trades-realtime`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
        },
        (payload) => {
          console.log('Trade update:', payload);
          queryClient.invalidateQueries({ queryKey: ['trades'] });
          queryClient.invalidateQueries({ queryKey: ['pnl-history'] });
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'CLOSED') {
            const trade = payload.new;
            const pnl = trade.pnl || 0;
            if (pnl >= 0) {
              toast.success(`Trade closed: +$${pnl.toFixed(2)} profit`);
            } else {
              toast.error(`Trade closed: -$${Math.abs(pnl).toFixed(2)} loss`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

export function useRealtimeRiskEvents() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`${user.id}:risk-events-realtime`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'risk_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Risk event:', payload);
          queryClient.invalidateQueries({ queryKey: ['risk-events'] });
          
          const event = payload.new as RiskEvent;
          if (!event.passed) {
            toast.warning(`Risk blocked: ${event.rule} - ${event.reason}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

// Combined hook for all realtime subscriptions
export function useAllRealtimeSubscriptions() {
  useRealtimeIntents();
  useRealtimeHealth();
  useRealtimeTrades();
  useRealtimeRiskEvents();
}
