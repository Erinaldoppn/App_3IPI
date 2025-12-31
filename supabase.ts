
import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas pelo usuário
const supabaseUrl = 'https://luvdpnpnzotosndovtry.supabase.co';
const supabaseKey = 'sb_publishable_AHoQc1CMmUsP8iuCVMW-HA_tuBfmIaX';

// Verifica se as credenciais são válidas (não são os placeholders iniciais)
export const isMocked = !supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey;

// Cliente real do Supabase
// Se as chaves forem inválidas ou houver erro de rede, o app pode falhar, 
// mas o objetivo aqui é a integração direta solicitada.
export const supabase = createClient(supabaseUrl, supabaseKey);
