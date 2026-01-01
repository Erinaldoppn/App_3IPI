
import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, Play, Upload, Loader2, X, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { supabase } from '../supabase';
import { MediaItem } from '../types';

interface MediaProps {
  isAdmin?: boolean;
}

const Media: React.FC<MediaProps> = ({ isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos'>('all');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{message: string, type: 'success' | 'error' | 'warning', debug?: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('midia')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (err) {
      console.error('Erro ao buscar mídias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAdmin) {
      setUploadStatus({ 
        message: 'Apenas administradores podem enviar arquivos.', 
        type: 'error' 
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const isVideo = file.type.startsWith('video/');
      const type = isVideo ? 'video' : 'photo';
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      // 1. Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from('midia')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('row-level security')) {
          throw new Error('Erro de RLS no Storage: Verifique se o bucket "midia" tem políticas de INSERT para administradores.');
        }
        throw uploadError;
      }

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('midia')
        .getPublicUrl(filePath);

      // 3. Inserir na tabela do Banco de Dados
      const { error: dbError } = await supabase
        .from('midia')
        .insert([{
          type,
          url: publicUrl,
          thumbnail: isVideo ? null : publicUrl
        }]);

      if (dbError) {
        if (dbError.message.includes('row-level security')) {
          throw new Error('Erro de RLS na Tabela: A mídía foi enviada ao Storage, mas não pôde ser registrada no banco. Execute as políticas SQL na tabela "midia".');
        }
        throw dbError;
      }

      setUploadStatus({ message: 'Arquivo publicado com sucesso!', type: 'success' });
      fetchMedia();
    } catch (err: any) {
      console.error('Falha no processo:', err);
      setUploadStatus({ 
        message: err.message || 'Falha ao processar arquivo.', 
        type: 'error',
        debug: 'Dica: Verifique as políticas de RLS no painel do Supabase.'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredItems = activeTab === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.type === (activeTab === 'photos' ? 'photo' : 'video'));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Galeria 3IPI</h1>
          <p className="text-gray-500 dark:text-gray-400">Fotos e vídeos de nossa comunidade.</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-3">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,video/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2 bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-brand-darkBlue transition-all font-bold shadow-lg shadow-brand-blue/20 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              <span>{uploading ? 'Processando...' : 'Importar Arquivo'}</span>
            </button>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className={`p-4 rounded-xl border animate-in slide-in-from-top-4 duration-300 ${
          uploadStatus.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex space-x-3">
              {uploadStatus.type === 'error' ? <ShieldAlert className="shrink-0" size={24} /> : <CheckCircle2 size={24} />}
              <div>
                <p className="font-bold">{uploadStatus.message}</p>
                {uploadStatus.debug && <p className="text-xs mt-1 opacity-70">{uploadStatus.debug}</p>}
              </div>
            </div>
            <button onClick={() => setUploadStatus(null)}><X size={20} /></button>
          </div>
        </div>
      )}

      <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 w-fit">
        {['all', 'photos', 'videos'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-brand-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            {tab === 'all' ? 'Tudo' : tab === 'photos' ? 'Fotos' : 'Vídeos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue mb-4" size={48} />
          <p className="text-gray-400">Buscando mídias...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-100 dark:border-gray-700">
              <img 
                src={item.type === 'photo' ? item.url : (item.thumbnail || item.url)} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt="3IPI Midia"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {item.type === 'video' ? <Play className="text-white fill-white" size={32} /> : <ImageIcon className="text-white" size={32} />}
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
               <p className="text-gray-400 font-medium">Sua galeria está vazia por enquanto.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Media;
