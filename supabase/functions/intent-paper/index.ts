import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExecutionIntent {
  symbol: string;
  side: 'BUY' | 'SELL';
  order_type: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
  time_in_force?: 'GTC' | 'IOC' | 'FOK';
  leverage?: number;
  signal_id?: string;
  strategy_id?: string;
  notes?: string;
}

interface RiskContext {
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

interface RiskRule {
  name: string;
  check: (intent: ExecutionIntent, ctx: RiskContext, config: TradingConfig) => { passed: boolean; reason: string };
}

interface TradingConfig {
  base_capital: number;
  max_risk_per_trade: number;
  max_daily_loss: number;
  volatility_limit: number;
  max_leverage: number;
  max_slippage: number;
}

// Risk rules implementation
const riskRules: RiskRule[] = [
  {
    name: 'MaxPositionRule',
    check: (intent, ctx, config) => {
      const notional = ctx.price * ctx.quantity;
      const maxNotional = config.base_capital * config.max_risk_per_trade;
      if (notional > maxNotional) {
        return { passed: false, reason: `Max position exceeded: ${notional.toFixed(2)} > ${maxNotional.toFixed(2)}` };
      }
      return { passed: true, reason: '' };
    }
  },
  {
    name: 'MaxDailyLossRule',
    check: (intent, ctx, config) => {
      if (ctx.daily_pnl <= -config.max_daily_loss) {
        return { passed: false, reason: `Daily loss limit reached: ${ctx.daily_pnl.toFixed(2)} <= -${config.max_daily_loss}` };
      }
      return { passed: true, reason: '' };
    }
  },
  {
    name: 'VolatilityRule',
    check: (intent, ctx, config) => {
      if (ctx.volatility > config.volatility_limit) {
        return { passed: false, reason: `Volatility too high: ${(ctx.volatility * 100).toFixed(2)}% > ${(config.volatility_limit * 100).toFixed(2)}%` };
      }
      return { passed: true, reason: '' };
    }
  },
  {
    name: 'LeverageRule',
    check: (intent, ctx, config) => {
      if (intent.leverage && intent.leverage > config.max_leverage) {
        return { passed: false, reason: `Leverage too high: ${intent.leverage}x > ${config.max_leverage}x` };
      }
      return { passed: true, reason: '' };
    }
  },
  {
    name: 'SlippageRule',
    check: (intent, ctx, config) => {
      if (!intent.price || ctx.price === 0) return { passed: true, reason: '' };
      const diff = Math.abs(intent.price - ctx.price) / ctx.price;
      if (diff > config.max_slippage) {
        return { passed: false, reason: `Slippage too high: ${(diff * 100).toFixed(2)}% > ${(config.max_slippage * 100).toFixed(2)}%` };
      }
      return { passed: true, reason: '' };
    }
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json() as { intent: ExecutionIntent; risk_context: RiskContext };
    const { intent, risk_context } = body;

    console.log(`[PAPER] Processing intent for ${intent.symbol} ${intent.side} ${intent.quantity}`);

    // Get user's trading config
    const { data: configData } = await supabase
      .from('trading_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const config: TradingConfig = configData || {
      base_capital: 1000,
      max_risk_per_trade: 0.02,
      max_daily_loss: 50,
      volatility_limit: 0.05,
      max_leverage: 3,
      max_slippage: 0.01
    };

    // Run risk checks
    const riskResults: { rule: string; passed: boolean; reason: string }[] = [];
    let allPassed = true;

    for (const rule of riskRules) {
      const result = rule.check(intent, risk_context, config);
      riskResults.push({ rule: rule.name, ...result });
      
      // Log risk event
      await supabase.from('risk_events').insert({
        user_id: user.id,
        rule: rule.name,
        passed: result.passed,
        reason: result.reason || null,
        context: { intent, risk_context }
      });

      if (!result.passed) {
        allPassed = false;
      }
    }

    // Create execution intent
    const intentStatus = allPassed ? 'FILLED' : 'REJECTED_RISK';
    const { data: intentRecord, error: intentError } = await supabase
      .from('execution_intents')
      .insert({
        user_id: user.id,
        symbol: intent.symbol,
        side: intent.side,
        order_type: intent.order_type,
        quantity: intent.quantity,
        price: intent.price || risk_context.price,
        time_in_force: intent.time_in_force || 'GTC',
        leverage: intent.leverage,
        signal_id: intent.signal_id,
        strategy_id: intent.strategy_id,
        status: intentStatus,
        mode: 'paper',
        notes: allPassed ? 'Paper trade executed successfully' : riskResults.filter(r => !r.passed).map(r => r.reason).join('; ')
      })
      .select()
      .single();

    if (intentError) {
      console.error('Failed to create intent:', intentError);
      throw new Error('Failed to create intent record');
    }

    // If passed, create a simulated order
    if (allPassed && intentRecord) {
      await supabase.from('exchange_orders').insert({
        intent_id: intentRecord.id,
        exchange_order_id: `PAPER-${Date.now()}`,
        status: 'filled',
        filled_quantity: intent.quantity,
        avg_fill_price: intent.price || risk_context.price,
        raw_response: { mode: 'paper', simulated: true }
      });
    }

    return new Response(JSON.stringify({
      success: allPassed,
      intent_id: intentRecord?.id,
      status: intentStatus,
      risk_checks: riskResults,
      message: allPassed 
        ? `Paper trade executed: ${intent.side} ${intent.quantity} ${intent.symbol}` 
        : `Trade rejected by risk engine`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing paper intent:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
