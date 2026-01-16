-- Create execution intents table for trade tracking
CREATE TABLE public.execution_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  order_type TEXT NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT')),
  quantity DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,8),
  time_in_force TEXT DEFAULT 'GTC' CHECK (time_in_force IN ('GTC', 'IOC', 'FOK')),
  leverage INTEGER,
  signal_id TEXT,
  strategy_id TEXT,
  status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'VALIDATED', 'REJECTED_RISK', 'EXECUTING', 'PARTIALLY_FILLED', 'FILLED', 'FAILED', 'CANCELLED')),
  mode TEXT NOT NULL DEFAULT 'paper' CHECK (mode IN ('paper', 'live')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for exchange order tracking
CREATE TABLE public.exchange_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_id UUID NOT NULL REFERENCES public.execution_intents(id) ON DELETE CASCADE,
  exchange_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'partial', 'filled', 'cancelled', 'failed')),
  filled_quantity DECIMAL(20,8) DEFAULT 0,
  avg_fill_price DECIMAL(20,8),
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  asset TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  tx_hash TEXT,
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk events table for audit logging
CREATE TABLE public.risk_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_id UUID REFERENCES public.execution_intents(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  rule TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  reason TEXT,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trading config table
CREATE TABLE public.trading_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  exchange TEXT NOT NULL DEFAULT 'binance',
  network TEXT NOT NULL DEFAULT 'testnet' CHECK (network IN ('testnet', 'mainnet')),
  trading_mode TEXT NOT NULL DEFAULT 'paper' CHECK (trading_mode IN ('paper', 'live')),
  base_capital DECIMAL(20,8) NOT NULL DEFAULT 1000,
  max_risk_per_trade DECIMAL(8,4) NOT NULL DEFAULT 0.02,
  max_daily_loss DECIMAL(20,8) NOT NULL DEFAULT 50,
  volatility_limit DECIMAL(8,4) NOT NULL DEFAULT 0.05,
  max_leverage INTEGER NOT NULL DEFAULT 3,
  max_slippage DECIMAL(8,4) NOT NULL DEFAULT 0.01,
  profit_withdrawal_threshold DECIMAL(20,8) NOT NULL DEFAULT 200,
  kill_switch_max_api_errors INTEGER NOT NULL DEFAULT 10,
  kill_switch_max_failed_orders INTEGER NOT NULL DEFAULT 5,
  withdraw_asset TEXT DEFAULT 'USDT',
  withdraw_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system health tracking table
CREATE TABLE public.system_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  api_error_count INTEGER NOT NULL DEFAULT 0,
  failed_order_count INTEGER NOT NULL DEFAULT 0,
  kill_switch_active BOOLEAN NOT NULL DEFAULT false,
  kill_switch_reason TEXT,
  last_health_check TIMESTAMP WITH TIME ZONE DEFAULT now(),
  daily_pnl DECIMAL(20,8) DEFAULT 0,
  unrealized_pnl DECIMAL(20,8) DEFAULT 0,
  realized_pnl DECIMAL(20,8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.execution_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies for execution_intents
CREATE POLICY "Users can view their own intents" ON public.execution_intents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own intents" ON public.execution_intents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own intents" ON public.execution_intents FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for exchange_orders (via intent ownership)
CREATE POLICY "Users can view orders for their intents" ON public.exchange_orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.execution_intents WHERE id = exchange_orders.intent_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create orders for their intents" ON public.exchange_orders FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.execution_intents WHERE id = exchange_orders.intent_id AND user_id = auth.uid())
);

-- RLS Policies for withdrawals
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for risk_events
CREATE POLICY "Users can view their own risk events" ON public.risk_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own risk events" ON public.risk_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trading_config
CREATE POLICY "Users can view their own config" ON public.trading_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own config" ON public.trading_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own config" ON public.trading_config FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for system_health
CREATE POLICY "Users can view their own health" ON public.system_health FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own health" ON public.system_health FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health" ON public.system_health FOR UPDATE USING (auth.uid() = user_id);

-- Add update triggers
CREATE TRIGGER update_execution_intents_updated_at BEFORE UPDATE ON public.execution_intents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exchange_orders_updated_at BEFORE UPDATE ON public.exchange_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trading_config_updated_at BEFORE UPDATE ON public.trading_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_health_updated_at BEFORE UPDATE ON public.system_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();