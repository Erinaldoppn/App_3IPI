
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Info, 
  UsersRound, 
  Image as ImageIcon, 
  Heart, 
  Menu, 
  X, 
  Moon, 
  Sun,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { supabase } from '../supabase';

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

  if (isAdmin) {
    navItems.push({ name: 'Configurações Admin', icon: Settings, path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      <header className="md:hidden bg-brand-darkBlue text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold text-xl">3IPI</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-brand-darkBlue text-white transition-transform duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:relative md:translate-x-0 flex flex-col
        `}
      >
        <div className="p-6 hidden md:block">
          <h1 className="font-bold text-2xl tracking-tighter">3IPI</h1>
          <p className="text-xs text-blue-300 mt-1 uppercase tracking-widest font-semibold">Igreja Conectada</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-brand-blue text-white shadow-lg' : 'hover:bg-blue-700 text-gray-200'}
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800 space-y-2">
          <button 
            onClick={onToggleTheme}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-800 transition-colors text-red-200"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="hidden md:flex bg-white dark:bg-gray-800 border-b dark:border-gray-700 h-16 items-center justify-between px-8">
          <div className="flex items-center space-x-4">
             <h2 className="text-gray-600 dark:text-gray-300 font-medium">Seja bem-vindo(a)!</h2>
             {isAdmin && <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Admin</span>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span className="bg-brand-blue/10 text-brand-blue p-2 rounded-full">
                <User size={18} />
              </span>
              <span>{session?.user?.email}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
