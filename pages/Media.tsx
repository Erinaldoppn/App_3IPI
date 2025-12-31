
import React, { useState } from 'react';
import { ImageIcon, Play, Filter } from 'lucide-react';

const Media: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos'>('all');

  const mediaItems = [
    { type: 'photo', url: 'https://picsum.photos/seed/p1/800/800' },
    { type: 'video', url: '#', thumbnail: 'https://picsum.photos/seed/v1/800/800' },
    { type: 'photo', url: 'https://picsum.photos/seed/p2/800/800' },
    { type: 'photo', url: 'https://picsum.photos/seed/p3/800/800' },
    { type: 'video', url: '#', thumbnail: 'https://picsum.photos/seed/v2/800/800' },
    { type: 'photo', url: 'https://picsum.photos/seed/p4/800/800' },
    { type: 'photo', url: 'https://picsum.photos/seed/p5/800/800' },
    { type: 'video', url: '#', thumbnail: 'https://picsum.photos/seed/v3/800/800' },
    { type: 'photo', url: 'https://picsum.photos/seed/p6/800/800' },
  ];

  const filteredItems = activeTab === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.type === (activeTab === 'photos' ? 'photo' : 'video'));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Galeria de Mídia</h1>
          <p className="text-gray-500 dark:text-gray-400">Registros dos nossos melhores momentos.</p>
        </div>
        
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'photos' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Fotos
          </button>
          <button 
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'videos' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Vídeos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-sm">
            <img 
              src={item.type === 'photo' ? item.url : item.thumbnail} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              alt="Mídia"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {item.type === 'video' ? (
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                  <Play className="text-white fill-white" size={32} />
                </div>
              ) : (
                <div className="bg-white/20 p-4 rounded-full backdrop-blur-md">
                  <ImageIcon className="text-white" size={32} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Media;
