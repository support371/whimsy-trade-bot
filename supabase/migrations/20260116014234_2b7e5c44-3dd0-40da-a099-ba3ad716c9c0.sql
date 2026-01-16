-- Create price_alerts table for user price alerts
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own alerts" 
ON public.price_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts" 
ON public.price_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.price_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" 
ON public.price_alerts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add holdings table for tracking portfolio positions
CREATE TABLE public.holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  avg_buy_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(portfolio_id, symbol)
);

-- Enable Row Level Security
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

-- Create policies for holdings via portfolio ownership
CREATE POLICY "Users can view holdings in their portfolios" 
ON public.holdings 
FOR SELECT 
USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can create holdings in their portfolios" 
ON public.holdings 
FOR INSERT 
WITH CHECK (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can update holdings in their portfolios" 
ON public.holdings 
FOR UPDATE 
USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete holdings from their portfolios" 
ON public.holdings 
FOR DELETE 
USING (portfolio_id IN (SELECT id FROM portfolios WHERE user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_holdings_updated_at
BEFORE UPDATE ON public.holdings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();