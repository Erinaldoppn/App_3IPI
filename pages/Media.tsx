
import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, Play, Upload, Loader2, X, CheckCircle2, AlertTriangle } from 'lucide-react';
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
  const [uploadStatus, setUploadStatus] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
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
        message: 'Você não tem permissão de administrador para realizar uploads.', 
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

      if (uploadError) throw uploadError;

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
        // Trata erro específico de RLS
        if (dbError.message.includes('row-level security policy')) {
          throw new Error('Permissão negada no banco de dados. Verifique se as políticas de RLS para a tabela "midia" foram configuradas corretamente para administradores.');
        }
        throw dbError;
      }

      setUploadStatus({ message: 'Arquivo enviado com sucesso!', type: 'success' });
      fetchMedia();
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setUploadStatus({ 
        message: err.message || 'Falha ao processar arquivo.', 
        type: err.message.includes('Permissão') ? 'warning' : 'error' 
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Mantém avisos de erro por mais tempo para o usuário ler
      setTimeout(() => setUploadStatus(null), 6000);
    }
  };

  const filteredItems = activeTab === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.type === (activeTab === 'photos' ? 'photo' : 'video'));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fotos & Vídeos</h1>
          <p className="text-gray-500 dark:text-gray-400">Momentos marcantes da nossa igreja.</p>
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
              className="flex items-center space-x-2 bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-brand-darkBlue transition-all font-bold shadow-lg shadow-brand-blue/20 disabled:opacity-50 active:scale-95"
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              <span>{uploading ? 'Enviando...' : 'Importar Arquivo'}</span>
            </button>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className={`p-4 rounded-xl flex items-start justify-between animate-in slide-in-from-top-4 duration-300 border shadow-sm ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-100' 
            : uploadStatus.type === 'warning'
            ? 'bg-amber-50 text-amber-800 border-amber-100'
            : 'bg-red-50 text-red-800 border-red-100'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="mt-0.5">
              {uploadStatus.type === 'success' && <CheckCircle2 size={20} />}
              {uploadStatus.type === 'warning' && <AlertTriangle size={20} />}
              {uploadStatus.type === 'error' && <X size={20} />}
            </div>
            <div>
              <p className="font-bold text-sm">
                {uploadStatus.type === 'success' ? 'Sucesso!' : 'Atenção'}
              </p>
              <p className="text-xs opacity-90">{uploadStatus.message}</p>
            </div>
          </div>
          <button onClick={() => setUploadStatus(null)} className="p-1 hover:bg-black/5 rounded-md">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm w-fit">
        {['all', 'photos', 'videos'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-brand-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            {tab === 'all' ? 'Todos' : tab === 'photos' ? 'Fotos' : 'Vídeos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
          <p className="text-gray-400 font-medium">Carregando galeria...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-sm border border-gray-100 dark:border-gray-700">
              <img 
                src={item.type === 'photo' ? item.url : (item.thumbnail || item.url)} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt="Mídia"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {item.type === 'video' ? (
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                    <Play className="text-white fill-white" size={32} />
                  </div>
                ) : (
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                    <ImageIcon className="text-white" size={32} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
               <p className="text-gray-400 font-medium">Nenhuma mídia encontrada nesta categoria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Media;
