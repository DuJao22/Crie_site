/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Sparkles, 
  UploadCloud, 
  Rocket, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  ExternalLink,
  BookOpen,
  AlertCircle,
  Lightbulb,
  DollarSign,
  Instagram,
  Settings,
  Send,
  Database,
  Layers,
  Code,
  Lock,
  Trophy,
  XCircle,
  Home,
  Clock,
  User,
  Play,
  FileText,
  MessageSquare as MessageSquareIcon,
  Users,
  CheckSquare,
  Layout,
  Menu,
  X
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import CheckoutPage from './components/CheckoutPage';
import AdminPanel from './components/AdminPanel';

// --- Constants & Types ---

type Step = {
  id: number;
  title: string;
  subtitle: string;
  icon: ReactNode;
  content: ReactNode;
  color: string;
};

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const progress = ((current + 1) / total) * 100;
  return (
    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-8 relative">
      <motion.div 
        className="absolute top-0 left-0 h-full bg-blue-600"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
    </div>
  );
};

const SuccessBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wider">
    <CheckCircle2 size={12} /> Resultado
  </span>
);

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
};

const QUESTIONS: QuizQuestion[] = [
  {
    question: "O que é o GitHub na prática?",
    options: ["Um editor de fotos online", "Uma rede social de vídeos", "Um 'Google Drive' para códigos na nuvem", "Um site de compras"],
    correct: 2
  },
  {
    question: "Qual o comando/ação usado para 'salvar' uma versão do código localmente?",
    options: ["Push", "Commit", "Download", "Delete"],
    correct: 1
  },
  {
    question: "Para o site funcionar no ar, qual deve ser o nome do arquivo principal?",
    options: ["home.html", "index.html", "site.php", "main.js"],
    correct: 1
  },
  {
    question: "O que o app.new faz com base em um prompt?",
    options: ["Cria um logo", "Gera uma conta no banco", "Cria um site completo em HTML/CSS", "Envia emails"],
    correct: 2
  },
  {
    question: "Qual plataforma usamos para deixar o site online (Deploy)?",
    options: ["Vercel", "Facebook", "WhatsApp", "Spotify"],
    correct: 0
  },
  {
    question: "O que é o 'Push' na integração Git?",
    options: ["Apagar o projeto", "Enviar as alterações para o GitHub", "Baixar os arquivos", "Mudar o nome do autor"],
    correct: 1
  },
  {
    question: "Como você deve subir arquivos no GitHub se baixar um .zip?",
    options: ["Sobe o .zip direto", "Renomeia para .png", "Descompacta e sobe os arquivos soltos", "Não precisa de arquivos"],
    correct: 2
  },
  {
    question: "Qual a principal vantagem de um Mini SaaS?",
    options: ["É muito complexo", "Resolve um problema específico rapidamente", "Não precisa de internet", "É gratuito para sempre"],
    correct: 1
  },
  {
    question: "Para conectar Vercel ao GitHub, o que é necessário?",
    options: ["Pagar uma taxa", "Autorizar o acesso aos repositórios", "Enviar um pendrive por correio", "Saber falar inglês fluido"],
    correct: 1
  },
  {
    question: "O que é o 'Prompt' no contexto de IA?",
    options: ["Um vírus", "Uma senha secreta", "A instrução em texto que guia a IA", "O nome do computador"],
    correct: 2
  }
];

export default function App() {
  const [view, setView] = useState<'landing' | 'login' | 'dashboard' | 'lesson' | 'checkout' | 'admin'>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizProgress, setQuizProgress] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [module2Unlocked, setModule2Unlocked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [user, setUser] = useState<{ email: string, is_paid: number, is_admin: number } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Check auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            setUser(data.user);
            
            if (data.user.is_paid === 0) {
              setView('checkout');
            } else {
              setView('dashboard');
            }
          }
        }
      } catch (e) {
        console.error('Auth check failed', e);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setView('landing');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const handleLoginSuccess = async () => {
    // Re-verify session after login
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      
      if (data.user.is_paid === 0) {
        setView('checkout');
      } else {
        setView('dashboard');
      }
    }
  };

  // Simulation of module progress
  const moduleProgress = useMemo(() => [
    { id: 0, title: "Fundamentos", desc: "Entenda os conceitos e ferramentas essenciais para começar.", progress: 100, icon: <BookOpen className="w-5 h-5" /> },
    { id: 1, title: "Criação de Sites com IA", desc: "Crie sites profissionais utilizando inteligência artificial.", progress: 75, icon: <Sparkles className="w-5 h-5" /> },
    { id: 2, title: "Desenvolvendo um Mini SaaS", desc: "Crie aplicações completas e funcionais passo a passo.", progress: 50, icon: <Layers className="w-5 h-5" /> },
    { id: 3, title: "Deploy e Publicação", desc: "Publique seus projetos e deixe-os disponíveis para o mundo.", progress: 25, icon: <Rocket className="w-5 h-5" /> },
    { id: 4, title: "Monetização", desc: "Estratégias para vender seus projetos e escalar seu negócio.", progress: 0, icon: <DollarSign className="w-5 h-5" />, locked: !module2Unlocked },
  ], [module2Unlocked]);

  const overallProgress = 60; // Mock overall progress

  const score = useMemo(() => {
    return answers.reduce((acc, ans, idx) => {
      return ans === QUESTIONS[idx].correct ? acc + 1 : acc;
    }, 0);
  }, [answers]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (view === 'landing' && !user) {
    return <LandingPage onStart={() => setView('checkout')} onLogin={() => setView('login')} />;
  }

  if (view === 'login' && !user) {
    return <LoginPage onBack={() => setView('landing')} onLogin={handleLoginSuccess} onCheckout={() => setView('checkout')} />;
  }

  if (view === 'checkout') {
    return <CheckoutPage onBack={() => setView('landing')} onSuccess={() => setView('dashboard')} />;
  }

  if (view === 'admin' && user?.is_admin) {
    return <AdminPanel onBack={() => setView('dashboard')} />;
  }

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers, optionIdx];
    setAnswers(newAnswers);
    if (quizProgress < QUESTIONS.length - 1) {
      setQuizProgress(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setQuizProgress(0);
    setAnswers([]);
    setShowResult(false);
  };

  const startQuiz = () => {
    setIsQuizMode(true);
    resetQuiz();
  };

  const finishQuiz = () => {
    if (score >= 7) {
      setModule2Unlocked(true);
      setIsQuizMode(false);
      setCurrentStep(4);
    } else {
      resetQuiz();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps: Step[] = [
    {
      id: 0,
      title: "GitHub",
      subtitle: "Onde o código vive na nuvem.",
      icon: <Github className="w-6 h-6" />,
      color: "bg-white text-black",
      content: (
        <div className="space-y-8">
          <div className="bg-white/5 p-6 border border-white/10 rounded-sm">
            <h4 className="font-black text-[#00FF88] uppercase tracking-wider flex items-center gap-2 mb-3 text-sm">
              <BookOpen size={18} /> O que é o GitHub?
            </h4>
            <p className="text-slate-400 text-base leading-relaxed font-medium">
              É onde você guarda seus projetos (código) na nuvem. Pense nele como o "Google Drive" dos programadores, mas muito mais potente.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-black uppercase tracking-tighter text-2xl text-white">Passo a passo</h4>
            <ol className="space-y-4 text-slate-300 text-base font-bold uppercase tracking-tight">
              <li className="flex gap-4 items-start"><span className="text-[#00FF88]">01.</span> Acesse o <a href="https://github.com" target="_blank" className="text-[#00FF88] hover:underline inline-flex items-center gap-1">GitHub Oficial <ExternalLink size={14} /></a></li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88]">02.</span> Clique em <strong className="text-white">Sign up</strong></li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88]">03.</span> Preencha: Email, Senha e Nome</li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88]">04.</span> Confirme o e-mail recebido</li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88]">05.</span> Escolha o plano gratuito</li>
            </ol>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="bg-white text-black px-4 py-1 font-black text-xs inline-block mb-3">RESULTADO</div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest italic">Conta criada! Você está pronto para o futuro.</p>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "App.new",
      subtitle: "IA que gera sites com descrição.",
      icon: <Sparkles className="w-6 h-6" />,
      color: "bg-[#00FF88] text-black",
      content: (
        <div className="space-y-8">
          <div className="bg-[#00FF88]/5 p-6 border border-[#00FF88]/20 rounded-sm">
            <h4 className="font-black text-[#00FF88] uppercase tracking-wider flex items-center gap-2 mb-3 text-sm">
              <BookOpen size={18} /> O que é o app.new?
            </h4>
            <p className="text-slate-400 text-base leading-relaxed font-medium">
              Uma ferramenta de IA que gera sites completos apenas com descrições em texto.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-black uppercase tracking-tighter text-2xl text-white flex items-center gap-2">
              <MessageSquareIcon size={24} className="text-[#00FF88]" /> Prompt Recomendado
            </h4>
            <div className="relative group">
              <pre className="bg-[#1A1A1E] text-slate-300 p-6 rounded-sm text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed border border-white/5 font-mono shadow-2xl">
                {`Crie uma página web completa em um único arquivo HTML.

Requisitos:
- Design moderno e profissional
- Responsivo (funciona no celular)
- Seções: Hero, Sobre, Serviços, Contato
- Animações suaves ao rolar a página
- Botões com efeito hover
- Código limpo e organizado`}
              </pre>
              <button 
                onClick={() => copyToClipboard(`Crie uma página web completa em um único arquivo HTML.\n\nRequisitos:\n- Design moderno e profissional\n- Responsivo (funciona no celular)\n- Seções: Hero, Sobre, Serviços, Contato\n- Animações suaves ao rolar a página\n- Botões com efeito hover\n- Código limpo e organizado`)}
                className="absolute top-4 right-4 p-3 bg-[#00FF88] hover:bg-[#00E57A] text-black rounded-sm transition-all flex items-center gap-2 text-xs font-black uppercase shadow-lg shadow-[#00FF88]/20 active:scale-95"
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar Prompt'}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3">
             <h4 className="font-black uppercase tracking-widest text-[#00FF88] text-xs">Importante:</h4>
             <p className="text-sm text-slate-400 font-bold uppercase">Após gerar, exporte os arquivos para seu computador.</p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Git Connect",
      subtitle: "Sincronização direta sem terminal.",
      icon: <Database className="w-6 h-6" />,
      color: "bg-white text-black",
      content: (
        <div className="space-y-8">
          <div className="space-y-6 bg-white/5 border border-white/10 rounded-sm p-6">
            <h4 className="font-black text-[#00FF88] uppercase tracking-tighter text-xl flex items-center gap-2">
              <Settings size={20} /> 1. Configurando no app.new
            </h4>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wide">
              No painel do seu projeto, acesse <span className="text-white">Configurações → Integrações</span> e conecte sua conta do GitHub.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                  <p className="text-[10px] text-slate-500 font-black mb-1">REPOSITÓRIO</p>
                  <p className="text-xs text-white font-mono">meu-site-pro</p>
               </div>
               <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                  <p className="text-[10px] text-slate-500 font-black mb-1">VISIBILIDADE</p>
                  <p className="text-xs text-[#00FF88] font-bold uppercase">Public</p>
               </div>
            </div>
            <button className="w-full py-3 bg-[#00FF88] text-black font-black uppercase text-xs tracking-widest hover:bg-[#00E57A] transition-colors">
              Create Git Repository
            </button>
          </div>

          <div className="space-y-6 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-sm p-6">
            <h4 className="font-black text-white uppercase tracking-tighter text-xl flex items-center gap-2">
              <Send size={20} className="text-[#00FF88]" /> 2. Commit & Push
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <p className="text-xs font-black text-white uppercase">💾 COMMIT</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight italic">"Salva uma versão interna do seu trabalho"</p>
               </div>
               <div className="space-y-2">
                 <p className="text-xs font-black text-[#00FF88] uppercase">🚀 PUSH</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight italic">"Envia tudo para o GitHub na nuvem"</p>
               </div>
            </div>
            <div className="bg-black/40 p-3 font-mono text-[11px] text-slate-300 border-l-2 border-[#00FF88]">
              Mensagem: "Primeira versão do site criada com app.new"
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Vercel",
      subtitle: "Deploy profissional em segundos.",
      icon: <Rocket className="w-6 h-6" />,
      color: "bg-white text-black",
      content: (
        <div className="space-y-8">
          <div className="bg-white/5 p-6 border border-white/10 rounded-sm">
            <h4 className="font-black text-[#00FF88] uppercase tracking-wider flex items-center gap-2 mb-3 text-sm">
              <BookOpen size={18} /> O que é a Vercel?
            </h4>
            <p className="text-slate-400 text-base leading-relaxed font-medium">
              Transforma seu código do GitHub em um site acessível por um link real.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-black uppercase tracking-tighter text-2xl text-white">Etapas Finais</h4>
            <ol className="space-y-4 text-slate-300 text-base font-bold uppercase tracking-tight">
              <li className="flex gap-4 items-start"><span className="text-[#00FF88] font-mono">01/</span> Acesse <a href="https://vercel.com" target="_blank" className="text-[#00FF88] hover:underline inline-flex items-center gap-1">Vercel.com <ExternalLink size={14} /></a></li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88] font-mono">02/</span> Login com <strong className="text-white bg-white/10 px-2 py-0.5 rounded-sm">GitHub</strong></li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88] font-mono">03/</span> Autorize o acesso aos projetos</li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88] font-mono">04/</span> Importe <code className="text-white font-mono">meu-site</code></li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88] font-mono">05/</span> Clique em <strong className="bg-[#00FF88] text-black px-4 ml-2 rounded-sm shadow-[0_0_15px_rgba(0,255,136,0.3)]">Deploy</strong></li>
            </ol>
          </div>

          <div className="p-6 bg-[#00FF88] text-black shadow-[0_0_40px_rgba(0,255,136,0.2)]">
            <p className="text-[10px] font-black uppercase tracking-tighter mb-1">ONLINE 🔥</p>
            <p className="text-xs font-bold font-mono truncate">https://meu-site.vercel.app</p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Mini SaaS",
      subtitle: "Transforme código em um negócio lucrativo.",
      icon: <Layers className="w-6 h-6" />,
      color: "bg-white text-black",
      content: (
        <div className="space-y-8">
          <div className="bg-white/5 p-6 border border-white/10 rounded-sm">
            <h4 className="font-black text-[#00FF88] uppercase tracking-wider flex items-center gap-2 mb-3 text-sm">
              <Sparkles size={18} /> O que é um Mini SaaS?
            </h4>
            <p className="text-slate-400 text-base leading-relaxed font-medium">
              Aplicação simples, online, que resolve um problema específico. Rápido, útil e lucrativo.
            </p>
          </div>

          <div className="space-y-4">
             <h4 className="font-black uppercase tracking-tighter text-2xl text-white">Projeto: Gerador IA</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="p-3 bg-white/5 border border-white/10 font-mono text-[10px] text-slate-500 uppercase">HTML: Interface</div>
                <div className="p-3 bg-white/5 border border-white/10 font-mono text-[10px] text-slate-500 uppercase">CSS: Estilo Moderno</div>
                <div className="p-3 bg-white/5 border border-white/10 font-mono text-[10px] text-slate-500 uppercase">JS: Lógica de Geração</div>
             </div>
             <pre className="bg-[#1A1A1E] text-slate-300 p-4 rounded-sm text-[10px] overflow-x-auto font-mono border border-white/5 shadow-xl">
{`function gerar() {
  let prompt = document.getElementById("prompt").value;
  let html = "<html><body><h1>" + prompt + "</h1><p>Site gerado!</p></body></html>";
  document.getElementById("resultado").innerText = html;
}`}
             </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="p-4 bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88]">
               <p className="text-xs font-black uppercase mb-1">Como Monetizar</p>
               <p className="text-[10px] text-slate-300 font-bold uppercase leading-tight">Cobre por acesso premium, créditos de uso ou templates exclusivos. Ex: R$9,90/mês.</p>
             </div>
             <div className="p-4 bg-white/5 border border-white/10 text-white">
               <p className="text-xs font-black uppercase mb-1">Passo Profissional</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">Conecte APIs reais (OpenAI/Gemini), crie logins e limite o uso grátis.</p>
             </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-center">
             <p className="text-[10px] text-slate-500 font-black uppercase italic tracking-[0.3em]">"SaaS não é sobre código, é sobre resolver problemas."</p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Mantra",
      subtitle: "Dicas fundamentais e erros comuns.",
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "bg-[#00FF88] text-black",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-sm bg-red-600/10 border border-red-600/30">
             <h5 className="font-black text-red-500 uppercase tracking-widest text-xs flex items-center gap-2 mb-4">
               <AlertCircle size={16} /> Erros Críticos
             </h5>
             <ul className="text-xs text-slate-400 font-bold uppercase space-y-3">
               <li className="flex gap-2"><span className="text-red-500">❌</span> Esquecer de clicar em <strong className="text-white">Push</strong></li>
               <li className="flex gap-2"><span className="text-red-500">❌</span> Não escrever mensagem no commit</li>
               <li className="flex gap-2"><span className="text-red-500">❌</span> Criar repositório com nome errado</li>
             </ul>
          </div>
          <div className="p-6 rounded-sm bg-[#00FF88]/10 border border-[#00FF88]/30">
             <h5 className="font-black text-[#00FF88] uppercase tracking-widest text-xs flex items-center gap-2 mb-4">
               <Lightbulb size={16} /> Dicas de Ouro
             </h5>
             <ul className="text-xs text-slate-400 font-bold uppercase space-y-3">
               <li className="flex gap-2"><span className="text-[#00FF88]">✔</span> Imagens compactadas</li>
               <li className="flex gap-2"><span className="text-[#00FF88]">✔</span> Teste mobile exaustivo</li>
               <li className="flex gap-2"><span className="text-[#00FF88]">✔</span> Git Commit frequente</li>
             </ul>
          </div>
          
          <div className="md:col-span-2 p-8 rounded-sm bg-white text-black relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
              <DollarSign size={200} className="text-black" />
            </div>
            <h5 className="text-4xl font-black uppercase tracking-tighter mb-6 relative">
              <span className="text-slate-400">0$ -&gt;</span> DINHEIRO REAL
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              <div className="space-y-1">
                <p className="text-sm font-black uppercase">Landing Pages</p>
                <p className="text-xs text-slate-500 font-bold uppercase">Crie páginas de alta conversão.</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black uppercase">Sites Locais</p>
                <p className="text-xs text-slate-500 font-bold uppercase">Atenda lojas e negócios físicos.</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black uppercase">Scripts Prontos</p>
                <p className="text-xs text-slate-500 font-bold uppercase">Venda estruturas de UI customizadas.</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black uppercase">Branding Digital</p>
                <p className="text-xs text-slate-500 font-bold uppercase">Ajude profissionais com portfólios.</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-bg-deep font-sans flex flex-col md:flex-row overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-black/40 border-b border-white/10 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center font-black italic text-black shrink-0">DS</div>
            <span className="font-black uppercase tracking-tighter text-lg truncate">Company</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-2">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-20 border-r border-white/10 flex flex-col items-center py-8 gap-10 bg-black/80 backdrop-blur-3xl shrink-0 transition-transform duration-300 md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="hidden md:flex w-10 h-10 bg-brand-purple/20 rounded-xl items-center justify-center text-brand-purple border border-brand-purple/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Layout size={24} />
          </div>
          
          <nav className="flex flex-col gap-8">
            <button className="text-white/40 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}><Home size={22} /></button>
            <button className="text-brand-purple flex flex-col items-center gap-1 border-r-2 border-brand-purple pr-2 -mr-2" onClick={() => setIsSidebarOpen(false)}><BookOpen size={22} /></button>
            <button className="text-white/40 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}><Code size={22} /></button>
            <button className="text-white/40 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}><Rocket size={22} /></button>
            <button className="text-white/40 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}><Clock size={22} /></button>
            {user?.is_admin === 1 && (
              <button 
                className={`transition-colors ${view === 'admin' ? 'text-brand-purple border-r-2 border-brand-purple' : 'text-white/40 hover:text-white'}`} 
                onClick={() => { setView('admin'); setIsSidebarOpen(false); }}
              >
                <Users size={22} />
              </button>
            )}
          </nav>

          <button onClick={handleLogout} className="mt-auto text-white/40 hover:text-white transition-colors group relative">
            <User size={22} />
            <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Sair
            </div>
          </button>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 md:p-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 pt-8 md:pt-12">
            
            {/* Left Content */}
            <div className="lg:w-2/5 flex flex-col justify-center gap-6 md:gap-8 order-1">
              <span className="inline-block px-4 py-1.5 bg-brand-purple/20 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-purple/30 w-fit">
                Curso Completo
              </span>
              
              <h1 className="text-4xl md:text-6xl xl:text-7xl font-black uppercase leading-[0.9] tracking-tighter">
                Crie Sites, SaaS e aplicações <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">com IA</span>
              </h1>

              <p className="text-slate-400 font-medium text-base md:text-lg max-w-md leading-relaxed">
                Do zero ao avançado: aprenda a criar projetos profissionais com inteligência artificial e publique na web.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {[
                  { icon: <BookOpen size={16} />, text: "Material didático prático" },
                  { icon: <FileText size={16} />, text: "Projetos completos do zero" },
                  { icon: <Rocket size={16} />, text: "Publique e monetize seus projetos" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-[10px] md:text-sm font-bold uppercase tracking-tight text-white/80">
                    <div className="w-8 h-8 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
                      {item.icon}
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setView('lesson')}
                className="mt-4 px-10 py-5 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-black uppercase text-sm tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-4 w-full md:w-fit shadow-[0_20px_40px_rgba(99,102,241,0.2)] group"
              >
                Continuar Estudando
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-4 mt-4 md:mt-8">
                 <div className="flex -space-x-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-deep overflow-hidden bg-slate-800">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="aluno" />
                     </div>
                   ))}
                 </div>
                 <div className="space-y-0.5">
                   <div className="flex text-yellow-400 gap-0.5">
                     {[1,2,3,4,5].map(i => <Sparkles key={i} size={12} fill="currentColor" />)}
                   </div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">+ 2.500 alunos</p>
                 </div>
              </div>
            </div>

            {/* Middle: Modules List */}
            <div className="lg:w-2/5 md:pt-12 order-3 lg:order-2">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Módulos do Curso</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8">Aprenda na prática com projetos reais</p>

              <div className="space-y-4">
                {moduleProgress.map((m, idx) => (
                  <div 
                    key={m.id} 
                    onClick={() => {
                      if (!m.locked) {
                        setCurrentStep(idx);
                        setView('lesson');
                      }
                    }}
                    className={`p-6 rounded-2xl glass-shadow transition-all group cursor-pointer ${m.locked ? 'opacity-50 grayscale pointer-events-none' : 'hover:bg-white/5 active:scale-[0.98]'}`}
                  >
                    <div className="flex gap-4 md:gap-6">
                      <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${idx === 0 ? 'from-indigo-600 to-indigo-900' : idx === 1 ? 'from-blue-600 to-blue-900' : idx === 2 ? 'from-purple-600 to-purple-900' : idx === 3 ? 'from-teal-600 to-teal-900' : 'from-orange-600 to-orange-900'}`}>
                        {m.locked ? <Lock size={22} /> : m.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Módulo {String(m.id + 1).padStart(2, '0')}</p>
                          <span className="text-xs font-mono font-bold">{m.progress}%</span>
                        </div>
                        <h4 className="text-base md:text-lg font-black uppercase tracking-tight">{m.title}</h4>
                        <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed font-medium line-clamp-2 md:line-clamp-none">{m.desc}</p>
                        
                        <div className="pt-4">
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${m.progress}%` }}
                              className="h-full bg-brand-purple shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Panels */}
            <div className="lg:w-1/5 md:pt-12 space-y-8 order-2 lg:order-3">
              {/* Your Progress */}
              <div className="p-6 rounded-3xl glass-shadow space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-black uppercase tracking-tight text-sm">Seu Progresso</h3>
                  <span className="text-brand-pink font-black text-base md:text-lg">{overallProgress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-pink"
                  />
                </div>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">
                  Continue evoluindo e finalize o curso para desbloquear seu certificado.
                </p>
              </div>

              {/* Extra Resources */}
              <div className="hidden lg:block p-6 space-y-6">
                <h3 className="font-black uppercase tracking-tight text-[10px] text-slate-500 tracking-widest">Recursos Extras</h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {[
                    { icon: <FileText size={18} />, title: "Templates" },
                    { icon: <CheckSquare size={18} />, title: "Checklists" },
                    { icon: <MessageSquareIcon size={18} />, title: "IA Prompts" },
                    { icon: <Users size={18} />, title: "Comunidade" }
                  ].map((item, idx) => (
                    <button key={idx} className="flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-xl transition-colors text-white/60 hover:text-white group">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:text-brand-purple transition-colors shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F12] font-sans text-white selection:bg-[#00FF88] selection:text-black flex flex-col overflow-x-hidden">
      {/* Header back to dashboard button */}
      <div className="p-4 bg-black/40 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 px-6 md:px-8">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors self-start"
        >
          <ChevronLeft size={16} /> Voltar ao Painel
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center font-black italic text-black shrink-0">DS</div>
          <span className="font-black uppercase tracking-tighter text-lg truncate">Company Study</span>
        </div>
      </div>

      {/* Header Lesson View */}
      <header className="p-6 md:p-12 border-b border-white/5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 md:gap-12 relative overflow-hidden bg-black/40">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-purple/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 w-full lg:w-auto text-left">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl xl:text-7xl font-black uppercase leading-[0.85] tracking-tighter text-white"
          >
            Do Zero ao <br />
            <span className="text-[#00FF88]">Site Online</span> em Minutos
          </motion.h1>
          <p className="mt-4 md:mt-6 text-xs md:text-xl font-bold text-slate-400 uppercase tracking-widest md:tracking-[0.2em]">
            Guia Didático: Github • App.new • Vercel • Deploy
          </p>
        </div>
        <div className="w-full lg:w-auto text-left lg:text-right flex flex-col items-start lg:items-end gap-3">
          <div className="bg-white text-black px-6 py-2 font-black text-sm shadow-[4px_4px_0px_#00FF88]">TUTORIAL COMPLETO</div>
          <div className="text-[#00FF88] font-mono text-[10px] tracking-widest font-black uppercase">REV: 2024.01_STABLE</div>
          
          <div className="flex flex-wrap gap-2 mt-4">
             {steps.map((s, idx) => {
               const isLocked = idx >= 4 && !module2Unlocked;
               return (
                 <button
                   key={s.id}
                   onClick={() => !isLocked && setCurrentStep(idx)}
                   className={`w-10 h-10 border-2 font-black text-xs transition-all flex items-center justify-center relative ${
                     currentStep === idx 
                     ? "bg-[#00FF88] border-[#00FF88] text-black scale-110 shadow-[0_0_15px_rgba(0,255,136,0.3)]" 
                     : isLocked 
                       ? "bg-black/40 border-white/5 text-white/10 cursor-not-allowed"
                       : "bg-transparent border-white/10 text-white/40 hover:border-white/30 cursor-pointer"
                   }`}
                 >
                   {isLocked ? <Lock size={12} /> : String(idx + 1).padStart(2, '0')}
                 </button>
               );
             })}
          </div>
        </div>
      </header>

      {/* Main Grid-like Content Area */}
      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden items-stretch">
        {/* Left Status Bar / Sidebar */}
        <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/10 p-6 md:p-10 flex flex-col items-start gap-4 md:gap-8 bg-black/20">
          <div className="flex lg:flex-col items-center lg:items-start gap-4">
            <span className="text-4xl md:text-8xl font-black text-white/5 block leading-none">
              {String(currentStep + 1).padStart(2, '0')}
            </span>
            <div className="space-y-1">
               <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[#00FF88]">{steps[currentStep].title}</h2>
               <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] md:text-sm leading-relaxed">
                {steps[currentStep].subtitle}
               </p>
            </div>
          </div>
          
          <div className="mt-auto w-full space-y-4 hidden lg:block">
            <div className="h-1 w-full bg-white/5 relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-[#00FF88]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
               <span>PROGRESS</span>
               <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
          </div>
        </aside>

        {/* Content Section */}
        <section className="lg:col-span-9 p-6 md:p-10 lg:p-20 relative bg-[#0F0F12] overflow-y-auto">
          <AnimatePresence mode="wait">
            {!isQuizMode ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl"
              >
                {/* Module badges */}
                <div className="flex gap-2 mb-8">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${currentStep <= 3 ? "bg-[#00FF88] text-black border-[#00FF88]" : "bg-white/5 text-white/40 border-white/10"}`}>
                    Módulo 01: Fundamentos
                  </span>
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${currentStep >= 4 ? "bg-[#00FF88] text-black border-[#00FF88]" : "bg-white/5 text-white/40 border-white/10"}`}>
                    {currentStep < 4 && !module2Unlocked && <Lock size={10} />}
                    Módulo 02: Business
                  </span>
                </div>
                {steps[currentStep].content}
              </motion.div>
            ) : (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl bg-white/5 border border-white/10 p-12 rounded-sm"
                >
                  {!showResult ? (
                    <div className="space-y-8">
                      <div className="flex justify-between items-end">
                        <h3 className="text-4xl font-black uppercase tracking-tighter text-[#00FF88]">Simulado Global</h3>
                        <span className="text-xl font-mono font-bold text-white/20">{quizProgress + 1}/{QUESTIONS.length}</span>
                      </div>
                      <p className="text-xl font-bold uppercase tracking-tight text-white leading-tight">
                        {QUESTIONS[quizProgress].question}
                      </p>
                      <div className="space-y-3">
                        {QUESTIONS[quizProgress].options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className="w-full text-left p-6 border-2 border-white/10 hover:border-[#00FF88] hover:bg-white/5 transition-all font-bold uppercase text-sm tracking-wide group flex justify-between items-center"
                          >
                            {opt}
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-8 py-10">
                      <div className="flex justify-center">
                        {score >= 7 ? (
                          <div className="w-24 h-24 bg-[#00FF88] rounded-full flex items-center justify-center text-black">
                            <Trophy size={48} />
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white">
                            <XCircle size={48} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-5xl font-black uppercase tracking-tighter">
                          {score >= 7 ? "Aprovado!" : "Tente Novamente"}
                        </h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest">Sua pontuação: <span className={score >= 7 ? "text-[#00FF88]" : "text-red-500"}>{score} de 10</span></p>
                      </div>
                      <p className="text-sm text-slate-500 font-medium uppercase px-10">
                        {score >= 7 
                          ? "Você desbloqueou o Módulo 02 e está pronto para aprender sobre Mini SaaS e Monetização." 
                          : "Você precisa de pelo menos 7 acertos para avançar. Revise o Módulo 1 e tente novamente."}
                      </p>
                      <div className="flex gap-4">
                        {score < 7 ? (
                           <button 
                             onClick={resetQuiz}
                             className="flex-1 bg-white text-black p-5 font-black uppercase tracking-widest text-xs hover:bg-slate-200"
                           >
                             Recomeçar Simulado
                           </button>
                        ) : (
                          <button 
                            onClick={finishQuiz}
                            className="flex-1 bg-[#00FF88] text-black p-5 font-black uppercase tracking-widest text-xs hover:bg-[#00E57A]"
                          >
                            Avançar para Módulo 2
                          </button>
                        )}
                        <button 
                          onClick={() => setIsQuizMode(false)}
                          className="px-8 border-2 border-white/10 text-white font-black uppercase text-xs hover:bg-white/5"
                        >
                          Revisar Aulas
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          {!isQuizMode && (
            <div className="mt-12 md:mt-20 flex flex-col sm:flex-row gap-4 md:gap-6">
              <button
                onClick={() => {
                  if (currentStep === 4 && module2Unlocked) {
                    setCurrentStep(3);
                  } else {
                    setCurrentStep(prev => Math.max(0, prev - 1));
                  }
                }}
                disabled={currentStep === 0}
                className={`group flex items-center justify-center p-4 md:p-6 border-2 transition-all ${
                  currentStep === 0 
                  ? "border-white/5 text-white/10 opacity-30 cursor-not-allowed" 
                  : "border-white/10 text-white hover:bg-white hover:text-black hover:border-white"
                }`}
              >
                <ChevronLeft size={32} />
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex-1 bg-white text-black p-4 md:p-6 font-black uppercase tracking-tighter text-xl md:text-2xl flex items-center justify-between hover:bg-[#00FF88] transition-colors group"
                >
                  Próximo Passo
                  <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
                </button>
              ) : currentStep === 3 ? (
                <button
                  onClick={startQuiz}
                  className="flex-1 bg-[#00FF88] text-black p-4 md:p-6 font-black uppercase tracking-tighter text-xl md:text-2xl flex items-center justify-between hover:bg-[#00E57A] transition-all group shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                >
                  {module2Unlocked ? "Módulo 2" : "Iniciar Prova"}
                  <BookOpen size={28} className="group-hover:scale-110 transition-transform" />
                </button>
              ) : currentStep === 4 && module2Unlocked ? (
                <button
                  onClick={() => setCurrentStep(5)}
                  className="flex-1 bg-white text-black p-4 md:p-6 font-black uppercase tracking-tighter text-xl md:text-2xl flex items-center justify-between hover:bg-[#00FF88] transition-colors group"
                >
                  Próximo Passo
                  <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
                </button>
              ) : currentStep === 5 && module2Unlocked ? (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex-1 bg-[#00FF88] text-black p-4 md:p-6 font-black uppercase tracking-tighter text-xl md:text-2xl flex items-center justify-between hover:bg-[#00E57A] transition-colors"
                >
                  CONCLUÍDO 🔥
                  <Rocket size={32} />
                </button>
              ) : (
                <div className="flex-1 bg-white/5 border-2 border-white/10 text-slate-500 p-4 md:p-6 font-black uppercase tracking-tighter text-xl md:text-2xl flex items-center justify-between cursor-not-allowed">
                  Módulo 2 Bloqueado
                  <Lock size={32} />
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer Monetization */}
      <footer className="bg-black text-white py-12 md:py-20 px-6 md:px-12 flex flex-col gap-12 md:gap-20 border-t border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1 text-center lg:text-left space-y-4">
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-brand-purple">Monetização & Carreira</h3>
            <p className="text-3xl md:text-5xl xl:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
              Crie Seu Portfólio <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">venda sites agora</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8 items-center bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
            <div className="text-center sm:text-left">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Dica Estrutural</h3>
              <p className="text-xs font-mono font-black text-slate-300">/index.html /css /js /assets</p>
            </div>
            <div className="flex items-center gap-3 bg-red-600/10 px-4 py-2 border border-red-600/20 rounded-full">
               <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-red-500 italic">Arquivos Descompactados</span>
            </div>
          </div>
        </div>

        {/* Credits Section */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-brand-purple rounded-2xl flex items-center justify-center font-black italic text-black text-2xl shadow-[0_10px_30px_rgba(99,102,241,0.3)]">DS</div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Desenvolvido por</p>
              <h4 className="text-2xl font-black uppercase tracking-tighter text-white">João Layon</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fullstack Developer & CEO ds Company</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-8">
            {[
              { label: "@layon.dev", url: "https://instagram.com/layon.dev" },
              { label: "@dscompany1_", url: "https://instagram.com/dscompany1_" },
              { label: "@davi._link", url: "https://instagram.com/davi._link" }
            ].map(social => (
              <a 
                key={social.label} 
                href={social.url} 
                target="_blank" 
                className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-brand-purple transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-all">
                  <Instagram size={14} />
                </div>
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center pb-8 lg:pb-0">
           <p className="text-[9px] font-bold uppercase text-slate-700 tracking-[0.5em]">&copy; {new Date().getFullYear()} DS COMPANY. TODOS OS DIREITOS RESERVADOS.</p>
        </div>
      </footer>
    </div>
  );
}
