
import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, Play, Upload, Loader2, X, CheckCircle2, ShieldAlert, FileText, Video } from 'lucide-react';
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
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const getFileNameFromUrl = (url: string) => {
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      const nameWithoutParams = lastPart.split('?')[0];
      const cleanName = nameWithoutParams.includes('-') ? nameWithoutParams.split('-').slice(1).join('-') : nameWithoutParams;
      return cleanName || 'Arquivo';
    } catch {
      return 'Arquivo';
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
      const safeOriginalName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}-${safeOriginalName}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('midia')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('row-level security')) {
          throw new Error('Erro de RLS no Storage: Verifique se o bucket "midia" tem políticas de INSERT para administradores.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('midia')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('midia')
        .insert([{
          type,
          url: publicUrl,
          thumbnail: isVideo ? null : publicUrl
        }]);

      if (dbError) {
        if (dbError.message.includes('row-level security')) {
          throw new Error('Erro de RLS na Tabela: A mídía foi enviada ao Storage, mas não pôde ser registrada no banco.');
        }
        throw dbError;
      }

      setUploadStatus({ message: `${isVideo ? 'Vídeo' : 'Foto'} publicado com sucesso!`, type: 'success' });
      fetchMedia();
    } catch (err: any) {
      console.error('Falha no processo:', err);
      setUploadStatus({ 
        message: err.message || 'Falha ao processar arquivo.', 
        type: 'error'
      });
    } finally {
      setUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const filteredItems = activeTab === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.type === (activeTab === 'photos' ? 'photo' : 'video'));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Galeria 3IPI</h1>
          <p className="text-gray-500 dark:text-gray-400">Fotos e vídeos de nossa comunidade.</p>
        </div>
        
        {isAdmin && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Input e Botão de Foto */}
            <input 
              type="file" 
              ref={photoInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brand-blue text-white px-5 py-3 rounded-xl hover:bg-brand-darkBlue transition-all font-bold shadow-lg shadow-brand-blue/20 disabled:opacity-50 active:scale-95"
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
              <span>Importar Foto</span>
            </button>

            {/* Input e Botão de Vídeo */}
            <input 
              type="file" 
              ref={videoInputRef}
              onChange={handleFileUpload}
              accept="video/*"
              className="hidden"
            />
            <button 
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brand-darkBlue text-white px-5 py-3 rounded-xl hover:bg-blue-900 transition-all font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 active:scale-95 border border-blue-800"
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <Video size={20} />}
              <span>Importar Vídeo</span>
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
            <button onClick={() => setUploadStatus(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 w-fit shadow-sm">
        {(['all', 'photos', 'videos'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
              activeTab === tab 
                ? 'bg-brand-blue text-white shadow-lg' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            {tab === 'all' ? 'Tudo' : tab === 'photos' ? 'Fotos' : 'Vídeos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue mb-4" size={48} />
          <p className="text-gray-400 font-medium">Buscando mídias...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-md hover:shadow-2xl border-2 border-transparent hover:border-brand-blue transition-all duration-500 cursor-pointer">
              <img 
                src={item.type === 'photo' ? item.url : (item.thumbnail || item.url)} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt="3IPI Midia"
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {item.type === 'video' ? <Play className="text-white fill-white" size={32} /> : <ImageIcon className="text-white" size={32} />}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white font-bold truncate flex items-center mb-1">
                    <FileText size={10} className="mr-1.5 opacity-80" />
                    {getFileNameFromUrl(item.url)}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${item.type === 'photo' ? 'text-brand-yellow' : 'text-blue-300'}`}>
                    {item.type === 'photo' ? 'Fotografia' : 'Vídeo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-24 text-center bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-500">
               <div className="inline-flex p-5 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <ImageIcon className="text-gray-300" size={40} />
               </div>
               <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">Nenhuma mídia encontrada</p>
               <p className="text-gray-400 text-sm mt-1">Experimente mudar o filtro ou importar novos arquivos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Media;
