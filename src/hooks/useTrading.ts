import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invokeEdgeFunction } from '@/lib/invokeEdgeFunction';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { 
  TradingConfig, 
  SystemHealth, 
  ExecutionIntent, 
  RiskContext,
  RiskCheck,
  RiskEvent 
} from '@/types/trading';

export function useTradingConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState<TradingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error: err } = await invokeEdgeFunction<TradingConfig>('trading-config');
    if (err) {
      setError(err.message);
    } else {
      setConfig(data);
      setError(null);
    }
    setIsLoading(false);
  }, [user]);

  const updateConfig = async (updates: Partial<TradingConfig>) => {
    const { data, error: err } = await invokeEdgeFunction<TradingConfig>('trading-config', {
      body: updates
    });
    if (err) {
      throw err;
    }
    setConfig(data);
    return data;
  };

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, isLoading, error, updateConfig, refetch: fetchConfig };
}

export function useUpdateTradingConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<TradingConfig>) => {
      const { data, error } = await invokeEdgeFunction<TradingConfig>('trading-config', {
        body: updates
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading-config'] });
    }
  });
}

export function useSystemHealth() {
  const { user } = useAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error: err } = await invokeEdgeFunction<SystemHealth>('trading-health');
    if (err) {
      setError(err.message);
    } else {
      setHealth(data);
      setError(null);
    }
    setIsLoading(false);
  }, [user]);

  const resetKillSwitch = async () => {
    const { data, error: err } = await invokeEdgeFunction<{ health: SystemHealth }>('trading-health', {
      body: { reset_kill_switch: true }
    });
    if (err) throw err;
    setHealth(data?.health || null);
    return data;
  };

  useEffect(() => {
    fetchHealth();
    // Poll health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return { health, isLoading, error, resetKillSwitch, refetch: fetchHealth };
}

export function useRiskCheck() {
  const [isChecking, setIsChecking] = useState(false);

  const checkRisk = async (params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    leverage?: number;
    volatility?: number;
  }): Promise<{ passed: boolean; checks: RiskCheck[]; summary: string }> => {
    setIsChecking(true);
    try {
      const { data, error } = await invokeEdgeFunction<{
        passed: boolean;
        checks: RiskCheck[];
        summary: string;
      }>('risk-check', { body: params });

      if (error) throw error;
      return data || { passed: false, checks: [], summary: 'Failed to check risk' };
    } finally {
      setIsChecking(false);
    }
  };

  return { checkRisk, isChecking };
}

export function useExecuteTrade() {
  const [isExecuting, setIsExecuting] = useState(false);

  const executePaperTrade = async (
    intent: Omit<ExecutionIntent, 'id' | 'status' | 'mode' | 'created_at'>,
    riskContext: RiskContext
  ) => {
    setIsExecuting(true);
    try {
      const { data, error } = await invokeEdgeFunction<{
        success: boolean;
        intent_id: string;
        status: string;
        risk_checks: RiskCheck[];
        message: string;
      }>('intent-paper', {
        body: { intent, risk_context: riskContext }
      });

      if (error) throw error;
      return data;
    } finally {
      setIsExecuting(false);
    }
  };

  return { executePaperTrade, isExecuting };
}

export function useTradingAudit() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchAudit = async (type?: 'intents' | 'withdrawals' | 'risk_events', limit = 50, offset = 0) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      params.set('limit', String(limit));
      params.set('offset', String(offset));

      const { data, error } = await invokeEdgeFunction<{
        type?: string;
        data?: unknown[];
        total?: number;
        intents?: { recent: unknown[]; total: number };
        withdrawals?: { recent: unknown[]; total: number };
        risk_events?: { recent: unknown[]; total: number };
      }>(`trading-audit?${params.toString()}`);

      if (error) throw error;
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchAudit, isLoading };
}

export function useExecutionIntents() {
  const { user } = useAuth();
  
  const { data: intents, isLoading, error, refetch } = useQuery({
    queryKey: ['execution-intents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('execution_intents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as ExecutionIntent[];
    },
    enabled: !!user,
  });

  return { intents, isLoading, error, refetch };
}

export function useRiskEvents() {
  const { user } = useAuth();
  
  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ['risk-events', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('risk_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as RiskEvent[];
    },
    enabled: !!user,
  });

  return { events, isLoading, error, refetch };
}
