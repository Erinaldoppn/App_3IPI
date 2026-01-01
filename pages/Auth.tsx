
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Moon, Sun, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: name } }
        });
        
        if (signUpError) {
            if (signUpError.message.includes('invalid') && signUpError.message.includes('Email')) {
                throw { 
                    message: "Este domínio de e-mail não foi reconhecido pelo servidor.",
                    hint: "Dica: No painel do Supabase, desative 'Validate email address' em Auth Settings ou use um e-mail comum (Gmail/Outlook) para testes."
                };
            }
            throw signUpError;
        }
        
        alert('Cadastro realizado! Verifique sua caixa de entrada (ou spam) se a confirmação estiver ativa.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError({ 
        message: err.message || 'Ocorreu um erro inesperado.',
        hint: err.hint
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900">
      {/* Lado Esquerdo: Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-blue relative flex-col items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow rounded-full -mr-20 -mt-20 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-darkBlue rounded-full -ml-32 -mb-32 opacity-30 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo Container com Animação Float */}
          <div className="bg-brand-yellow p-8 rounded-[3rem] mb-10 shadow-2xl animate-float shadow-brand-yellow/30 border-4 border-white/20">
            <img 
              src="https://luvdpnpnzotosndovtry.supabase.co/storage/v1/object/public/assets/logo-3ipi.png" 
              alt="Logo Igreja 3IPI" 
              className="w-32 h-32 object-contain drop-shadow-xl"
              onError={(e) => {
                // Fallback para caso o link da imagem mude ou não carregue
                (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/church.svg';
              }}
            />
          </div>
          <h1 className="text-6xl font-bold mb-4 tracking-tighter">Igreja 3IPI</h1>
          <p className="text-xl text-blue-100 max-w-md text-center font-medium leading-relaxed">
            Uma comunidade moderna, conectada por valores e movida pela fé. Bem-vindo à nossa casa digital.
          </p>
        </div>
      </div>

      {/* Lado Direito: Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col relative p-8 md:p-16">
        <button 
          onClick={onToggleTheme}
          className="absolute top-8 right-8 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform"
        >
          {isDark ? <Sun /> : <Moon />}
        </button>

        <div className="max-w-md w-full mx-auto my-auto space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isLogin 
                ? 'Acesse sua conta para ficar por dentro de tudo na 3IPI.' 
                : 'Junte-se à nossa comunidade hoje mesmo.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-xl outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 caret-brand-blue font-medium"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="exemplo@3ipi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-xl outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 caret-brand-blue font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-xl outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 caret-brand-blue font-medium"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <div className="flex items-center font-bold mb-1">
                  <AlertCircle size={16} className="mr-2" />
                  <span>Erro no cadastro</span>
                </div>
                <p>{error.message}</p>
                {error.hint && (
                  <p className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded border border-red-100 dark:border-red-900/40 text-xs font-medium">
                    {error.hint}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-blue hover:bg-brand-darkBlue text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-blue/20 transition-all duration-200 flex items-center justify-center space-x-2 active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span>{isLogin ? 'Entrar' : 'Cadastrar'}</span>
              )}
            </button>
          </form>

          <div className="pt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-blue font-semibold hover:underline decoration-2 underline-offset-4"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
            </button>
          </div>
        </div>

        <div className="mt-auto text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Igreja 3IPI. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Auth;