
import React, { useState, useEffect } from 'react';
import { supabase, isMocked } from '../supabase';
import { PrayerRequest } from '../types';
import { Send, Heart, User, Phone, CheckCircle2, History, Loader2, Check, Eye } from 'lucide-react';

const PrayerRequests: React.FC = () => {
  const [pedido, setPedido] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [history, setHistory] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('pedidos_oracao').select('*').order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar histórico:', error);
      }

      if (data && data.length > 0) {
        setHistory(data);
      } else if (isMocked) {
        setHistory([
          { id: '1', pedido: 'Peço oração pela minha Família', nome_contato: 'Maria', telefone_contato: '', status: 'pendente', visualizado_em: new Date().toISOString(), created_at: '2026-01-01T10:00:00Z' },
          { id: '2', pedido: 'Agradecimento por uma porta de emprego aberta.', nome_contato: 'João Silva', telefone_contato: '', status: 'atendido', visualizado_em: new Date().toISOString(), created_at: new Date().toISOString() }
        ]);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);

    const newRequest = {
      pedido,
      nome_contato: nome,
      telefone_contato: telefone,
      status: 'pendente'
    };

    try {
      const { error } = await supabase.from('pedidos_oracao').insert([newRequest]);
      
      if (error) {
        throw error;
      }

      setPedido('');
      setNome('');
      setTelefone('');
      
      setShowSuccess(true);
      fetchHistory();
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);

    } catch (err: any) {
      console.error('Erro ao inserir pedido:', err);
      alert('Erro ao enviar pedido: ' + (err.message || 'Verifique as permissões da tabela.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pedidos de Oração</h1>
          <p className="text-gray-500 dark:text-gray-400">Conte conosco. Nossa equipe de intercessão estará orando pelo seu pedido.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className={`absolute inset-0 z-10 bg-white/90 dark:bg-gray-800/95 flex flex-col items-center justify-center transition-all duration-500 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
             <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Check className="text-green-600 dark:text-green-400" size={40} strokeWidth={3} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pedido Enviado!</h3>
             <p className="text-gray-500 dark:text-gray-400 mt-1">Estaremos em oração por você.</p>
             <button onClick={() => setShowSuccess(false)} className="mt-6 text-brand-blue font-bold text-sm hover:underline">Enviar outro pedido</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Seu Pedido</label>
              <textarea 
                value={pedido}
                onChange={(e) => setPedido(e.target.value)}
                placeholder="Descreva seu pedido de oração..."
                required
                className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-yellow/30 focus:border-brand-yellow text-gray-900 dark:text-white placeholder:text-gray-400 caret-brand-blue transition-all resize-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Seu Nome (opcional)</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: João Silva" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white placeholder:text-gray-400 caret-brand-blue font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Telefone (opcional)</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white placeholder:text-gray-400 caret-brand-blue font-medium" />
                </div>
              </div>
            </div>

            <button disabled={submitting} className="w-full bg-brand-yellow hover:bg-yellow-400 text-brand-darkBlue font-bold py-4 rounded-xl shadow-lg shadow-brand-yellow/20 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50">
              {submitting ? <Loader2 className="animate-spin" /> : <><Send size={20} /><span>Enviar Pedido</span></>}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <History className="text-brand-blue" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Pedidos</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-blue" /></div>
        ) : (
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-500 italic">Nenhum pedido encontrado no banco de dados.</p>
            ) : history.map((h) => (
              <div key={h.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-brand-blue/30 transition-all relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${h.status === 'atendido' ? 'bg-green-100 text-green-600' : 'bg-brand-blue/10 text-brand-blue'}`}>
                      <Heart size={20} fill={h.status === 'atendido' ? 'currentColor' : 'none'} />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block leading-tight">
                        {h.nome_contato || 'Anônimo'}
                      </span>
                      {h.visualizado_em && (
                        <div className="flex items-center text-[10px] text-brand-blue font-bold uppercase tracking-wider">
                          <Check size={10} strokeWidth={4} className="-mr-0.5" />
                          <Check size={10} strokeWidth={4} className="mr-1" />
                          Visto pela equipe
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      h.status === 'atendido' 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm italic mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
                  "{h.pedido}"
                </p>
                
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{new Date(h.created_at).toLocaleDateString('pt-BR')}</span>
                  {h.status === 'atendido' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 size={14} className="mr-1" />
                      Oração Atendida
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerRequests;
