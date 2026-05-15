-- Enable RLS on realtime.messages (idempotent)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop prior policy if rerun
DROP POLICY IF EXISTS "Users can subscribe to their own channels" ON realtime.messages;

-- Allow authenticated users to receive messages only on channels whose
-- topic starts with their own auth.uid() (e.g. "<uid>:trades-realtime")
CREATE POLICY "Users can subscribe to their own channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() LIKE (auth.uid()::text || ':%'))
);