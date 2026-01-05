
import { createClient } from '@supabase/supabase-js';

/* 
  COPIE E EXECUTE NO SQL EDITOR DO SUPABASE PARA CORREÇÃO TOTAL:

  -- 1. GARANTIR EXTENSÕES E ESTRUTURA
  CREATE EXTENSION IF NOT EXISTS pg_trgm;

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

  -- 2. CORREÇÃO DE SEGURANÇA (O motivo mais provável do erro ao salvar)
  -- Habilita o RLS (Segurança de Linha)
  ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

  -- Remove políticas antigas se existirem para evitar conflitos
  DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.eventos;
  DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON public.eventos;

  -- Criar política: Qualquer pessoa pode VER os eventos
  CREATE POLICY "Permitir leitura para todos" ON public.eventos
  FOR SELECT USING (true);

  -- Criar política: Apenas usuários LOGADOS podem inserir/editar/excluir
  CREATE POLICY "Permitir tudo para autenticados" ON public.eventos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- 3. GARANTIR QUE O ID SEJA GERADO AUTOMATICAMENTE (Se não foi na criação)
  ALTER TABLE public.eventos ALTER COLUMN id SET DEFAULT gen_random_uuid();

  -- 4. PERMISSÕES PARA O BUCKET DE MÍDIA (Storage)
  -- Garante que o bucket exista e aceite arquivos
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('midia', 'midia', true)
  ON CONFLICT (id) DO NOTHING;
*/

const supabaseUrl = 'https://luvdpnpnzotosndovtry.supabase.co';
const supabaseKey = 'sb_publishable_AHoQc1CMmUsP8iuCVMW-HA_tuBfmIaX';

export const isMocked = !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
