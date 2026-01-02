
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Calendar, Info, UsersRound, Image as ImageIcon, 
  Heart, Menu, X, Moon, Sun, LogOut, User, Settings
} from 'lucide-react';
import { supabase } from '../supabase';
import Logo from './Logo';

interface LayoutProps {
  onToggleTheme: () => void;
  isDark: boolean;
  session: any;
  isAdmin: boolean;
}

const Layout: React.FC<LayoutProps> = ({ onToggleTheme, isDark, session, isAdmin }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Início', icon: Home, path: '/dashboard' },
    { name: 'Quem Somos', icon: Info, path: '/quem-somos' },
    { name: 'Eventos', icon: Calendar, path: '/eventos' },
    { name: 'Grupos', icon: UsersRound, path: '/grupos' },
    { name: 'Membros', icon: Users, path: '/membros' },
    { name: 'Fotos & Vídeos', icon: ImageIcon, path: '/fotos-videos' },
    { name: 'Pedidos de Oração', icon: Heart, path: '/pedidos-oracao' },
  ];

  if (isAdmin) navItems.push({ name: 'Configurações Admin', icon: Settings, path: '/admin' });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      <header className="md:hidden bg-brand-darkBlue text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <Logo size="sm" />
          <h1 className="font-bold text-xl tracking-tighter">3IPI</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-darkBlue text-white transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-8 hidden md:block border-b border-blue-800/50">
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 group hover:bg-white/20 transition-all cursor-default flex items-center justify-center">
              <Logo size="md" className="group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl tracking-tighter leading-none">3IPI</h1>
              <p className="text-[10px] text-blue-300 mt-1 uppercase tracking-[0.3em] font-black opacity-60">Igreja Conectada</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20' : 'hover:bg-blue-700/50 text-gray-300 hover:text-white'}`}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={isActive ? 'animate-pulse' : ''} />
                  <span className="font-bold text-sm">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800/50 space-y-2">
          <button onClick={onToggleTheme} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-800/50 transition-colors text-sm font-bold text-gray-300">
            {isDark ? <Sun size={20} className="text-brand-yellow" /> : <Moon size={20} />}
            <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-800/30 transition-colors text-red-300 text-sm font-bold">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="hidden md:flex bg-white dark:bg-gray-800 border-b dark:border-gray-700 h-16 items-center justify-between px-8">
          <div className="flex items-center space-x-4">
             <h2 className="text-gray-500 dark:text-gray-400 font-bold text-sm">Olá, seja bem-vindo à <span className="text-brand-blue">3IPI Online</span></h2>
             {isAdmin && <span className="bg-brand-yellow text-brand-darkBlue text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Administrador</span>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 px-4 py-1.5 rounded-full border border-gray-100 dark:border-gray-600">
              <User size={16} className="text-brand-blue" />
              <span className="truncate max-w-[150px]">{session?.user?.email}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default Layout;
