import { motion } from 'motion/react';
import { ChevronRight, BookOpen, FileText, Rocket, Sparkles, CheckCircle2, Github } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Freelancer",
    content: "O treinamento mudou minha percepção sobre IA. Em uma semana criei minha primeira landing page profissional para um cliente.",
    avatar: "https://i.pravatar.cc/100?img=11"
  },
  {
    name: "Ana Oliveira",
    role: "Social Media",
    content: "A facilidade de criar páginas de alta conversão sem tocar no código é bizarra. Meus clientes adoraram os resultados!",
    avatar: "https://i.pravatar.cc/100?img=32"
  },
  {
    name: "Marcos Souza",
    role: "Gestor de Tráfego",
    content: "Consegui escalar meu serviço de criação de páginas em 10x usando as ferramentas e prompts ensinados aqui.",
    avatar: "https://i.pravatar.cc/100?img=53"
  }
];

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-brand-purple selection:text-white overflow-x-hidden">
      {/* Mobile PWA Tip */}
      <div className="bg-brand-purple/20 border-b border-brand-purple/30 p-3 text-center">
        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-brand-purple">
          💡 Dica: No celular, clique em "Adicionar à Tela de Início" para usar em tela cheia!
        </p>
      </div>

      {/* Navbar mimic */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="https://i.postimg.cc/kgmY092W/image-removebg-preview-(20).png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-black uppercase tracking-tighter text-xl">LP Master</span>
        </div>
        <div className="flex gap-2 md:gap-4">
          <button onClick={onLogin} className="hidden sm:block px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors">Fazer Login</button>
          <button onClick={onStart} className="px-4 md:px-6 py-2 bg-white text-black text-[10px] font-black uppercase rounded-lg hover:bg-brand-purple hover:text-white transition-colors">Acessar Sistema</button>
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
            Formação Landing Page Master
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter max-w-5xl"
          >
            Landing Pages com IA — <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">Engenharia de Prompt do Zero ao Profissional</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-medium text-lg md:text-xl max-w-3xl leading-relaxed"
          >
            Aprenda a criar landing pages profissionais usando Inteligência Artificial, prompts avançados e ferramentas modernas sem precisar programar.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto"
          >
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-gradient-to-r from-brand-purple to-brand-pink text-white font-black uppercase text-xs tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(99,102,241,0.2)] group"
            >
              Criar Minha Conta Grátis 🚀
            </button>
            <button 
              onClick={onLogin}
              className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Fazer Login no Painel
            </button>
          </motion.div>

          {/* Social Proof Stats */}
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
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">+ 5.000 membros integrados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">O que você vai <span className="text-brand-purple">Dominar</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Transforme conhecimento em produtos reais.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: <Rocket />, title: "Deploy Online", desc: "Aprenda a colocar seu site no ar em segundos usando GitHub e Vercel sem custo." },
              { icon: <Sparkles />, title: "Prompts Fortes", desc: "Domine a engenharia de prompt para gerar páginas modernas e funcionais." },
              { icon: <CheckCircle2 />, title: "Responsividade", desc: "Crie páginas que funcionam perfeitamente em mobile, tablet e desktop." },
              { icon: <FileText />, title: "Copywriting IA", desc: "Gere headlines e CTAs poderosas que vendem usando inteligência artificial." },
              { icon: <BookOpen />, title: "Estrutura Prof.", desc: "Aprenda a anatomia correta de uma Landing Page de alta performance." },
              { icon: <Rocket />, title: "Monetização", desc: "Aprenda a vender seus serviços como freelancer e precificar seus projetos." },
              { icon: <Github />, title: "GitHub Expert", desc: "Versionamento profissional para você salvar e gerir seus códigos com segurança." },
              { icon: <Sparkles />, title: "100+ Prompts", desc: "Acesso a uma biblioteca exclusiva de prompts prontos para diversos nichos." }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all group">
                <div className="w-14 h-14 bg-brand-purple/20 text-brand-purple rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight mb-2">{f.title}</h3>
                <p className="text-slate-400 font-medium text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-brand-purple/20 to-brand-pink/20 p-12 rounded-[50px] border border-white/10">
             <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">O seu <span className="text-white">Resultado Final</span></h3>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Ao concluir este treinamento, você estará pronto para:</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[
                     "Criar landing pages profissionais com IA",
                     "Criar prompts poderosos e avançados",
                     "Gerar páginas modernas automaticamente",
                     "Editar páginas com precisão usando IA",
                     "Fazer deploy grátis e publicar projetos",
                     "Trabalhar como freelancer e vender páginas"
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                        <CheckCircle2 size={18} className="text-brand-green" />
                        <span className="text-sm font-bold uppercase tracking-tight text-slate-300">{item}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-16 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-black text-brand-purple uppercase tracking-[0.4em]">Showcase</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Resultados <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink">Reais</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Páginas de alta performance criadas por nossos membros.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Dashboard SaaS Moderno", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop" },
              { title: "Landing Page Agência", img: "https://images.unsplash.com/photo-1551288049-bbbda536ad37?q=80&w=1200&auto=format&fit=crop" },
              { title: "E-commerce de Eletrônicos", img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1200&auto=format&fit=crop" },
              { title: "Site Institucional Premium", img: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1200&auto=format&fit=crop" }
            ].map((r, i) => (
              <div key={i} className="group relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src={r.img} 
                  alt={r.title} 
                  className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-10">
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-brand-purple tracking-widest mb-2">Projeto de Sucesso</p>
                    <h4 className="text-2xl font-black uppercase tracking-tight">{r.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          
          {/* Ideal Para Section */}
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-brand-pink uppercase tracking-[0.4em]">Target</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Para quem é este <span className="text-brand-purple">Treinamento?</span></h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
               {[
                 "Iniciantes", "Designers", "Freelancers", "Social Medias", 
                 "Afiliados", "Donos de Agência", "Programadores", 
                 "Criadores de Conteúdo", "Vendedores de LPs"
               ].map((item, idx) => (
                 <div key={idx} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-brand-purple transition-all cursor-default">
                    {item}
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-brand-purple uppercase tracking-[0.4em]">Life Changing</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Provas de <span className="text-brand-pink">Sucesso</span></h2>
            </div>
            <p className="text-slate-400 font-medium max-w-sm">Veja o que os membros da nossa comunidade estão construindo com o método DS.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/5 blur-2xl rounded-full" />
                <div className="flex text-yellow-400 gap-0.5">
                  {[1,2,3,4,5].map(star => <Sparkles key={star} size={10} fill="currentColor" />)}
                </div>
                <p className="text-sm font-medium italic text-slate-300 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                    <img src={t.avatar} alt={t.name} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black uppercase tracking-tight">{t.name}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-40 px-6 text-center bg-gradient-to-t from-brand-purple/10 to-transparent">
        <div className="max-w-4xl mx-auto space-y-12">
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Pronto para <br />
              <span className="text-brand-purple">Transformar Ideias?</span>
            </h3>
            
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
              Junte-se a milhares de outros alunos que já estão construindo o futuro da web usando Inteligência Artificial.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onStart}
                className="px-12 py-6 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-brand-purple hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4"
              >
                Acessar Portal Agora <ChevronRight size={18} />
              </button>
              <button 
                onClick={onLogin}
                className="px-12 py-6 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all"
              >
                Entrar na Minha Conta
              </button>
            </div>
            
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Ambiente seguro • Acesso imediato • 100% Online</p>
        </div>
      </section>

      {/* Footer mimic */}
      <footer className="p-20 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 grayscale opacity-40">
            <img src="https://i.postimg.cc/kgmY092W/image-removebg-preview-(20).png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-black uppercase tracking-tighter text-xl">LP Master</span>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© {new Date().getFullYear()} LP Master • Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}

