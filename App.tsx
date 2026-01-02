
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
    const timeoutId = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) await fetchOrCreateProfile(session.user.id, session.user.email || '');
      } catch (err) {
        setError("Não foi possível conectar ao servidor.");
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
      let { data, error } = await supabase.from('perfis').select('*').eq('id', userId).single();
      if (error && (error.code === 'PGRST116' || error.message.includes('row'))) {
        const { data: newData } = await supabase.from('perfis').insert([{ 
          id: userId, email: email, nome: email.split('@')[0], is_admin: false 
        }]).select().single();
        if (newData) data = newData;
      }
      if (data) setProfile(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-32 w-32 rounded-full border-4 border-gray-100 dark:border-gray-800 border-t-brand-blue animate-spin"></div>
          <Logo size="lg" className="animate-pulse" />
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-900 dark:text-white font-black text-xl tracking-tighter">3IPI</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Conectando você ao Reino</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-sm text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold dark:text-white mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold">Tentar Novamente</button>
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
