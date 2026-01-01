
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Profile } from '../types';
import { Shield, ShieldCheck, User, Loader2, Search, CheckCircle2 } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');

  useEffect(() => {
    fetchProfiles();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.full_name) {
      setCurrentUserName(user.user_metadata.full_name);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('nome');
      
      if (!error && data) {
        setProfiles(data);
      }
    } catch (err) {
      console.error('Erro ao buscar perfis:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);
      
      if (!error) {
        setProfiles(profiles.map(p => p.id === userId ? { ...p, is_admin: !currentStatus } : p));
      } else {
        alert("Erro ao atualizar permissão. Verifique se você tem autoridade suficiente.");
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = profiles.filter(p => 
    (p.nome?.toLowerCase().includes(search.toLowerCase()) || 
     p.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const isErinaldo = currentUserName.toLowerCase().includes('erinaldo');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isErinaldo ? `Olá, Erinaldo! 👋` : 'Gestão Administrativa'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isErinaldo 
              ? 'Gerencie quem pode administrar o conteúdo da 3IPI.' 
              : 'Controle de permissões e acessos do sistema.'}
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl border border-brand-blue/20">
          <ShieldCheck size={20} />
          <span className="text-sm font-bold">Painel Seguro</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="animate-spin text-brand-blue" />
            <p className="text-sm text-gray-400">Carregando usuários...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-xs font-bold uppercase text-gray-400 tracking-wider">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Permissão</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center text-brand-blue">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{p.nome || 'Membro sem nome'}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {p.is_admin ? (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 border border-green-200">
                          <ShieldCheck size={12} className="mr-1" /> Administrador
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                          <Shield size={12} className="mr-1" /> Membro Comum
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleAdmin(p.id, p.is_admin)}
                        disabled={updatingId === p.id}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                          p.is_admin 
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                            : 'text-brand-blue hover:bg-brand-blue/10'
                        } disabled:opacity-50`}
                      >
                        {updatingId === p.id ? (
                          <Loader2 size={16} className="animate-spin mx-auto" />
                        ) : (
                          p.is_admin ? 'Revogar Acesso' : 'Tornar Admin'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">
                      Nenhum usuário encontrado para "{search}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-brand-darkBlue p-6 rounded-2xl text-white flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-lg">Precisa de ajuda com as permissões?</h3>
          <p className="text-blue-200 text-sm">Admins podem excluir posts, aceitar pedidos e ver dados de membros.</p>
        </div>
        <CheckCircle2 size={40} className="text-brand-yellow opacity-20" />
      </div>
    </div>
  );
};

export default AdminSettings;
