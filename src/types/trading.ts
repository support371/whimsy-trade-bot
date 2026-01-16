export type Side = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';
export type IntentStatus = 'RECEIVED' | 'VALIDATED' | 'REJECTED_RISK' | 'EXECUTING' | 'PARTIALLY_FILLED' | 'FILLED' | 'FAILED' | 'CANCELLED';
export type TradingMode = 'paper' | 'live';

export interface ExecutionIntent {
  id?: string;
  symbol: string;
  side: Side;
  order_type: OrderType;
  quantity: number;
  price?: number;
  time_in_force: TimeInForce;
  leverage?: number;
  signal_id?: string;
  strategy_id?: string;
  status?: IntentStatus;
  mode?: TradingMode;
  notes?: string;
  created_at?: string;
}

export interface RiskContext {
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  account_balance: number;
  open_positions_value: number;
  daily_pnl: number;
  volatility: number;
  leverage?: number;
}

export interface RiskCheck {
  rule: string;
  passed: boolean;
  reason: string;
  value?: number;
  limit?: number;
}

export interface TradingConfig {
  id: string;
  user_id: string;
  exchange: string;
  network: 'testnet' | 'mainnet';
  trading_mode: TradingMode;
  base_capital: number;
  max_risk_per_trade: number;
  max_daily_loss: number;
  volatility_limit: number;
  max_leverage: number;
  max_slippage: number;
  profit_withdrawal_threshold: number;
  kill_switch_max_api_errors: number;
  kill_switch_max_failed_orders: number;
  withdraw_asset?: string;
  withdraw_address?: string;
}

export interface SystemHealth {
  id: string;
  user_id: string;
  api_error_count: number;
  failed_order_count: number;
  kill_switch_active: boolean;
  kill_switch_reason?: string;
  daily_pnl: number;
  unrealized_pnl: number;
  realized_pnl: number;
  trading_mode: TradingMode;
  system_status: 'OPERATIONAL' | 'HALTED';
  thresholds: {
    max_api_errors: number;
    max_failed_orders: number;
  };
  stats: {
    orders_today: number;
    rejections_today: number;
  };
}

export interface ExchangeOrder {
  id: string;
  intent_id: string;
  exchange_order_id?: string;
  status: 'pending' | 'open' | 'partial' | 'filled' | 'cancelled' | 'failed';
  filled_quantity?: number;
  avg_fill_price?: number;
  raw_response?: Record<string, unknown>;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  asset: string;
  address: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tx_hash?: string;
  created_at: string;
}

export interface RiskEvent {
  id: string;
  intent_id?: string;
  user_id: string;
  rule: string;
  passed: boolean;
  reason?: string;
  context?: Record<string, unknown>;
  created_at: string;
}
