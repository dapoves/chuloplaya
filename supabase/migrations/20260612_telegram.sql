-- Tabla para almacenar chat IDs de Telegram registrados
CREATE TABLE IF NOT EXISTS public.telegram_chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_chats ENABLE ROW LEVEL SECURITY;

-- Solo service_role puede leer/escribir (las edge functions usan service_role)
CREATE POLICY "service_role_full_access" ON public.telegram_chats
  FOR ALL USING (auth.role() = 'service_role');

-- Columna para evitar avisos de devolución duplicados por Telegram
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS telegram_return_notified boolean NOT NULL DEFAULT false;
