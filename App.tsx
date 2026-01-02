
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

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        
        if (session) {
          await fetchOrCreateProfile(session.user.id, session.user.email || '');
        }
      } catch (err) {
        console.error("Erro ao inicializar sessão:", err);
      } finally {
        // Garante que o carregamento termine mesmo em caso de erro
        setLoading(false);
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

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrCreateProfile = async (userId: string, email: string) => {
    try {
      let { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();
      
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
      console.error("Erro ao carregar perfil:", err);
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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Conectando à 3IPI...</p>
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
