-- Add position column for ordering
ALTER TABLE public.watchlist ADD COLUMN position integer NOT NULL DEFAULT 0;

-- Create index for efficient ordering queries
CREATE INDEX idx_watchlist_user_position ON public.watchlist(user_id, position);

-- Function to set initial position on new watchlist items
CREATE OR REPLACE FUNCTION public.set_watchlist_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position = 0 THEN
    SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
    FROM public.watchlist
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-assign position on insert
CREATE TRIGGER set_watchlist_position_trigger
BEFORE INSERT ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION public.set_watchlist_position();

-- Add UPDATE policy for position changes
CREATE POLICY "Users can update their watchlist items"
ON public.watchlist
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);