import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RiskCheckRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  leverage?: number;
  volatility?: number;
}

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

    const body = await req.json() as RiskCheckRequest;
    const { symbol, side, quantity, price, leverage, volatility = 0.02 } = body;

    console.log(`[RISK-CHECK] Checking ${symbol} ${side} ${quantity} @ ${price}`);

    // Get user's trading config
    const { data: configData } = await supabase
      .from('trading_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get user's system health for daily PnL
    const { data: healthData } = await supabase
      .from('system_health')
      .select('daily_pnl')
      .eq('user_id', user.id)
      .single();

    const config = configData || {
      base_capital: 1000,
      max_risk_per_trade: 0.02,
      max_daily_loss: 50,
      volatility_limit: 0.05,
      max_leverage: 3,
      max_slippage: 0.01
    };

    const dailyPnl = healthData?.daily_pnl || 0;
    const notional = price * quantity;
    const maxNotional = config.base_capital * config.max_risk_per_trade;

    const checks = [
      {
        rule: 'MaxPositionRule',
        passed: notional <= maxNotional,
        reason: notional > maxNotional 
          ? `Position size ${notional.toFixed(2)} exceeds max ${maxNotional.toFixed(2)}` 
          : 'Position size within limits',
        value: notional,
        limit: maxNotional
      },
      {
        rule: 'MaxDailyLossRule',
        passed: dailyPnl > -config.max_daily_loss,
        reason: dailyPnl <= -config.max_daily_loss 
          ? `Daily loss ${dailyPnl.toFixed(2)} exceeds limit ${config.max_daily_loss}` 
          : 'Daily loss within limits',
        value: dailyPnl,
        limit: -config.max_daily_loss
      },
      {
        rule: 'VolatilityRule',
        passed: volatility <= config.volatility_limit,
        reason: volatility > config.volatility_limit 
          ? `Volatility ${(volatility * 100).toFixed(2)}% exceeds limit ${(config.volatility_limit * 100).toFixed(2)}%` 
          : 'Volatility within limits',
        value: volatility,
        limit: config.volatility_limit
      },
      {
        rule: 'LeverageRule',
        passed: !leverage || leverage <= config.max_leverage,
        reason: leverage && leverage > config.max_leverage 
          ? `Leverage ${leverage}x exceeds max ${config.max_leverage}x` 
          : 'Leverage within limits',
        value: leverage || 1,
        limit: config.max_leverage
      }
    ];

    const allPassed = checks.every(c => c.passed);
    const failedRules = checks.filter(c => !c.passed);

    return new Response(JSON.stringify({
      passed: allPassed,
      checks,
      failed_rules: failedRules.map(r => r.rule),
      summary: allPassed 
        ? 'All risk checks passed' 
        : `Blocked by: ${failedRules.map(r => r.rule).join(', ')}`,
      config: {
        base_capital: config.base_capital,
        max_risk_per_trade: config.max_risk_per_trade,
        max_daily_loss: config.max_daily_loss,
        volatility_limit: config.volatility_limit,
        max_leverage: config.max_leverage
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in risk check:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
