/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
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
  DollarSign
} from 'lucide-react';

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

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);

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
              <MessageSquare size={24} className="text-[#00FF88]" /> Prompt Recomendado
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
      title: "Upload",
      subtitle: "Subir os arquivos para o GitHub.",
      icon: <UploadCloud className="w-6 h-6" />,
      color: "bg-white text-black",
      content: (
        <div className="space-y-8">
          <div className="space-y-6 bg-white/5 border border-white/10 rounded-sm p-6">
            <h4 className="font-black text-white uppercase tracking-tighter text-xl">1. Criar Repositório</h4>
            <ol className="space-y-3 text-slate-400 text-sm font-bold uppercase tracking-wide">
              <li className="flex gap-4 items-start"><span className="text-[#00FF88]">•</span> Clique em <strong className="text-white">New repository</strong></li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88]">•</span> Nome: <code className="bg-white/10 px-2 py-0.5 rounded-sm text-[#00FF88] font-mono">meu-site</code></li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88]">•</span> Visibilidade: <strong className="text-white underline decoration-[#00FF88]">Public</strong></li>
              <li className="flex gap-4 items-start"><span className="text-[#00FF88]">•</span> Clique em <strong className="bg-[#00FF88] text-black px-2 py-0.5 rounded-sm">Create</strong></li>
            </ol>
          </div>

          <div className="space-y-6 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-sm p-6">
            <h4 className="font-black text-[#00FF88] uppercase tracking-tighter text-xl">2. Upload Fácil</h4>
            <p className="text-xs text-[#00FF88]/70 font-bold uppercase tracking-widest">Procedimento sem terminal:</p>
            <ol className="space-y-3 text-slate-300 text-sm font-bold uppercase tracking-wide">
              <li className="flex gap-4 items-start"><span className="text-white">A.</span> Clique em <strong className="text-white">Add file</strong> → <strong className="text-white">Upload files</strong></li>
              <li className="flex gap-4 items-start"><span className="text-white">B.</span> Arraste seus arquivos para o navegador</li>
              <li className="flex gap-4 items-start"><span className="text-white">C.</span> Clique em <strong className="text-white">Commit changes</strong></li>
            </ol>
          </div>

          <div className="flex flex-col items-start gap-2">
            <div className="bg-white text-black px-4 py-1 font-black text-xs inline-block">STATUS: SYNCED</div>
            <p className="text-xs text-slate-500 font-bold uppercase italic tracking-widest">Seu site agora está seguro na nuvem.</p>
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
               <li className="flex gap-2"><span className="text-red-500">❌</span> Esquecer o <strong className="text-white">index.html</strong></li>
               <li className="flex gap-2"><span className="text-red-500">❌</span> Subir pasta (.zip) inteira</li>
               <li className="flex gap-2"><span className="text-red-500">❌</span> Espaços nos nomes de arquivos</li>
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

  return (
    <div className="min-h-screen bg-[#0F0F12] font-sans text-white selection:bg-[#00FF88] selection:text-black flex flex-col">
      {/* Heavy Header Section */}
      <header className="p-8 border-b border-white/10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter text-white"
          >
            Do Zero ao <br />
            <span className="text-[#00FF88]">Site Online</span> em Minutos
          </motion.h1>
          <p className="mt-6 text-base md:text-xl font-bold text-slate-400 uppercase tracking-[0.2em]">
            Guia Didático: Github • App.new • Vercel • Deploy
          </p>
        </div>
        <div className="w-full lg:w-auto text-right flex flex-col items-end gap-3">
          <div className="bg-white text-black px-6 py-2 font-black text-sm shadow-[4px_4px_0px_#00FF88]">TUTORIAL COMPLETO</div>
          <div className="text-[#00FF88] font-mono text-[10px] tracking-widest font-black uppercase">REV: 2024.01_STABLE</div>
          
          <div className="flex gap-2 mt-4">
             {steps.map((s, idx) => (
               <button
                 key={s.id}
                 onClick={() => setCurrentStep(idx)}
                 className={`w-10 h-10 border-2 font-black text-xs transition-all flex items-center justify-center ${
                   currentStep === idx 
                   ? "bg-[#00FF88] border-[#00FF88] text-black scale-110 shadow-[0_0_15px_rgba(0,255,136,0.3)]" 
                   : "bg-transparent border-white/10 text-white/40 hover:border-white/30"
                 }`}
               >
                 {String(idx + 1).padStart(2, '0')}
               </button>
             ))}
          </div>
        </div>
      </header>

      {/* Main Grid-like Content Area */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden items-stretch">
        {/* Left Status Bar / Sidebar */}
        <aside className="lg:col-span-3 border-r border-white/10 p-10 flex flex-col items-start gap-8 bg-black/20">
          <div className="space-y-2">
            <span className="text-8xl font-black text-white/5 block leading-none">
              {String(currentStep + 1).padStart(2, '0')}
            </span>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-[#00FF88]">{steps[currentStep].title}</h2>
          </div>
          
          <p className="text-slate-400 font-bold uppercase tracking-wider text-sm leading-relaxed">
            {steps[currentStep].subtitle}
          </p>

          <div className="mt-auto w-full space-y-4">
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
        <section className="lg:col-span-9 p-8 lg:p-20 relative bg-[#0F0F12]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl"
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          {/* Nav Controls */}
          <div className="mt-20 flex gap-6">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`group flex items-center justify-center p-6 border-2 transition-all ${
                currentStep === 0 
                ? "border-white/5 text-white/10 opacity-30 cursor-not-allowed" 
                : "border-white/10 text-white hover:bg-white hover:text-black hover:border-white"
              }`}
            >
              <ChevronLeft size={32} />
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                className="flex-1 bg-white text-black p-6 font-black uppercase tracking-tighter text-2xl flex items-center justify-between hover:bg-[#00FF88] transition-colors group"
              >
                Próximo Passo
                <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </button>
            ) : (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex-1 bg-[#00FF88] text-black p-6 font-black uppercase tracking-tighter text-2xl flex items-center justify-between hover:bg-[#00E57A] transition-colors"
              >
                CONCLUÍDO 🔥
                <Rocket size={32} />
              </button>
            )}
          </div>
        </section>
      </main>

      {/* Footer Monetization */}
      <footer className="bg-white text-black py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/10">
        <div className="flex-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Monetização & Carreira</h3>
          <p className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-none">
            Crie portfólios, landing pages e venda sites profissionais.
          </p>
        </div>
        
        <div className="flex gap-12 items-center">
          <div className="hidden sm:block">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Estrutura Ideal</h3>
            <p className="text-xs font-mono font-black">/index.html /style.css /script.js /images</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
             <span className="text-[10px] font-black uppercase tracking-widest italic">CUIDADO COM PASTAS</span>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-black text-slate-500 uppercase">Built for Growth</div>
            <div className="flex gap-4 mt-2">
              <Github size={18} className="text-slate-300 hover:text-black cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-component for icons that might be missing from initial import
function MessageSquare({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
