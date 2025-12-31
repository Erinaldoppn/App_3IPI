
import React, { useState, useEffect } from 'react';
import { supabase, isMocked } from '../supabase';
import { Member } from '../types';
import { Plus, Search, User as UserIcon, Loader2 } from 'lucide-react';

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('membros').select('*').order('nome');
      
      if (error) {
        console.error('Erro ao buscar membros:', error);
        if (isMocked) throw new Error('Mock mode');
      }

      if (data && data.length > 0) {
        setMembers(data);
      } else if (isMocked) {
        // Fallback apenas se o banco estiver vazio e for modo mock
        setMembers([
          { id: '1', nome: 'João Silva (Exemplo)', foto_url: 'https://i.pravatar.cc/150?u=1', created_at: '' },
          { id: '2', nome: 'Maria Oliveira (Exemplo)', foto_url: 'https://i.pravatar.cc/150?u=2', created_at: '' },
        ]);
      }
    } catch (err) {
      console.warn('Usando dados de demonstração devido a erro ou falta de dados.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Membros</h1>
          <p className="text-gray-500 dark:text-gray-400">Diretório de membros da nossa comunidade.</p>
        </div>
        <button className="flex items-center space-x-2 bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-brand-darkBlue transition-colors font-bold shadow-lg shadow-brand-blue/20">
          <Plus size={20} />
          <span>Novo Membro</span>
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white placeholder:text-gray-400 caret-brand-blue transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center text-center group">
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-brand-blue rounded-full scale-0 group-hover:scale-105 transition-transform opacity-10"></div>
                {member.foto_url ? (
                  <img 
                    src={member.foto_url} 
                    alt={member.nome} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg group-hover:border-brand-blue transition-colors" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md">
                    <UserIcon size={40} className="text-gray-400" />
                  </div>
                )}
              </div>
              <p className="font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors truncate w-full px-2">
                {member.nome}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold">Membro</p>
            </div>
          ))}
          {filteredMembers.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-gray-500">
              Nenhum membro encontrado no banco de dados.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;
