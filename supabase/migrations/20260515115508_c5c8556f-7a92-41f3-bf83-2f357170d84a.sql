CREATE POLICY "Users can delete their own config"
ON public.trading_config
FOR DELETE
USING (auth.uid() = user_id);