-- Enable realtime for execution_intents
ALTER TABLE public.execution_intents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.execution_intents;

-- Enable realtime for system_health
ALTER TABLE public.system_health REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_health;

-- Enable realtime for trades
ALTER TABLE public.trades REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;