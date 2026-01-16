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

    if (req.method === 'GET') {
      // Get or create system health record
      let { data: health } = await supabase
        .from('system_health')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!health) {
        const { data: newHealth, error: createError } = await supabase
          .from('system_health')
          .insert({
            user_id: user.id,
            api_error_count: 0,
            failed_order_count: 0,
            kill_switch_active: false,
            daily_pnl: 0,
            unrealized_pnl: 0,
            realized_pnl: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        health = newHealth;
      }

      // Get trading config for kill switch thresholds
      const { data: config } = await supabase
        .from('trading_config')
        .select('kill_switch_max_api_errors, kill_switch_max_failed_orders, trading_mode')
        .eq('user_id', user.id)
        .single();

      // Get recent stats
      const today = new Date().toISOString().split('T')[0];
      
      const { count: todayOrders } = await supabase
        .from('execution_intents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today);

      const { count: todayRejections } = await supabase
        .from('execution_intents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'REJECTED_RISK')
        .gte('created_at', today);

      return new Response(JSON.stringify({
        ...health,
        trading_mode: config?.trading_mode || 'paper',
        thresholds: {
          max_api_errors: config?.kill_switch_max_api_errors || 10,
          max_failed_orders: config?.kill_switch_max_failed_orders || 5
        },
        stats: {
          orders_today: todayOrders || 0,
          rejections_today: todayRejections || 0
        },
        system_status: health?.kill_switch_active ? 'HALTED' : 'OPERATIONAL'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'POST') {
      const updates = await req.json();
      
      // Handle kill switch reset
      if (updates.reset_kill_switch) {
        const { data: health, error } = await supabase
          .from('system_health')
          .update({
            kill_switch_active: false,
            kill_switch_reason: null,
            api_error_count: 0,
            failed_order_count: 0
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        console.log(`[HEALTH] Kill switch reset for user ${user.id}`);

        return new Response(JSON.stringify({
          message: 'Kill switch reset successfully',
          health
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Handle PnL reset (daily)
      if (updates.reset_daily_pnl) {
        const { data: health, error } = await supabase
          .from('system_health')
          .update({ daily_pnl: 0 })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          message: 'Daily PnL reset',
          health
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in trading-health:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
