
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
        setMembers([
          { id: '1', nome: 'João Silva (Exemplo)', foto_url: 'https://i.pravatar.cc/150?u=1', created_at: '' },
          { id: '2', nome: 'Maria Oliveira (Exemplo)', foto_url: 'https://i.pravatar.cc/150?u=2', created_at: '' },
          { id: '3', nome: 'Pedro Santos (Exemplo)', foto_url: 'https://i.pravatar.cc/150?u=3', created_at: '' },
          { id: '4', nome: 'Ana Costa (Exemplo)', foto_url: 'https://i.pravatar.cc/150?u=4', created_at: '' },
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
        <button className="flex items-center space-x-2 bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-brand-darkBlue transition-all font-bold shadow-lg shadow-brand-blue/20 active:scale-95">
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
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue text-gray-900 dark:text-white placeholder:text-gray-400 caret-brand-blue transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className="group flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-transparent hover:border-brand-blue/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              <div className="relative mb-4">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-brand-blue rounded-full scale-0 group-hover:scale-110 transition-transform opacity-0 group-hover:opacity-10 blur-md"></div>
                
                <div className="relative overflow-hidden rounded-full w-24 h-24 border-4 border-gray-50 dark:border-gray-700 group-hover:border-brand-blue transition-colors duration-300">
                  {member.foto_url ? (
                    <img 
                      src={member.foto_url} 
                      alt={member.nome} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <UserIcon size={40} className="text-gray-400 group-hover:text-brand-blue transition-colors" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1 w-full">
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors truncate px-2 text-lg">
                  {member.nome}
                </p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-brand-blue uppercase tracking-wider">
                  Membro
                </div>
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum membro encontrado com este nome.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Members;
