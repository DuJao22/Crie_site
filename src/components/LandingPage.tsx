import { motion } from 'motion/react';
import { ChevronRight, BookOpen, FileText, Rocket, Sparkles, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-brand-purple selection:text-white overflow-x-hidden">
      {/* Navbar mimic */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center font-black italic text-black">DS</div>
          <span className="font-black uppercase tracking-tighter text-xl">Company</span>
        </div>
        <div className="flex gap-4">
          <button onClick={onLogin} className="px-6 py-2 text-xs font-black uppercase text-slate-400 hover:text-white transition-colors">Login</button>
          <button onClick={onStart} className="px-6 py-2 bg-white text-black text-xs font-black uppercase rounded-lg hover:bg-brand-purple transition-colors">Assinar Agora</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto relative">
        {/* Abstract backgrounds */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-purple/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-brand-pink/10 rounded-full blur-[120px] -z-10" />

        <div className="flex flex-col items-center text-center gap-8">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 bg-brand-purple/20 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-purple/30"
          >
            Treinamento de Elite
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter max-w-5xl"
          >
            Crie Sites, Apps e SaaS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">Mesmo Sem Programar</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            Aprenda a transformar ideias em projetos reais usando inteligência artificial — e coloque tudo no ar em minutos. Sem complicação. Sem enrolação. Resultado prático.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto"
          >
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-black uppercase text-sm tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(99,102,241,0.2)] group"
            >
              Quero Começar Agora 🚀
            </button>
                <a 
                  href="https://bio.site/Joao_Layon_DS_Company" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black uppercase text-sm tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  Ver Projetos Reais
                </a>
          </motion.div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-4 mt-12">
            <div className="flex -space-x-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#09090b] overflow-hidden bg-slate-800">
                  <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="aluno" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400 gap-0.5">
                {[1,2,3,4,5].map(i => <Sparkles key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">+ 5.000 alunos faturando</p>
            </div>
          </div>
        </div>
      </section>

      {/* Connection & Benefits Section */}
      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
              A verdade é simples: <br />
              <span className="text-brand-purple">Quem aprender agora, domina o mercado.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Se você sente que está ficando para trás enquanto outras pessoas estão criando sites, aplicativos e até negócios com IA… Esse treinamento foi feito exatamente para você.
            </p>
            <div className="space-y-4">
              {[
                "Crie sites profissionais com IA",
                "Desenvolva mini SaaS do zero",
                "Publique seus projetos online",
                "Aprenda o método mais rápido e prático",
                "Sem precisar saber código avançado"
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-black uppercase text-white/90">
                  <div className="w-6 h-6 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
                    <CheckCircle2 size={14} />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 rounded-3xl border border-white/10 p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl mb-4" />
                <div className="w-full h-4 bg-white/10 rounded-full" />
                <div className="w-3/4 h-4 bg-white/10 rounded-full" />
              </div>
              <div className="relative z-10 space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status do Projeto</p>
                    <p className="text-sm font-black text-[#00FF88] uppercase">Online & Monetizando 🚀</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-xs font-bold leading-tight">"Você não precisa ser programador. Você precisa saber o caminho certo."</p>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Offer */}
      <section className="py-40 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4">
               <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                 Garantir meu acesso <br />
                 <span className="text-brand-purple">Vitalício</span>
               </h3>
               <div className="flex flex-col items-center gap-2 mt-4">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs line-through">De R$ 390,00</p>
                  <p className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Por apenas <span className="text-brand-green">R$ 39,90</span></p>
               </div>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">O acesso pode ser fechado a qualquer momento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
               {[
                 "Material prático direto ao ponto",
                 "Projetos completos do zero",
                 "Criação de sites, apps e mini SaaS",
                 "Deploy real com GitHub e Vercel",
                 "Estratégias para monetizar"
               ].map((item, idx) => (
                 <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-xl font-bold uppercase text-xs tracking-tight flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-brand-purple shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                   {item}
                 </div>
               ))}
            </div>

            <button 
              onClick={onStart}
              className="w-full py-6 bg-white text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-brand-purple hover:text-white transition-all shadow-2xl"
            >
              Garantir Meu Acesso Agora
            </button>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Comece agora e crie seu primeiro projeto ainda hoje.</p>
        </div>
      </section>

      {/* Footer mimic */}
      <footer className="p-20 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-black italic text-white/40">DS</div>
            <span className="font-black uppercase tracking-tighter text-xl text-white/40">Company</span>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2024 ds Company • Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
