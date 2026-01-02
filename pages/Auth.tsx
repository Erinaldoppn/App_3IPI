
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Moon, Sun, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

interface AuthProps {
  onToggleTheme: () => void;
  isDark: boolean;
}

const Auth: React.FC<AuthProps> = ({ onToggleTheme, isDark }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        alert('Cadastro realizado!');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-blue relative flex-col items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow rounded-full opacity-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white p-8 rounded-[3rem] mb-10 shadow-2xl animate-float shadow-brand-yellow/30 border-4 border-brand-yellow/20">
            <Logo size="lg" />
          </div>
          <h1 className="text-6xl font-bold mb-4 tracking-tighter">Igreja 3IPI</h1>
          <p className="text-xl text-blue-100 max-w-md text-center font-medium leading-relaxed">
            Uma comunidade moderna, conectada por valores e movida pela fé. Bem-vindo à nossa casa digital.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col relative p-8 md:p-16">
        <button onClick={onToggleTheme} className="absolute top-8 right-8 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform">
          {isDark ? <Sun /> : <Moon />}
        </button>

        <div className="max-w-md w-full mx-auto my-auto space-y-8 bg-white dark:bg-transparent p-8 lg:p-0 rounded-3xl border border-gray-100 lg:border-none dark:border-none">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Acesse sua conta para ficar por dentro de tudo na 3IPI.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-semibold dark:text-gray-300">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ex: João da Silva"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:border-brand-blue rounded-xl outline-none text-gray-900 dark:text-white transition-colors" 
                    required 
                  />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-semibold dark:text-gray-300">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="exemplo@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:border-brand-blue rounded-xl outline-none text-gray-900 dark:text-white transition-colors" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold dark:text-gray-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:border-brand-blue rounded-xl outline-none text-gray-900 dark:text-white transition-colors" 
                  required 
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm flex items-center border border-red-100 dark:border-transparent">
                <AlertCircle size={16} className="mr-2" />
                <span>{error.message}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" /> : <span>{isLogin ? 'Entrar' : 'Cadastrar'}</span>}
            </button>
          </form>

          <div className="pt-4 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-brand-blue font-semibold hover:underline">
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
