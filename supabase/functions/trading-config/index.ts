import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const getOrCreateConfig = async () => {
      // Get user's trading config
      let { data: config } = await supabase
        .from('trading_config')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // If no config exists, create default (upsert to handle races)
      if (!config) {
        const { error: upsertError } = await supabase
          .from('trading_config')
          .upsert({
            user_id: user.id,
            exchange: 'binance',
            network: 'testnet',
            trading_mode: 'paper',
            base_capital: 1000,
            max_risk_per_trade: 0.02,
            max_daily_loss: 50,
            volatility_limit: 0.05,
            max_leverage: 3,
            max_slippage: 0.01,
            profit_withdrawal_threshold: 200,
            kill_switch_max_api_errors: 10,
            kill_switch_max_failed_orders: 5
          }, { onConflict: 'user_id', ignoreDuplicates: true });

        if (upsertError) throw upsertError;

        const { data: fetched, error: fetchError } = await supabase
          .from('trading_config')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;
        config = fetched;
      }

      return config;
    };

    if (req.method === 'GET') {
      const config = await getOrCreateConfig();

      return new Response(JSON.stringify(config), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const rawBody = await req.text();
      if (!rawBody.trim()) {
        const config = await getOrCreateConfig();

        return new Response(JSON.stringify(config), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      let updates: Record<string, unknown>;
      try {
        updates = JSON.parse(rawBody);
      } catch (_error) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Validate fields
      const allowedFields = [
        'exchange', 'network', 'trading_mode', 'base_capital',
        'max_risk_per_trade', 'max_daily_loss', 'volatility_limit',
        'max_leverage', 'max_slippage', 'profit_withdrawal_threshold',
        'kill_switch_max_api_errors', 'kill_switch_max_failed_orders',
        'withdraw_asset', 'withdraw_address'
      ];

      const filteredUpdates: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (key in updates) {
          filteredUpdates[key] = updates[key];
        }
      }

      // Upsert config
      const { data: config, error } = await supabase
        .from('trading_config')
        .upsert({
          user_id: user.id,
          ...filteredUpdates
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      console.log(`[CONFIG] Updated config for user ${user.id}`);

      return new Response(JSON.stringify(config), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in trading-config:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
