
import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../supabase';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
}

interface EventsProps {
  isAdmin?: boolean;
}

const Events: React.FC<EventsProps> = ({ isAdmin = false }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        // Fallback para dados estáticos se a tabela não existir
        setEvents([
          {
            id: '1',
            title: 'Conferência de Mulheres 2024',
            date: '25 Out',
            time: '19:30',
            location: 'Auditório Principal',
            description: 'Um encontro especial de renovo e comunhão para todas as mulheres de nossa comunidade.',
            image: 'https://picsum.photos/seed/event1/600/400'
          },
          {
            id: '2',
            title: 'Retiro de Jovens: Imersão',
            date: '12 Nov',
            time: '08:00',
            location: 'Chácara Vale do Sol',
            description: 'Três dias de busca intensa pela presença de Deus e lazer com amigos.',
            image: 'https://picsum.photos/seed/event2/600/400'
          }
        ]);
      } else if (data && data.length > 0) {
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setUploading(true);
    try {
      let imageUrl = 'https://picsum.photos/seed/church/600/400';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `eventos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('midia')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('midia')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('eventos').insert([{
        title: newTitle,
        date: newDate,
        time: newTime,
        location: newLocation,
        description: newDescription,
        image: imageUrl
      }]);

      if (error) throw error;

      setShowAddModal(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      alert('Erro ao adicionar evento: ' + (err.message || 'Verifique se a tabela "eventos" e o bucket "midia" estão configurados.'));
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    setNewDescription('');
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Próximos Eventos</h1>
          <p className="text-gray-500 dark:text-gray-400">Fique por dentro de tudo o que acontece na nossa igreja.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-brand-darkBlue transition-all font-bold shadow-lg shadow-brand-blue/20 active:scale-95"
          >
            <Plus size={20} />
            <span>Criar Evento</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
          <p className="text-gray-400 font-medium">Carregando agenda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-shadow flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-brand-blue text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                  {event.date}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-brand-darkBlue dark:text-white mb-2">{event.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <Clock size={16} className="mr-2 text-brand-blue" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <MapPin size={16} className="mr-2 text-brand-blue" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6">
                  {event.description}
                </p>

                <button className="mt-auto w-full bg-brand-yellow text-brand-darkBlue font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors">
                  Saiba Mais
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
               <p className="text-gray-400 font-medium">Nenhum evento programado para os próximos dias.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Adicionar Evento */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-brand-blue text-white">
              <h2 className="text-xl font-bold">Novo Evento da Igreja</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Título do Evento</label>
                  <input 
                    required 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue dark:text-white"
                    placeholder="Ex: Noite de Louvor"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Local</label>
                  <input 
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue dark:text-white"
                    placeholder="Ex: Templo Principal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Data (Texto)</label>
                  <input 
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue dark:text-white"
                    placeholder="Ex: 15 Dez"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Horário</label>
                  <input 
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue dark:text-white"
                    placeholder="Ex: 19:00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Descrição</label>
                <textarea 
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue dark:text-white resize-none"
                  placeholder="Conte um pouco sobre o evento..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Capa do Evento</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue transition-colors group overflow-hidden"
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <Upload className="text-gray-400 group-hover:text-brand-blue mb-2" size={32} />
                      <span className="text-sm text-gray-500 font-medium">Clique para fazer upload de imagem</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  disabled={uploading}
                  type="submit" 
                  className="flex-1 bg-brand-blue text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-blue/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                  <span>{uploading ? 'Salvando...' : 'Salvar Evento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
