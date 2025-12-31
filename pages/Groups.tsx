
import React from 'react';
import { UsersRound, ChevronRight } from 'lucide-react';

const Groups: React.FC = () => {
  const groups = [
    { name: 'Ministério Infantil', description: 'Ensino da Palavra de forma lúdica para crianças de 4 a 12 anos.', image: 'https://picsum.photos/seed/kids/400/300' },
    { name: 'Geração Eleita', description: 'O grupo de jovens focado em adoração e impacto social.', image: 'https://picsum.photos/seed/youth/400/300' },
    { name: 'Casais com Propósito', description: 'Fortalecendo relacionamentos à luz da Bíblia.', image: 'https://picsum.photos/seed/couples/400/300' },
    { name: 'Louvor & Adoração', description: 'Músicos e cantores dedicados a conduzir a igreja à presença de Deus.', image: 'https://picsum.photos/seed/music/400/300' },
    { name: 'Ação Social', description: 'Servindo a comunidade local com cestas básicas e assistência.', image: 'https://picsum.photos/seed/social/400/300' },
    { name: 'Estudo Bíblico', description: 'Aprofundamento teológico para todas as idades.', image: 'https://picsum.photos/seed/bible/400/300' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ministérios & Grupos</h1>
          <p className="text-gray-500 dark:text-gray-400">Encontre o seu lugar para servir e crescer.</p>
        </div>
        <UsersRound size={48} className="text-brand-blue opacity-20 hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, i) => (
          <div key={i} className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer">
            <div className="h-40 overflow-hidden">
              <img src={group.image} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors mb-2">
                {group.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                {group.description}
              </p>
              <div className="flex items-center text-brand-blue font-semibold text-sm">
                <span>Participar</span>
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Groups;
