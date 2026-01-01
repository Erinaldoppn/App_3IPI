
import { createClient } from '@supabase/supabase-js';

/* 
  SQL PARA CORREÇÃO DE RLS (Execute no SQL Editor do Supabase):

  -- Tabela de Mídias
  CREATE TABLE IF NOT EXISTS public.midia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT CHECK (type IN ('photo', 'video')),
    url TEXT NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  ALTER TABLE public.midia ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Acesso público leitura" ON public.midia FOR SELECT USING (true);
  
  CREATE POLICY "Admins podem inserir" ON public.midia FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND is_admin = true)
  );

  -- Storage Políticas (Bucket 'midia' deve ser público)
  -- Rodar estas se o erro persistir no upload do arquivo:
  -- CREATE POLICY "Upload Admin" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'midia' AND (SELECT is_admin FROM public.perfis WHERE id = auth.uid()));
*/

const supabaseUrl = 'https://luvdpnpnzotosndovtry.supabase.co';
const supabaseKey = 'sb_publishable_AHoQc1CMmUsP8iuCVMW-HA_tuBfmIaX';

export const isMocked = !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
