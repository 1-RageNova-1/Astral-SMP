-- Prevent duplicate unpaid orders even when two browser requests arrive at once.
-- Minecraft names are case-insensitive, so the index treats their case equally.
CREATE UNIQUE INDEX IF NOT EXISTS purchases_one_pending_order_per_user_product_name
  ON public.purchases (user_id, product_id, lower(minecraft_username))
  WHERE status = 'pending';
