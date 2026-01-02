
import { createClient } from '@supabase/supabase-js';

/* 
  SQL PARA CONFIGURAÇÃO COMPLETA DO BANCO (Execute no SQL Editor do Supabase):

  -- 1. TABELA DE PERFIS (Usuários)
  CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    nome TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Perfis visíveis por todos" ON public.perfis FOR SELECT USING (true);
  CREATE POLICY "Usuários editam próprio perfil" ON public.perfis FOR UPDATE USING (auth.uid() = id);

  -- 2. TABELA DE EVENTOS
  CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT,
    description TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Eventos leitura pública" ON public.eventos FOR SELECT USING (true);
  CREATE POLICY "Eventos inserção admin" ON public.eventos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND is_admin = true)
  );

  -- 3. TABELA DE MEMBROS
  CREATE TABLE IF NOT EXISTS public.membros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    foto_url TEXT,
    data_nascimento DATE,
    telefone TEXT,
    endereco TEXT,
    genero TEXT,
    estado_civil TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Membros leitura pública" ON public.membros FOR SELECT USING (true);
  CREATE POLICY "Membros inserção admin" ON public.membros FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND is_admin = true)
  );

  -- 4. TABELA DE MÍDIA
  CREATE TABLE IF NOT EXISTS public.midia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT CHECK (type IN ('photo', 'video')),
    url TEXT NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE public.midia ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Mídia leitura pública" ON public.midia FOR SELECT USING (true);
  CREATE POLICY "Mídia inserção admin" ON public.midia FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND is_admin = true)
  );

  -- 5. BUCKET DE STORAGE (Crie um bucket chamado 'midia' no painel Storage e torne-o PÚBLICO)
*/

const supabaseUrl = 'https://luvdpnpnzotosndovtry.supabase.co';
const supabaseKey = 'sb_publishable_AHoQc1CMmUsP8iuCVMW-HA_tuBfmIaX';

export const isMocked = !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
