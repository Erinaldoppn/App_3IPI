
import React, { useState } from 'react';
import { Calendar, Users, Heart, Video, QrCode, Copy, CheckCircle2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [copied, setCopied] = useState(false);
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

        {/* Card Dízimos e Ofertas (Inspirado na imagem enviada) */}
        <div className="bg-brand-blue rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col items-center text-center shadow-2xl shadow-brand-blue/30 group">
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-yellow/10 rounded-full -ml-16 -mb-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

          <div className="relative z-10 w-full">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">Dízimos</h2>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 opacity-80 leading-none">e Ofertas</h2>
            
            {/* Área do QR Code */}
            <div className="bg-white p-4 rounded-3xl mb-6 shadow-xl inline-block group-hover:rotate-2 transition-transform duration-500">
              <div className="p-2 border-4 border-[#CCFF00] rounded-xl">
                 <img 
                  src="https://luvdpnpnzotosndovtry.supabase.co/storage/v1/object/public/assets/qr-code-3ipi.png" 
                  alt="QR Code PIX 3IPI" 
                  className="w-32 h-32 md:w-40 md:h-40 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix0114623327350001705204000053039865802BR5910Igreja3IPI6009SAO PAULO62070503***6304E2B1';
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="bg-brand-yellow p-1.5 rounded-lg">
                    <QrCode size={16} className="text-brand-darkBlue" />
                  </div>
                  <span className="text-xs font-bold font-mono tracking-tight">{pixCnpj}</span>
                </div>
                <button 
                  onClick={handleCopyPix}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Copiar CNPJ PIX"
                >
                  {copied ? <CheckCircle2 size={18} className="text-brand-yellow" /> : <Copy size={18} />}
                </button>
              </div>

              <p className="text-[10px] leading-tight font-bold opacity-80 uppercase tracking-widest px-4">
                Aponte a câmera do seu celular para o código acima e faça a sua contribuição.
              </p>

              <div className="pt-4 border-t border-white/10">
                <p className="text-[11px] font-bold italic text-brand-yellow">"Deus ama o que dá com alegria"</p>
                <p className="text-[9px] font-black opacity-60">2CO 9:7</p>
              </div>
            </div>
          </div>
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
