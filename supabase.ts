
import { createClient } from '@supabase/supabase-js';

/* 
  COPIE E EXECUTE NO SQL EDITOR DO SUPABASE PARA CORREÇÃO TOTAL:

  -- 1. GARANTIR EXTENSÃO E ESTRUTURA BASE
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

  -- GARANTIR ID AUTOMÁTICO
  ALTER TABLE public.eventos ALTER COLUMN id SET DEFAULT gen_random_uuid();

  -- 2. CONFIGURAÇÃO DE SEGURANÇA (RLS)
  -- Habilita o RLS
  ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

  -- Limpa políticas antigas
  DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.eventos;
  DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON public.eventos;

  -- Criar política: Qualquer pessoa (público) pode VER os eventos
  CREATE POLICY "Permitir leitura para todos" ON public.eventos
  FOR SELECT USING (true);

  -- Criar política: Apenas usuários LOGADOS podem CRIAR/EDITAR/EXCLUIR
  CREATE POLICY "Permitir tudo para autenticados" ON public.eventos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- 3. PERMISSÕES DE STORAGE (IMAGENS)
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('midia', 'midia', true)
  ON CONFLICT (id) DO NOTHING;
  
  -- Se houver erro no upload, execute estas linhas também:
  -- CREATE POLICY "Acesso Publico" ON storage.objects FOR SELECT USING (bucket_id = 'midia');
  -- CREATE POLICY "Upload Autenticado" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'midia');
*/

const supabaseUrl = 'https://luvdpnpnzotosndovtry.supabase.co';
const supabaseKey = 'sb_publishable_AHoQc1CMmUsP8iuCVMW-HA_tuBfmIaX';

export const isMocked = !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
