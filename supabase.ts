
import { createClient } from '@supabase/supabase-js';

/* 
  INSTRUÇÕES PARA RESOLVER ALERTAS E ERROS (Execute no SQL Editor):

  -- 1. CORREÇÃO DE COLUNA FALTANTE (Erro 42703):
  -- Garante que a coluna 'date' exista na tabela de eventos
  ALTER TABLE IF EXISTS public.eventos ADD COLUMN IF NOT EXISTS "date" TEXT;

  -- 2. ESTRUTURA COMPLETA DA TABELA EVENTOS:
  CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT,
    time TEXT,
    location TEXT,
    description TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- 3. RESOLVER ERRO "gin_trgm_ops does not exist":
  CREATE EXTENSION IF NOT EXISTS pg_trgm;

  -- 4. OTIMIZAÇÃO DE PERFORMANCE (Índices):
  CREATE INDEX IF NOT EXISTS idx_membros_nome_trgm ON public.membros USING gin (nome gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS idx_eventos_date ON public.eventos(date);

  -- 5. CORREÇÃO DE SEGURANÇA (Alerta Laranja):
  ALTER FUNCTION public.handle_new_user() SET search_path = public;
*/

const supabaseUrl = 'https://luvdpnpnzotosndovtry.supabase.co';
const supabaseKey = 'sb_publishable_AHoQc1CMmUsP8iuCVMW-HA_tuBfmIaX';

export const isMocked = !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
