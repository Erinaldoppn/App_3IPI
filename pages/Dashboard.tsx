
import React, { useState } from 'react';
import { Calendar, Users, Heart, Video, QrCode, Copy, CheckCircle2, ImageOff } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const pixCnpj = "62.332.735/0001-70";

  const stats = [
    { label: 'Próximos Eventos', value: '4', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
    { label: 'Membros Ativos', value: '1,248', icon: Users, color: 'bg-green-100 text-green-600' },
    { label: 'Pedidos de Oração', value: '12', icon: Heart, color: 'bg-red-100 text-red-600' },
    { label: 'Vídeos Recentes', value: '45', icon: Video, color: 'bg-purple-100 text-purple-600' },
  ];

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCnpj.replace(/[^0-9]/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Caminho oficial no seu Supabase
  const flyerUrl = "https://luvdpnpnzotosndovtry.supabase.co/storage/v1/object/public/midia/pix-flyer-3ipi.png";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel de Controle</h1>
        <p className="text-gray-500 dark:text-gray-400">Aqui está o que está acontecendo na 3IPI hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avisos */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Avisos da Semana</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 group hover:bg-brand-blue/5 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-brand-yellow flex-shrink-0 flex items-center justify-center font-bold text-brand-darkBlue shadow-sm group-hover:scale-110 transition-transform">
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

        {/* Card Dízimos e Ofertas */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-0 shadow-2xl shadow-black/10 overflow-hidden group flex flex-col border border-gray-100 dark:border-gray-700">
          <div className="p-8 pb-4 text-center">
            <h2 className="text-2xl font-black text-brand-darkBlue dark:text-white uppercase tracking-tighter">Dízimos e Ofertas</h2>
          </div>
          
          <div className="flex-1 px-8 flex flex-col items-center">
            {/* Flyer Image Container */}
            <div className="relative w-full max-w-[240px] aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border-4 border-gray-50 dark:border-gray-700 group-hover:scale-[1.02] transition-transform duration-500 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {!imageError ? (
                <img 
                  src={flyerUrl} 
                  alt="Flyer Dízimos e Ofertas 3IPI" 
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="text-center p-6 flex flex-col items-center">
                  <ImageOff size={48} className="text-gray-300 mb-2" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                    Flyer não encontrado.<br/>Upload necessário no bucket 'midia' como 'pix-flyer-3ipi.png'
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/20 to-transparent pointer-events-none"></div>
            </div>

            {/* CNPJ e Botão Copiar */}
            <div className="w-full mt-6 space-y-4">
              <div className="bg-brand-blue dark:bg-brand-blue/20 rounded-2xl p-3 flex items-center justify-between border border-brand-blue/10">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <QrCode size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">{pixCnpj}</span>
                </div>
                <button 
                  onClick={handleCopyPix}
                  className="bg-white/10 hover:bg-white/30 p-2 rounded-xl transition-all text-white active:scale-90"
                  title="Copiar CNPJ PIX"
                >
                  {copied ? <CheckCircle2 size={20} className="text-brand-yellow" /> : <Copy size={20} />}
                </button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-[10px] leading-tight font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest px-2">
                  Aponte a câmera do seu celular para o código acima e faça a sua contribuição.
                </p>
                <div className="pt-2">
                  <p className="text-xs font-bold italic text-brand-blue dark:text-brand-yellow">"Deus ama o que dá com alegria"</p>
                  <p className="text-[10px] font-black text-gray-400 opacity-60">2CORÍNTIOS 9:7</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-6 bg-brand-blue mt-6"></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute left-0 top-0 w-2 h-full bg-brand-yellow"></div>
        <div className="mb-6 md:mb-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Novo no App?</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">Explore as seções de eventos e grupos para se conectar ainda mais com a nossa comunidade!</p>
        </div>
        <button className="bg-brand-blue text-white font-bold px-8 py-4 rounded-2xl hover:bg-brand-darkBlue transition-all shadow-lg shadow-brand-blue/20 active:scale-95">
          Ver Tutorial
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
