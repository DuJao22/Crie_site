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
import AdminPanel from './components/AdminPanel';
import QuizView from './components/QuizView';

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

// --- Navigation Config ---

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'history', label: 'Jornada', icon: Clock },
  { id: 'projects', label: 'Projetos', icon: Layers },
  { id: 'lesson', label: 'Estudo', icon: Play },
  { id: 'view-more', label: 'Mais', icon: Menu },
];

const MobileNav = ({ activeView, setView, onOpenSidebar }: { activeView: string; setView: (v: any) => void; onOpenSidebar: () => void }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 h-20 bg-[#09090b]/80 backdrop-blur-2xl border-t border-white/5 safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-between items-center h-full">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'view-more') {
                  onOpenSidebar();
                } else {
                  setView(item.id);
                }
              }}
              className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${
                isActive ? 'text-brand-purple' : 'text-slate-500'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-brand-purple/10' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- View Components ---

function ViewContainer({ children, viewKey }: { children: ReactNode; viewKey: string }) {
  return (
    <motion.div
      key={viewKey}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}

function DashboardView({ user, modules, setView, setActiveModule, handleLogout, overallProgress }: any) {
  return (
    <div className="min-h-screen bg-bg-deep font-sans flex flex-col overflow-hidden relative">
      {/* Header with Admin shortcut if applicable */}
      {user?.is_admin === 1 && (
        <div className="p-4 flex justify-end max-w-7xl mx-auto w-full">
          <button 
            onClick={() => setView('admin')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
          >
            <ShieldCheck size={14} className="text-brand-purple" /> Painel Admin
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="p-6 md:p-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 pt-8 md:pt-12">
          
          <div className="lg:w-2/5 flex flex-col justify-center gap-6 md:gap-8">
            <span className="inline-block px-4 py-1.5 bg-brand-purple/20 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-purple/30 w-fit">
              Ecossistema DS
            </span>
            
            <h1 className="text-4xl md:text-6xl xl:text-7xl font-black uppercase leading-[0.9] tracking-tighter">
              A Nova Era <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">da Criação</span>
            </h1>

            <p className="text-slate-400 font-medium text-base md:text-lg max-w-md leading-relaxed">
              Continue sua formação DS e domine as ferramentas que estão moldando o futuro.
            </p>

            <button 
              onClick={() => {
                const lastUnlocked = [...modules].reverse().find(m => !m.locked);
                if (lastUnlocked) {
                  setActiveModule(lastUnlocked);
                  if (lastUnlocked.passed) {
                    setView('lesson');
                  } else {
                    setView('quiz');
                  }
                }
              }}
              className="mt-4 px-10 py-5 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-black uppercase text-sm tracking-widest rounded-3xl hover:opacity-90 transition-all flex items-center justify-center gap-4 w-full md:w-fit shadow-[0_20px_40px_rgba(99,102,241,0.2)] group"
            >
              Continuar Estudo
              <Rocket size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="lg:w-3/5 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {modules.map((m: any, idx: number) => (
                 <div 
                   key={m.id} 
                   onClick={() => {
                     if (m.locked) return;
                     setActiveModule(m);
                     if (m.passed) {
                       setView('lesson');
                     } else {
                       setView('quiz');
                     }
                   }}
                   className={`rounded-[40px] bg-white/5 border border-white/10 transition-all group flex flex-col relative overflow-hidden ${m.locked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/[0.08] active:scale-[0.98] cursor-pointer'}`}
                 >
                    {/* Module Image/Icon Overlay */}
                    <div className="h-32 w-full relative overflow-hidden">
                      {m.image_url ? (
                        <img 
                          src={m.image_url} 
                          className={`w-full h-full object-cover transition-transform duration-500 ${m.locked ? 'grayscale blur-sm' : 'group-hover:scale-110'}`} 
                          alt={m.title} 
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                           <Layout size={32} className="text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent" />
                      
                      {m.passed && (
                        <div className="absolute top-4 right-4 bg-brand-green/20 backdrop-blur-md p-2 rounded-xl">
                          <CheckCircle2 size={14} className="text-brand-green" />
                        </div>
                      )}
                      
                      {!m.locked && m.is_free === 1 && (
                        <div className="absolute top-4 left-4 bg-brand-purple/20 backdrop-blur-md px-3 py-1 rounded-full border border-brand-purple/30">
                          <span className="text-[8px] font-black uppercase text-brand-purple tracking-widest">Grátis</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 pt-2 relative">
                      <div className="flex justify-between items-start mb-4">
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center -mt-8 relative z-10 ${m.locked ? 'bg-white/10' : 'bg-brand-purple border border-white/10 text-white'}`}>
                            {m.locked ? <Lock size={18} /> : (m.is_free ? <Sparkles size={18} /> : <Rocket size={18} />)}
                         </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest mb-1">Módulo {idx + 1}</p>
                        <h4 className="text-lg font-black uppercase tracking-tight line-clamp-1">{m.title}</h4>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ProjectsView({ onBack, onSelectLesson }: { onBack: () => void; onSelectLesson: () => void }) {
  const projects = [
    { title: "Landing Page Pro", desc: "Estrutura otimizada para alta conversão.", icon: <Layout className="text-brand-purple" />, tag: "INICIANTE" },
    { title: "Gerador de Bio", desc: "Mini SaaS para links personalizados.", icon: <Instagram className="text-brand-pink" />, tag: "SAAS" },
    { title: "Dashboard Vendas", desc: "Controle financeiro simples.", icon: <DollarSign className="text-yellow-400" />, tag: "PRO" },
    { title: "Portfólio 3D", desc: "Mostre seus trabalhos com tecnologia.", icon: <Rocket className="text-brand-green" />, tag: "AVANÇADO" }
  ];

  return (
    <div className="min-h-screen bg-bg-deep text-white p-6 md:p-12 font-sans relative overflow-hidden pb-24 no-scrollbar overflow-y-auto">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-purple/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <div className="space-y-4">
           <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
             Biblioteca de <span className="text-brand-purple">Projetos</span>
           </h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Ideias para você começar a faturar hoje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p, idx) => (
            <div key={idx} className="p-8 rounded-[40px] bg-white/5 border border-white/10 flex flex-col gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">{p.icon}</div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.tag}</span>
                <h3 className="text-2xl font-black uppercase tracking-tight">{p.title}</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">{p.desc}</p>
              </div>
              <button 
                onClick={onSelectLesson}
                className="mt-auto py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all"
              >
                 Ver Tutorial
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryView({ module2Unlocked, score, answers, currentStep, stepsLength }: any) {
  return (
    <div className="min-h-screen bg-bg-deep text-white p-6 md:p-12 font-sans relative overflow-hidden pb-24 no-scrollbar overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
         <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
           Sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">Jornada</span>
         </h1>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Módulos", value: module2Unlocked ? "02/05" : "01/05", icon: <CheckCircle2 className="text-brand-green" /> },
              { label: "Simulado", value: answers.length > 0 ? `${score}/10` : "PENDENTE", icon: <Trophy className="text-yellow-400" /> },
              { label: "Passo Atual", value: `0${currentStep + 1}`, icon: <Clock className="text-brand-purple" /> }
            ].map((stat, idx) => (
              <div key={idx} className="p-8 rounded-[40px] bg-white/5 border border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">{stat.icon}</div>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none">{stat.label}</p>
                <p className="text-3xl font-black uppercase tracking-tight">{stat.value}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

export default function App() {
  // --- State ---
  const [view, setView] = useState<'landing' | 'login' | 'dashboard' | 'lesson' | 'admin' | 'projects' | 'history' | 'quiz'>('landing');
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
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
  const [selectedProject, setSelectedProject] = useState<null | { title: string, desc: string, stack: string[], features: string[], logic: string }>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [activeModule, setActiveModule] = useState<any>(null);

  useEffect(() => {
    // Progress check
    if (user && view !== 'landing') {
      fetchProgress();
      fetchModules();
    }
  }, [user !== null]);

  // Check auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            setUser(data.user);
            setView('dashboard');
            fetchProgress();
          }
        } else {
          setUser(null);
          setView('landing');
        }
      } catch (e) {
        console.error('Auth check failed', e);
        setUser(null);
        setView('landing');
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

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
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-[#00FF88] hover:text-black transition-all rounded-sm"
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Vercel",
      subtitle: "Hospedagem profissional gratuita.",
      icon: <Rocket className="w-6 h-6" />,
      color: "bg-black text-white",
      content: (
        <div className="space-y-8">
          <div className="bg-white/5 p-6 border border-white/10 rounded-sm">
            <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-2 mb-3 text-sm">
              <UploadCloud size={18} /> O que é a Vercel?
            </h4>
            <p className="text-slate-400 text-base leading-relaxed font-medium">
              A melhor plataforma para colocar seus sites no ar gratuitamente. Ela conecta com seu GitHub e atualiza o site automaticamente sempre que você muda o código.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
              <h5 className="font-black text-white uppercase text-xs mb-2 tracking-widest">FUNCIONALIDADE</h5>
              <p className="text-xs text-slate-400 font-medium">Deploy instantâneo, certificados SSL grátis e URL personalizada.</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
              <h5 className="font-black text-white uppercase text-xs mb-2 tracking-widest">INTEGRAÇÃO</h5>
              <p className="text-xs text-slate-400 font-medium">Conecta em 1 clique com repositórios do GitHub.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Mão na Massa",
      subtitle: "Criando seu primeiro SaaS.",
      icon: <Code className="w-6 h-6" />,
      color: "bg-brand-purple text-white",
      content: (
        <div className="space-y-8">
           <div className="bg-brand-purple/10 p-8 border border-brand-purple/20 rounded-sm">
              <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Seu Desafio</h4>
              <p className="text-slate-300 font-medium leading-relaxed">
                Você vai usar a IA para criar um gerador de links (estilo Linktree). É o primeiro passo para entender como um SaaS funciona por trás das câmeras.
              </p>
           </div>
           
           <div className="p-8 bg-black/40 border border-white/5 rounded-sm space-y-4">
             <div className="flex items-center gap-2 text-brand-purple">
               <AlertCircle size={20} />
               <span className="font-black uppercase text-xs tracking-widest">Checklist de Execução</span>
             </div>
             <ul className="space-y-3">
               {[
                 "Descreva seu projeto para a IA",
                 "Baixe o código gerado",
                 "Crie um repositório no GitHub",
                 "Suba os arquivos para o GitHub",
                 "Conecte o repositório na Vercel"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-slate-400 text-sm font-bold uppercase tracking-tight">
                   <div className="w-5 h-5 rounded-full border-2 border-white/10 flex items-center justify-center text-[10px]">{i+1}</div>
                   {item}
                 </li>
               ))}
             </ul>
           </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Desafio Final",
      subtitle: "Teste seus conhecimentos.",
      icon: <Trophy className="w-6 h-6" />,
      color: "bg-yellow-400 text-black",
      content: (
        <div className="space-y-8 text-center py-12">
           <div className="w-24 h-24 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-400/50">
             <Trophy size={48} className="text-yellow-400" />
           </div>
           <h3 className="text-4xl font-black uppercase tracking-tighter">Simulado Global</h3>
           <p className="text-slate-400 max-w-md mx-auto font-medium">
             Responda 10 perguntas cruciais para validar seu conhecimento e desbloquear o próximo nível da formação.
           </p>
           <button 
             onClick={startQuiz}
             className="mt-8 px-12 py-5 bg-yellow-400 text-black font-black uppercase tracking-widest rounded-sm hover:scale-105 transition-transform shadow-2xl shadow-yellow-400/20"
           >
             Começar Agora
           </button>
        </div>
      )
    }
  ];

  // Simulation of module progress
  const moduleProgress = useMemo(() => [
    { id: 0, title: "Fundamentos", desc: "Entenda os conceitos e ferramentas essenciais para começar.", progress: 100, icon: <BookOpen className="w-5 h-5" /> },
    { id: 1, title: "Criação de Sites com IA", desc: "Crie sites profissionais utilizando inteligência artificial.", progress: 75, icon: <Sparkles className="w-5 h-5" /> },
    { id: 2, title: "Desenvolvendo um Mini SaaS", desc: "Crie aplicações completas e funcionais passo a passo.", progress: 50, icon: <Layers className="w-5 h-5" /> },
    { id: 3, title: "Deploy e Publicação", desc: "Publique seus projetos e deixe-os disponíveis para o mundo.", progress: 25, icon: <Rocket className="w-5 h-5" /> },
    { id: 4, title: "Monetização", desc: "Estratégias para vender seus projetos e escalar seu negócio.", progress: 0, icon: <DollarSign className="w-5 h-5" />, locked: !module2Unlocked },
  ], [module2Unlocked]);

  const score = useMemo(() => {
    return answers.reduce((acc, ans, idx) => {
      return ans === QUESTIONS[idx].correct ? acc + 1 : acc;
    }, 0);
  }, [answers]);

  const overallProgress = Math.round(((currentStep + 1) / (steps?.length || 1)) * 100);

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/modules', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (e) {
      console.error("Failed to fetch modules", e);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress', { credentials: 'include' });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setCurrentStep(data.current_step || 0);
          setAnswers(data.answers || []);
          if ((data.score || 0) >= 7) {
            setModule2Unlocked(true);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch progress", e);
    }
  };

  // Save progress when it changes
  useEffect(() => {
    if (user && user.is_paid === 1 && view !== 'landing') {
      const timer = setTimeout(async () => {
        try {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              current_step: currentStep,
              score: score,
              answers: answers
            })
          });
        } catch (e) {
          console.error("Failed to save progress", e);
        }
      }, 3000); // Save every 3 seconds of change
      return () => clearTimeout(timer);
    }
  }, [currentStep, score, answers, user, view]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
      setView('landing');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const handleLoginSuccess = async () => {
    // Re-verify session after login
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setUser(data.user);
        setView('dashboard');
        fetchProgress();
      }
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- Render Shortcuts ---

  if (view === 'landing') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="view-container">
          <LandingPage 
            onStart={() => {
              if (!user) {
                setLoginMode('register');
                setView('login');
              } else {
                setView('dashboard');
              }
            }} 
            onLogin={() => {
              if (!user) {
                setLoginMode('login');
                setView('login');
              } else {
                setView('dashboard');
              }
            }} 
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (view === 'login') {
    if (user) {
      setView('dashboard');
      return null;
    }
    return (
      <AnimatePresence mode="wait">
        <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="view-container">
          <LoginPage 
            onBack={() => setView('landing')} 
            onLogin={handleLoginSuccess}
            initialMode={loginMode}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // --- Auth Guard ---
  if (!user) {
    setView('login');
    return null;
  }

  return (
    <div className="view-container safe-area-bottom flex flex-col h-screen">
      <AnimatePresence mode="wait">
        <ViewContainer viewKey={view}>
          {view === 'admin' && user?.is_admin && (
            <AdminPanel onBack={() => setView('dashboard')} />
          )}

          {view === 'projects' && (
            <ProjectsView 
              onBack={() => setView('dashboard')} 
              onSelectLesson={() => setView('lesson')} 
            />
          )}

          {view === 'history' && (
             <HistoryView 
               module2Unlocked={module2Unlocked}
               score={score}
               answers={answers}
               currentStep={currentStep}
               stepsLength={steps.length}
             />
          )}

          {view === 'quiz' && activeModule && (
            <QuizView 
              moduleId={activeModule.id}
              moduleTitle={activeModule.title}
              onClose={() => setView('dashboard')}
              onSuccess={() => {
                fetchModules();
                setView('lesson');
              }}
            />
          )}

          {view === 'dashboard' && (
            <DashboardView 
              user={user}
              modules={modules}
              setView={setView}
              setActiveModule={setActiveModule}
              handleLogout={handleLogout}
              overallProgress={overallProgress}
              fetchModules={fetchModules}
            />
          )}

          {view === 'lesson' && activeModule && (
            <div className="flex-1 flex flex-col h-screen bg-bg-deep overflow-hidden">
               <nav className="p-6 border-b border-white/5 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-xl z-20">
                 <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">
                   <ChevronLeft size={16} /> Painel
                 </button>
                 <div className="flex items-center gap-4">
                   <div className="hidden sm:block text-right">
                     <p className="text-[10px] font-black uppercase text-brand-purple tracking-widest">{activeModule.title}</p>
                   </div>
                   <div className="w-6 h-6 bg-brand-purple rounded flex items-center justify-center font-black italic text-black text-xs">DS</div>
                 </div>
               </nav>
               
               <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
                  <div className="max-w-4xl mx-auto space-y-12 pb-12">
                    {/* Header Image */}
                    {activeModule.image_url && (
                      <div className="w-full aspect-video rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
                        <img src={activeModule.image_url} alt={activeModule.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-brand-purple uppercase tracking-[0.4em]">DS Company Academy</p>
                       <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{activeModule.title}</h2>
                    </div>
                    
                    <div className="p-8 md:p-12 bg-white/5 border border-white/10 rounded-[48px] text-base md:text-lg leading-relaxed text-slate-300 backdrop-blur-md">
                       <div className="whitespace-pre-wrap font-medium">
                        {activeModule.content || activeModule.description || "Iniciando estudos deste módulo..."}
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-12 border-t border-white/5">
                       <div className="flex-1 p-8 rounded-[32px] bg-white/5 border border-white/5">
                          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Status do Módulo</p>
                          <div className="flex items-center gap-2 text-brand-green font-black uppercase">
                            <CheckCircle2 size={16} /> Conteúdo Concluído
                          </div>
                       </div>
                       <button 
                         onClick={() => setView('dashboard')}
                         className="px-12 py-8 bg-white text-black font-black uppercase tracking-widest text-sm rounded-[32px] hover:bg-brand-purple hover:text-white transition-all shadow-xl"
                       >
                         Voltar ao Painel
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </ViewContainer>
      </AnimatePresence>

      <MobileNav activeView={view} setView={setView} onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
}
