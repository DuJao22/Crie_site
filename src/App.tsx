/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
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
  X,
  Zap,
  ShieldCheck
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import QuizView from './components/QuizView';

// --- Constants & Types ---

// --- Components ---

const SuccessBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wider">
    <CheckCircle2 size={12} /> Resultado
  </span>
);

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

function DashboardView({ user, courses, activeCourse, setActiveCourse, modules, activeModule, setView, setActiveModule, handleLogout, overallProgress, fetchModules, isRefreshing }: any) {
  if (!activeCourse && courses.length > 0) {
    return (
      <div className="min-h-screen bg-bg-deep font-sans flex flex-col overflow-hidden relative p-6 md:p-12">
        <div className="max-w-7xl mx-auto w-full space-y-12 py-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Seus <span className="text-brand-purple">Cursos</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Selecione uma jornada para começar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <div 
                key={course.id}
                onClick={() => setActiveCourse(course)}
                className="group relative rounded-[40px] bg-white/5 border border-white/10 overflow-hidden cursor-pointer hover:bg-white/[0.08] transition-all active:scale-[0.98]"
              >
                <div className="h-48 w-full relative">
                  <img src={course.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={course.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent" />
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tight">{course.title}</h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-2 text-brand-purple text-[10px] font-black uppercase tracking-widest pt-2">
                    Acessar Conteúdo <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-deep font-sans flex flex-col overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 flex gap-4 z-50">
        <button 
          onClick={() => setActiveCourse(null)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
        >
          <ChevronLeft size={14} /> Mudar Curso
        </button>
        {user?.is_admin === 1 && (
          <button 
            onClick={() => setView('admin')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
          >
            <ShieldCheck size={14} className="text-brand-purple" /> Admin
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="p-6 md:p-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 pt-8 md:pt-12">
          
          <div className="lg:w-2/5 flex flex-col justify-center gap-6 md:gap-8">
            <span className="inline-block px-4 py-1.5 bg-brand-purple/20 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-purple/30 w-fit">
              Landing Page Master
            </span>
            
            <h1 className="text-4xl md:text-6xl xl:text-7xl font-black uppercase leading-[0.9] tracking-tighter">
              {activeCourse?.title || 'Landing Pages com IA'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink text-2xl md:text-4xl block mt-2">
                {activeCourse?.id === 1 ? 'Engenharia de Prompt do Zero ao Profissional' : activeCourse?.description}
              </span>
            </h1>

            <p className="text-slate-400 font-medium text-base md:text-lg max-w-md leading-relaxed">
              Aprenda a criar landing pages profissionais usando Inteligência Artificial, prompts avançados e ferramentas modernas sem precisar programar.
            </p>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Seu Progresso de Maestria</span>
                  <span className="text-brand-purple">{Math.round(overallProgress)}%</span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    className="h-full bg-gradient-to-r from-brand-purple to-brand-pink"
                  />
               </div>
            </div>

            <button 
              onClick={() => {
                if (modules.length === 0) {
                   fetchModules();
                   return;
                }
                const m = activeModule || modules.find((m: any) => !m.passed && !m.locked) || modules[0];
                if (m) {
                  setActiveModule(m);
                  setView('lesson');
                }
              }}
              className="mt-4 px-10 py-5 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-black uppercase text-sm tracking-widest rounded-3xl hover:opacity-90 transition-all flex items-center justify-center gap-4 w-full md:w-fit shadow-[0_20px_40px_rgba(99,102,241,0.2)] group"
            >
              {modules.length === 0 ? (isRefreshing ? 'Iniciando...' : 'Carregar Curso') : 'Começar Estudos'}
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
                     setView('lesson');
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
    { title: "LP de Alta Conversão", desc: "Estrutura moderna para agências e infoprodutos.", icon: <Layout className="text-brand-purple" />, tag: "PREMIUM" },
    { title: "Página de Vendas IA", desc: "Focada em gatilhos mentais e psicologia visual.", icon: <Sparkles className="text-brand-pink" />, tag: "CONVERSÃO" },
    { title: "Captura de Leads", desc: "Design minimalista e direto para coletar contatos.", icon: <Users className="text-yellow-400" />, tag: "LEADS" },
    { title: "Dashboard Freelancer", desc: "Aprenda a gerir seus primeiros clientes de IA.", icon: <Rocket className="text-brand-green" />, tag: "NEGÓCIO" }
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

function HistoryView({ modules, overallProgress }: { modules: any[]; overallProgress: number }) {
  const passedCount = modules.filter(m => m.passed).length;
  const totalCount = modules.length;

  return (
    <div className="min-h-screen bg-bg-deep text-white p-6 md:p-12 font-sans relative overflow-hidden pb-24 no-scrollbar overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">Evolução</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Acompanhe sua maestria em Landing Pages com IA.</p>
          </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Módulos Concluídos", value: `${passedCount}/${totalCount}`, icon: <CheckCircle2 className="text-brand-green" /> },
              { label: "Progresso Geral", value: `${Math.round(overallProgress)}%`, icon: <Trophy className="text-yellow-400" /> },
              { label: "Status Digital", value: passedCount >= totalCount / 2 ? "PRO" : "STARTED", icon: <Rocket className="text-brand-purple" /> }
            ].map((stat, idx) => (
              <div key={idx} className="p-8 rounded-[40px] bg-white/5 border border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">{stat.icon}</div>
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none">{stat.label}</p>
                <p className="text-3xl font-black uppercase tracking-tight">{stat.value}</p>
              </div>
            ))}
         </div>

         <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tight">Timeline de Conquistas</h3>
            <div className="space-y-4">
               {modules.map((m, idx) => (
                 <div key={m.id} className={`p-6 rounded-3xl border transition-all flex items-center gap-6 ${m.passed ? 'bg-brand-green/5 border-brand-green/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${m.passed ? 'bg-brand-green text-black' : 'bg-white/10 text-slate-500'}`}>
                       {idx + 1}
                    </div>
                    <div className="flex-1">
                       <h4 className="font-black uppercase text-sm tracking-tight">{m.title}</h4>
                       <p className="text-xs text-slate-500">{m.passed ? 'Certificado garantido' : 'Pendente de conclusão'}</p>
                    </div>
                    {m.passed && <CheckCircle2 size={20} className="text-brand-green" />}
                 </div>
               ))}
            </div>
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
  const [answers, setAnswers] = useState<number[]>([]);
  const [module2Unlocked, setModule2Unlocked] = useState(false);
  const [user, setUser] = useState<{ email: string, is_paid: number, is_admin: number } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [selectedProject, setSelectedProject] = useState<null | { title: string, desc: string, stack: string[], features: string[], logic: string }>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<any>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Progress check
    if (user && view !== 'landing') {
      fetchProgress();
      fetchCourses();
      fetchModules(activeCourse?.id);
    }
  }, [user, view, activeCourse?.id]);

  // Periodically refresh modules if they are empty (useful if DB was initializing)
  useEffect(() => {
    if (user && view !== 'landing' && modules.length === 0 && !isRefreshing) {
      const timer = setInterval(() => {
        fetchModules(activeCourse?.id);
        fetchCourses();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [user, view, modules.length, isRefreshing, activeCourse?.id]);

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
            fetchCourses();
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

  // Auto-set active module when modules are loaded
  useEffect(() => {
    if (modules.length > 0 && !activeModule) {
      const nextModule = modules.find((m: any) => !m.passed && !m.locked) || modules[0];
      if (nextModule) {
        setActiveModule(nextModule);
      }
    }
  }, [modules, activeModule]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const overallProgress = useMemo(() => {
    if (!modules || modules.length === 0) return 0;
    const passedCount = modules.filter(m => m.passed).length;
    return Math.round((passedCount / modules.length) * 100);
  }, [modules]);


  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses", { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (e) {
      console.error("Failed to fetch courses");
    }
  };

  const fetchModules = async (courseId?: number) => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const url = courseId ? `/api/modules?courseId=${courseId}` : "/api/modules";
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (e) {
      console.error("Failed to fetch modules", e);
    } finally {
      setIsRefreshing(false);
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
              answers: answers
            })
          });
        } catch (e) {
          console.error("Failed to save progress", e);
        }
      }, 3000); // Save every 3 seconds of change
      return () => clearTimeout(timer);
    }
  }, [currentStep, answers, user, view]);

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
        fetchCourses();
        fetchModules(activeCourse?.id);
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
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-[#09090b] h-full shadow-2xl p-8 flex flex-col gap-8 border-l border-white/5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <img src="https://i.postimg.cc/kgmY092W/image-removebg-preview-(20).png" alt="Logo" className="w-8 h-8 object-contain" />
                   <span className="font-black uppercase tracking-tighter text-xl">LP Master</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-slate-500">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Home },
                  { id: 'projects', label: 'Projetos', icon: Layers },
                  { id: 'history', label: 'Jornada', icon: Clock },
                  { id: 'admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
                ].map(item => {
                  if (item.adminOnly && !user?.is_admin) return null;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setView(item.id as any);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${
                        view === item.id ? 'bg-brand-purple text-white' : 'text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-black uppercase text-xs tracking-widest">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                 <div className="flex items-center gap-4 px-4 py-2">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple font-black">
                       {user?.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Logado como</p>
                      <p className="font-bold text-xs truncate max-w-[200px]">{user?.email}</p>
                    </div>
                 </div>
                 <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black uppercase text-xs tracking-widest"
                 >
                   <Rocket className="rotate-180" size={20} />
                   Sair da Conta
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
               modules={modules}
               overallProgress={overallProgress}
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
              courses={courses}
              activeCourse={activeCourse}
              setActiveCourse={setActiveCourse}
              modules={modules}
              activeModule={activeModule}
              setView={setView}
              setActiveModule={setActiveModule}
              handleLogout={handleLogout}
              overallProgress={overallProgress}
              fetchModules={fetchModules}
              isRefreshing={isRefreshing}
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
                   <img src="https://i.postimg.cc/kgmY092W/image-removebg-preview-(20).png" alt="Logo" className="w-8 h-8 object-contain" />
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
                       <p className="text-[10px] font-black text-brand-purple uppercase tracking-[0.4em]">Landing Page Master</p>
                       <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{activeModule.title}</h2>
                    </div>
                    
                    <div className="p-8 md:p-12 bg-white/5 border border-white/10 rounded-[48px] text-base md:text-lg leading-relaxed text-slate-300 backdrop-blur-md">
                       <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-h1:font-black prose-h2:font-black prose-h3:font-bold prose-strong:text-brand-purple prose-li:text-slate-400">
                         <ReactMarkdown>{activeModule.content || activeModule.description || "Iniciando estudos deste módulo..."}</ReactMarkdown>
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-12 border-t border-white/5">
                       <div className="flex-1 p-8 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Status do Módulo</p>
                            <div className={`flex items-center gap-2 font-black uppercase ${activeModule.passed ? 'text-brand-green' : 'text-yellow-500'}`}>
                              {activeModule.passed ? <CheckCircle2 size={16} /> : <Zap size={16} />}
                              {activeModule.passed ? 'Certificado Obtido' : 'Avaliação Pendente'}
                            </div>
                          </div>
                          {!activeModule.passed && (
                            <button 
                              onClick={() => setView('quiz')}
                              className="px-6 py-4 bg-brand-purple text-white font-black uppercase text-[10px] rounded-2xl hover:opacity-90 transition-all"
                            >
                              Fazer Questionário
                            </button>
                          )}
                       </div>
                       <button 
                         onClick={() => setView('dashboard')}
                         className="px-12 py-8 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm rounded-[32px] hover:bg-white hover:text-black transition-all"
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
