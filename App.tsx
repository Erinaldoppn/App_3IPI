
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Events from './pages/Events';
import Groups from './pages/Groups';
import Members from './pages/Members';
import Media from './pages/Media';
import PrayerRequests from './pages/PrayerRequests';
import AdminSettings from './pages/AdminSettings';
import Layout from './components/Layout';
import { Profile } from './types';
import { Loader2, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    // Fail-safe: se em 5 segundos não carregar, forçamos o encerramento do loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Tempo de conexão excedido. Forçando entrada.");
        setLoading(false);
      }
    }, 5000);

    const initSession = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error("Erro na autenticação:", authError);
          // Não lançamos erro aqui para permitir que o usuário veja a tela de login
        }
        
        setSession(session);
        
        if (session) {
          await fetchOrCreateProfile(session.user.id, session.user.email || '');
        }
      } catch (err) {
        console.error("Erro fatal ao inicializar sessão:", err);
        setError("Não foi possível conectar ao servidor. Tente novamente em alguns instantes.");
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchOrCreateProfile(session.user.id, session.user.email || '');
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const fetchOrCreateProfile = async (userId: string, email: string) => {
    try {
      let { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Se o perfil não existir (PGRST116), tentamos criar
      if (error && (error.code === 'PGRST116' || error.message.includes('row'))) {
        const { data: newData, error: insertError } = await supabase
          .from('perfis')
          .insert([{ 
            id: userId, 
            email: email, 
            nome: email.split('@')[0], 
            is_admin: false 
          }])
          .select()
          .single();
        
        if (!insertError) data = newData;
      }
      
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Erro ao carregar/criar perfil:", err);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 animate-in fade-in duration-700">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-gray-100 dark:border-gray-800 border-t-brand-blue animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="https://raw.githubusercontent.com/lucide-react/lucide/main/icons/church.svg" 
              className="w-8 h-8 opacity-20 dark:opacity-40" 
              alt="loading"
            />
          </div>
        </div>
        <div className="mt-8 text-center px-4">
          <p className="text-gray-900 dark:text-white font-bold text-lg">Conectando à 3IPI...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Preparando sua experiência espiritual</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 max-w-sm">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-blue/20"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.is_admin || false;

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={!session ? <Auth onToggleTheme={toggleTheme} isDark={darkMode} /> : <Navigate to="/dashboard" />} 
        />

        <Route 
          element={session ? <Layout onToggleTheme={toggleTheme} isDark={darkMode} session={session} isAdmin={isAdmin} /> : <Navigate to="/" />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quem-somos" element={<About />} />
          <Route path="/eventos" element={<Events isAdmin={isAdmin} />} />
          <Route path="/grupos" element={<Groups />} />
          <Route path="/membros" element={<Members />} />
          <Route path="/fotos-videos" element={<Media isAdmin={isAdmin} />} />
          <Route path="/pedidos-oracao" element={<PrayerRequests />} />
          {isAdmin && <Route path="/admin" element={<AdminSettings />} />}
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
