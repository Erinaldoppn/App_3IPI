
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
import Logo from './components/Logo';
import { Profile } from './types';
import { AlertCircle, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [slowConnection, setSlowConnection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    // Monitor de conexão lenta (comum quando o Supabase está "acordando")
    const slowTimer = setTimeout(() => {
      if (loading) setSlowConnection(true);
    }, 3000);

    const initSession = async () => {
      try {
        console.log("Conectando ao Supabase...");
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        setSession(currentSession);
        
        if (currentSession) {
          await fetchOrCreateProfile(currentSession.user.id, currentSession.user.email || '');
        }
      } catch (err: any) {
        console.error("Erro na inicialização:", err);
        setError("Não foi possível conectar ao servidor. O banco de dados pode estar em manutenção ou acordando.");
      } finally {
        setLoading(false);
        clearTimeout(slowTimer);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchOrCreateProfile(newSession.user.id, newSession.user.email || '');
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(slowTimer);
    };
  }, []);

  const fetchOrCreateProfile = async (userId: string, email: string) => {
    try {
      let { data, error } = await supabase.from('perfis').select('*').eq('id', userId).maybeSingle();
      
      if (!data && !error) {
        const { data: newData, error: insertError } = await supabase.from('perfis').insert([{ 
          id: userId, email: email, nome: email.split('@')[0], is_admin: false 
        }]).select().single();
        
        if (newData) data = newData;
        if (insertError) console.error("Erro ao criar perfil:", insertError);
      }
      
      if (data) setProfile(data);
    } catch (err) { 
      console.error("Erro ao buscar perfil:", err); 
    }
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-500">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-32 w-32 rounded-full border-4 border-gray-100 dark:border-gray-800 border-t-brand-blue animate-spin"></div>
          <Logo size="lg" className="animate-pulse" />
        </div>
        <div className="mt-8 text-center space-y-2 animate-in fade-in duration-700">
          <p className="text-gray-900 dark:text-white font-black text-xl tracking-tighter uppercase">Igreja 3IPI</p>
          <div className="flex flex-col items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {slowConnection ? 'O servidor está acordando, por favor aguarde...' : 'Conectando à sua comunidade...'}
            </p>
            {slowConnection && (
              <span className="mt-4 px-3 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-bold rounded-full animate-pulse">
                ESTABELECENDO CONEXÃO SEGURA
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl max-w-sm text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-black dark:text-white mb-3 tracking-tighter">Ops! Sem Conexão</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-blue/20 transition-all active:scale-95"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={!session ? <Auth onToggleTheme={() => setDarkMode(!darkMode)} isDark={darkMode} /> : <Navigate to="/dashboard" />} />
        <Route element={session ? <Layout onToggleTheme={() => setDarkMode(!darkMode)} isDark={darkMode} session={session} isAdmin={profile?.is_admin || false} /> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quem-somos" element={<About />} />
          <Route path="/eventos" element={<Events isAdmin={profile?.is_admin} />} />
          <Route path="/grupos" element={<Groups />} />
          <Route path="/membros" element={<Members isAdmin={profile?.is_admin} />} />
          <Route path="/fotos-videos" element={<Media isAdmin={profile?.is_admin} />} />
          <Route path="/pedidos-oracao" element={<PrayerRequests />} />
          {profile?.is_admin && <Route path="/admin" element={<AdminSettings />} />}
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
