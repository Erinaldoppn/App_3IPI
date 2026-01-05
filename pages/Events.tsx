
import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  MapPin, 
  Plus, 
  X, 
  Upload, 
  Loader2, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Calendar as CalendarIcon,
  Image as ImageIcon
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Form states com as novas nomenclaturas
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
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
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setProcessing(true);
    setErrorMsg(null);
    try {
      let imageUrl = imagePreview || 'https://picsum.photos/seed/church/600/400';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `event-card-${Date.now()}.${fileExt}`;
        const filePath = `eventos/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('midia')
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('midia').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const eventData = {
        title: newTitle,
        location: newLocation,
        date: newDate,
        time: newTime,
        description: newDescription,
        image: imageUrl
      };

      const { error } = isEditing && currentEventId
        ? await supabase.from('eventos').update(eventData).eq('id', currentEventId)
        : await supabase.from('eventos').insert([eventData]);

      if (error) throw error;

      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      setErrorMsg(`Erro: ${err.message || 'Falha ao salvar'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Excluir este evento permanentemente?')) return;
    try {
      const { error } = await supabase.from('eventos').delete().eq('id', id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const resetForm = () => {
    setNewTitle(''); setNewDate(''); setNewTime(''); setNewLocation('');
    setNewDescription(''); setImageFile(null); setImagePreview(null);
    setCurrentEventId(null); setErrorMsg(null);
  };

  const openEdit = (event: Event) => {
    setNewTitle(event.title);
    setNewLocation(event.location);
    setNewDate(event.date);
    setNewTime(event.time);
    setNewDescription(event.description);
    setImagePreview(event.image);
    setCurrentEventId(event.id);
    setIsEditing(true);
    setShowModal(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-brand-darkBlue dark:text-white tracking-tighter uppercase">Agenda de Eventos</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Fique por dentro de tudo o que acontece na 3IPI.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { resetForm(); setIsEditing(false); setShowModal(true); }} 
            className="flex items-center space-x-2 bg-brand-blue text-white px-8 py-4 rounded-2xl hover:bg-brand-darkBlue transition-all font-bold shadow-xl shadow-brand-blue/20 active:scale-95"
          >
            <Plus size={24} />
            <span>Novo Evento</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-brand-blue" size={64} />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Sincronizando Agenda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {events.map((event) => (
            <div key={event.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-2xl transition-all relative flex flex-col h-full">
              {isAdmin && (
                <div className="absolute top-6 right-6 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(event)} className="p-3 bg-white/90 dark:bg-gray-800/90 text-brand-blue rounded-xl shadow-xl hover:bg-brand-blue hover:text-white transition-all">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteEvent(event.id)} className="p-3 bg-white/90 dark:bg-gray-800/90 text-red-500 rounded-xl shadow-xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
              <div className="relative overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-6 left-6 bg-brand-yellow text-brand-darkBlue px-4 py-1.5 rounded-full text-xs font-black shadow-lg uppercase tracking-tighter">
                  {event.date}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-brand-darkBlue dark:text-white mb-4 leading-tight uppercase tracking-tighter">{event.title}</h3>
                <div className="space-y-3 mb-6 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center font-bold text-sm uppercase tracking-wider"><Clock size={18} className="mr-3 text-brand-blue" />{event.time}</div>
                  <div className="flex items-center font-bold text-sm uppercase tracking-wider"><MapPin size={18} className="mr-3 text-brand-blue" />{event.location}</div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 line-clamp-4">{event.description}</p>
                <button className="mt-auto w-full bg-gray-50 dark:bg-gray-700/50 text-brand-darkBlue dark:text-white font-black py-4 rounded-2xl hover:bg-brand-blue hover:text-white transition-all uppercase tracking-widest text-xs border border-gray-100 dark:border-gray-600">
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
               <CalendarIcon size={64} className="mx-auto text-gray-200 mb-6" />
               <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Nenhum evento agendado</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-darkBlue/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-8 border-b dark:border-gray-700 bg-brand-blue text-white">
              <h2 className="text-2xl font-black uppercase tracking-tighter">{isEditing ? 'Editar Evento' : 'Novo Evento'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              {errorMsg && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800 rounded-2xl flex items-start space-x-3 text-red-600">
                  <AlertTriangle className="shrink-0" size={24} />
                  <p className="text-sm font-bold">{errorMsg}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Evento</label>
                  <input required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nome do Evento" className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:border-brand-blue text-gray-900 dark:text-white font-bold transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Local</label>
                  <input required value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="Onde será?" className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:border-brand-blue text-gray-900 dark:text-white font-bold transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Data</label>
                  <input required value={newDate} onChange={(e) => setNewDate(e.target.value)} placeholder="Ex: 15 de Out" className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:border-brand-blue text-gray-900 dark:text-white font-bold transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Hora</label>
                  <input required value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="19:30" className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:border-brand-blue text-gray-900 dark:text-white font-bold transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Descrição</label>
                <textarea required value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Detalhes do evento..." className="w-full h-32 px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 rounded-2xl outline-none focus:border-brand-blue text-gray-900 dark:text-white font-bold transition-all resize-none" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Card do Evento</label>
                
                {/* Botão de Upload Adaptativo */}
                <div className="space-y-4">
                  {!imagePreview && (
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 border-4 border-dashed border-gray-100 dark:border-gray-700 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 hover:border-brand-blue hover:text-brand-blue transition-all group"
                    >
                      <Upload size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-black uppercase tracking-widest text-[10px]">Clique para enviar o card</span>
                    </button>
                  )}

                  {imagePreview && (
                    <div className="relative rounded-[2rem] overflow-hidden border-2 border-brand-blue shadow-2xl">
                      <img src={imagePreview} className="w-full h-auto max-h-[300px] object-contain bg-gray-900" alt="Preview" />
                      <button 
                        type="button" 
                        onClick={() => { setImagePreview(null); setImageFile(null); }}
                        className="absolute top-4 right-4 bg-brand-darkBlue/80 text-white p-3 rounded-full hover:bg-red-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] font-black text-white uppercase tracking-widest hover:text-brand-yellow transition-colors"
                        >
                          Trocar Imagem
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                </div>
              </div>

              <div className="pt-8 flex space-x-4">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-4 font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  disabled={processing}
                  type="submit" 
                  className="flex-1 bg-brand-blue text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-blue/30 flex items-center justify-center space-x-3 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {processing ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                  <span>{processing ? 'Gravando...' : (isEditing ? 'Atualizar Evento' : 'Salvar Evento')}</span>
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
