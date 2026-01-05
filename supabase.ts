
import { createClient } from '@supabase/supabase-js';

/* 
  INSTRUÇÕES PARA RESOLVER ALERTAS E ERROS (Execute no SQL Editor):

  -- 1. RESOLVER ERRO "gin_trgm_ops does not exist":
  -- É necessário habilitar esta extensão antes de criar índices de busca por nome.
  CREATE EXTENSION IF NOT EXISTS pg_trgm;

  -- 2. OTIMIZAÇÃO DE PERFORMANCE (Índices):
  -- Busca rápida de membros pelo nome
  CREATE INDEX IF NOT EXISTS idx_membros_nome_trgm ON public.membros USING gin (nome gin_trgm_ops);
  -- Ordenação rápida de eventos
  CREATE INDEX IF NOT EXISTS idx_eventos_date ON public.eventos(date);
  -- Histórico de oração mais fluido
  CREATE INDEX IF NOT EXISTS idx_pedidos_created ON public.pedidos_oracao(created_at DESC);

  -- 3. CORREÇÃO DE SEGURANÇA (Alerta Laranja):
  -- Protege a função de criação de usuários
  ALTER FUNCTION public.handle_new_user() SET search_path = public;

  -- 4. ESTRUTURA BASE (Tabela de Perfis):
  CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    nome TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  );
*/

const supabaseUrl = 'https://luvdpnpnzotosndovtry.supabase.co';
const supabaseKey = 'sb_publishable_AHoQc1CMmUsP8iuCVMW-HA_tuBfmIaX';

export const isMocked = !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
