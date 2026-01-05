
import React, { useState, useEffect, useCallback } from 'react';
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
import { WifiOff, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [slowConnection, setSlowConnection] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Usamos .select().single() para ser mais rápido que o filtro genérico
      const { data, error } = await supabase
        .from('perfis')
        .select('id, email, nome, is_admin')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Se o perfil não existe, tentamos criar um básico (silenciosamente)
        if (error.code === 'PGRST116') {
          const { data: user } = await supabase.auth.getUser();
          if (user.user) {
            const { data: newProfile } = await supabase.from('perfis').insert([{ 
              id: userId, 
              email: user.user.email, 
              nome: user.user.email?.split('@')[0] || 'Membro',
              is_admin: false 
            }]).select().single();
            if (newProfile) setProfile(newProfile);
          }
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (err) { 
      console.error("Erro ao buscar perfil:", err); 
    }
  }, []);

  const initSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSlowConnection(false);
    setShowRetry(false);

    const slowTimer = setTimeout(() => setSlowConnection(true), 3500);
    const retryTimer = setTimeout(() => setShowRetry(true), 12000);

    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      setSession(currentSession);
      
      if (currentSession) {
        await fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    } catch (err: any) {
      console.error("Erro na inicialização:", err);
      // Só mostra erro se for falha de conexão real, não apenas sessão vazia
      if (err.message !== 'Auth session missing') {
        setError("Não foi possível conectar ao servidor.");
      }
      setLoading(false);
    } finally {
      clearTimeout(slowTimer);
      clearTimeout(retryTimer);
    }
  }, [fetchProfile]);

  useEffect(() => {
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initSession, fetchProfile]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800">
          <div className="h-full bg-brand-blue animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
        </div>

        <div className="relative flex items-center justify-center mb-12">
          <div className="absolute h-40 w-40 rounded-full border-2 border-gray-100 dark:border-gray-800 border-t-brand-blue animate-spin duration-1000"></div>
          <Logo size="lg" className="animate-pulse relative z-10" />
        </div>

        <div className="text-center space-y-6 max-w-xs animate-in fade-in zoom-in duration-700">
          <div className="space-y-1">
            <h2 className="text-gray-900 dark:text-white font-black text-2xl tracking-tighter uppercase">Igreja 3IPI</h2>
            <p className="text-brand-blue text-[10px] font-black tracking-[0.3em] uppercase opacity-60">Sincronizando Dados</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
              {slowConnection 
                ? 'O servidor está otimizando a conexão para você...' 
                : 'Iniciando ambiente seguro...'}
            </p>
            
            {showRetry && (
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 flex items-center space-x-2 text-brand-blue font-bold text-xs bg-white dark:bg-gray-800 shadow-xl px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700"
              >
                <RefreshCw size={14} />
                <span>Recarregar Página</span>
              </button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
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
          <h2 className="text-2xl font-black dark:text-white mb-3 tracking-tighter">Erro de Conexão</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm leading-relaxed">
            Houve um problema ao conectar com o banco de dados. Por favor, tente novamente.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-brand-blue text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-blue/20 flex items-center justify-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>Tentar Novamente</span>
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
