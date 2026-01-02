
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  X, 
  Upload, 
  Loader2, 
  Edit2, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { supabase } from '../supabase';
import { Event } from '../types';

interface EventsProps {
  isAdmin?: boolean;
}

const Events: React.FC<EventsProps> = ({ isAdmin = false }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  
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

      if (error) throw error;
      if (data) setEvents(data);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      // Fallback para visualização local se banco estiver inacessível
      if (events.length === 0) {
        setEvents([
          {
            id: '1',
            title: 'Conferência de Mulheres 2024',
            date: '25 Out',
            time: '19:30',
            location: 'Auditório Principal',
            description: 'Um encontro especial de renovo e comunhão para todas as mulheres de nossa comunidade.',
            image: 'https://picsum.photos/seed/event1/600/400'
          }
        ]);
      }
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

  const openAddModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (event: Event) => {
    setNewTitle(event.title);
    setNewDate(event.date);
    setNewTime(event.time);
    setNewLocation(event.location);
    setNewDescription(event.description);
    setImagePreview(event.image);
    setCurrentEventId(event.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    
    try {
      const { error } = await supabase.from('eventos').delete().eq('id', id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setProcessing(true);
    try {
      let imageUrl = imagePreview || 'https://picsum.photos/seed/church/600/400';

      // Upload de nova imagem se houver arquivo selecionado
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `capa-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `eventos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('midia')
          .upload(filePath, imageFile);

        if (uploadError) throw new Error('Falha no upload da imagem. Verifique o bucket "midia".');

        const { data: { publicUrl } } = supabase.storage
          .from('midia')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const eventData = {
        title: newTitle,
        date: newDate,
        time: newTime,
        location: newLocation,
        description: newDescription,
        image: imageUrl
      };

      if (isEditing && currentEventId) {
        const { error } = await supabase
          .from('eventos')
          .update(eventData)
          .eq('id', currentEventId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('eventos').insert([eventData]);
        if (error) throw error;
      }

      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Erro inesperado ao salvar evento.');
    } finally {
      setProcessing(false);
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
    setCurrentEventId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Próximos Eventos</h1>
          <p className="text-gray-500 dark:text-gray-400">Acompanhe a agenda da nossa comunidade.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={openAddModal}
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
          <p className="text-gray-400 font-medium">Carregando eventos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all flex flex-col h-full relative">
              
              {/* Controles Admin */}
              {isAdmin && (
                <div className="absolute top-4 right-4 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(event)}
                    className="p-2 bg-white/90 dark:bg-gray-800/90 text-brand-blue rounded-lg shadow-lg hover:bg-brand-blue hover:text-white transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 bg-white/90 dark:bg-gray-800/90 text-red-500 rounded-lg shadow-lg hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4 bg-brand-blue text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
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

                <button className="mt-auto w-full border-2 border-brand-blue text-brand-blue font-bold py-3 rounded-xl hover:bg-brand-blue hover:text-white transition-all">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
               <p className="text-gray-400 font-medium">Nenhum evento agendado no momento.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal CRUD Evento */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-brand-blue text-white">
              <h2 className="text-xl font-bold">{isEditing ? 'Editar Evento' : 'Novo Evento'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Título</label>
                  <input 
                    required 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white"
                    placeholder="Ex: Conferência Geral"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Local</label>
                  <input 
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white"
                    placeholder="Ex: Templo Principal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Data (ex: 15 Dez)</label>
                  <input 
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Horário</label>
                  <input 
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white"
                    placeholder="19:30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Descrição</label>
                <textarea 
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full h-24 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Imagem de Capa</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue transition-colors group overflow-hidden bg-gray-50 dark:bg-gray-700"
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <Upload className="text-gray-400 group-hover:text-brand-blue mb-2" size={32} />
                      <span className="text-sm text-gray-500">Enviar imagem (.jpg, .png)</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  disabled={processing}
                  type="submit" 
                  className="flex-1 bg-brand-blue text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-blue/20 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
                >
                  {processing ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                  <span>{processing ? 'Salvando...' : (isEditing ? 'Atualizar Evento' : 'Salvar Evento')}</span>
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
