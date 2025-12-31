
import React from 'react';
import { Calendar, Users, Heart, Video } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Próximos Eventos', value: '4', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { label: 'Membros Ativos', value: '1,248', icon: Users, color: 'bg-green-100 text-green-600' },
    { label: 'Pedidos de Oração', value: '12', icon: Heart, color: 'bg-red-100 text-red-600' },
    { label: 'Vídeos Recentes', value: '45', icon: Video, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel de Controle</h1>
        <p className="text-gray-500 dark:text-gray-400">Aqui está o que está acontecendo na 3IPI hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Avisos da Semana</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="w-12 h-12 rounded-lg bg-brand-yellow flex-shrink-0 flex items-center justify-center font-bold text-brand-darkBlue">
                  {i + 15} Out
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Reunião de Jovens</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Um momento de adoração e aprendizado focado na nova geração.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-blue p-8 rounded-2xl shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Novo no App?</h2>
            <p className="text-blue-100 mb-6">Explore as seções de eventos e grupos para se conectar ainda mais com a nossa comunidade!</p>
            <button className="bg-brand-yellow text-brand-darkBlue font-bold px-6 py-2 rounded-lg hover:scale-105 transition-transform">
              Ver Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
