import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Lock, Mail, Github, Layout } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onLogin: () => void;
  onCheckout: () => void;
}

export default function LoginPage({ onBack, onLogin, onCheckout }: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Unexpected response:', text);
        throw new Error(`Erro do servidor (${response.status}). Verifique se o backend está rodando corretamente.`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Falha na operação');
      }

      if (isRegister) {
        setSuccess('Conta criada com sucesso! Faça login agora.');
        setIsRegister(false);
      } else {
        onLogin();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col md:flex-row items-stretch overflow-hidden">
      {/* Left side: Branding/Promo */}
      <div className="hidden lg:flex flex-1 relative bg-brand-purple p-20 flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-black rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center font-black italic text-brand-purple text-2xl">DS</div>
          <span className="font-black uppercase tracking-tighter text-3xl text-black">Company</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.85] text-black">
            {isRegister ? 'Nova' : 'Área de'} <br /> <span className="text-white">{isRegister ? 'Conta' : 'Estudo'}</span>
          </h1>
          <p className="text-black/60 font-bold uppercase tracking-widest text-sm">
            {isRegister ? 'Comece sua jornada agora.' : 'Acesse seus cursos, projetos e ferramentas.'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
           <div className="w-12 h-12 rounded-full border-2 border-black/20 flex items-center justify-center text-black">
              <Layout size={24} />
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-black/50 italic leading-tight">
             Plataforma exclusiva <br /> para alunos da ds Company.
           </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex flex-col p-8 md:p-20 justify-center items-center relative">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-xs font-black uppercase text-slate-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={isRegister ? 'register' : 'login'}
          className="w-full max-w-sm space-y-10"
        >
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter">{isRegister ? 'Cadastrar' : 'Entrar'}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              {isRegister ? 'Crie sua conta profissional.' : 'Bem-vindo de volta, futuro dev.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-[10px] font-black uppercase tracking-widest">
                  {success}
                </div>
              )}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-purple transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="EMAIL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:border-brand-purple focus:outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-purple transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="SENHA"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest focus:border-brand-purple focus:outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-5 bg-white text-black font-black uppercase text-sm tracking-widest rounded-xl hover:bg-brand-purple hover:text-white transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] disabled:opacity-50"
            >
              {loading ? 'Processando...' : isRegister ? 'Criar Conta' : 'Acessar Plataforma'}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-600 bg-[#09090b] px-4">
                Ou
              </div>
            </div>

            <button 
              className="w-full py-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Já tenho conta' : 'Quero me cadastrar'}
            </button>
          </div>

          <p className="text-center text-[10px] font-black uppercase text-slate-600 tracking-widest pb-12">
            Ainda não é aluno? <button onClick={onCheckout} className="text-brand-purple hover:underline">Assine agora</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
