import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Zap, 
  CheckCircle2, 
  Lock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface CheckoutPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function CheckoutPage({ onBack, onSuccess }: CheckoutPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout/create-preference', {
        method: 'GET',
        credentials: 'include',
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Unexpected response:', text);
        throw new Error(`Erro do servidor (${response.status}).`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      // Em um ambiente real, redirecionamos para o checkout do Mercado Pago
      // data.init_point contém a URL do checkout Pro
      window.location.href = data.init_point;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 pb-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-purple/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left: Product Info */}
        <div className="space-y-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          <div className="space-y-4">
             <span className="px-3 py-1 bg-brand-purple/20 text-brand-purple text-[10px] font-black uppercase tracking-widest border border-brand-purple/30 rounded-full">
               Acesso Vitalício
             </span>
             <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
               DS COMPANY <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-pink underline decoration-brand-purple/30 underline-offset-8">STUDY PASS</span>
             </h1>
             <p className="text-slate-400 font-medium text-lg max-w-md">
               Desbloqueie todos os módulos, ferramentas de IA e comunidade exclusiva hoje mesmo.
             </p>
             
             <a 
               href="https://bio.site/Joao_Layon_DS_Company" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-brand-purple hover:underline"
             >
               <ExternalLink size={14} /> Ver Projetos Reais de Alunos
             </a>
          </div>

          <div className="space-y-4">
            {[
              "Todos os 6 Módulos Práticos",
              "Gerador de Sites via IA",
              "Modelos de Mini SaaS Lucrativos",
              "Comunidade Interna de Devs",
              "Certificado de Conclusão"
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm font-bold uppercase tracking-tight text-white/80">
                <div className="w-6 h-6 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-6">
             <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Garantia Blindada</p>
                <p className="text-sm font-bold text-white uppercase">7 Dias para Arrependimento</p>
             </div>
          </div>
        </div>

        {/* Right: Checkout Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white text-black p-8 md:p-12 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] space-y-8 relative overflow-hidden"
        >
          {/* Discount Tag */}
          <div className="absolute top-8 right-8 bg-black text-[#00FF88] px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
            -70% OFF HOJE
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Investimento Único</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-300 line-through">R$ 390,00</span>
              <span className="text-5xl md:text-6xl font-black tracking-tighter">R$ 39,90</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Formas de Pagamento</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center gap-2">
                <QrCode size={20} className="text-brand-purple" />
                <span className="text-[8px] font-black uppercase tracking-widest">PIX</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center gap-2">
                <CreditCard size={20} className="text-brand-purple" />
                <span className="text-[8px] font-black uppercase tracking-widest">CARTÃO</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center gap-2">
                <Zap size={20} className="text-brand-purple" />
                <span className="text-[8px] font-black uppercase tracking-widest">BOLETO</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase text-center">
              {error}
            </div>
          )}

          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-6 bg-black text-white font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-brand-purple transition-all flex items-center justify-center gap-4 group shadow-2xl disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Finalizar Inscrição
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-400">
               <Lock size={12} />
               <span className="text-[8px] font-black uppercase tracking-widest">Pagamento Seguro</span>
            </div>
            <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-1.png" className="h-4 grayscale opacity-50" alt="Mercado Pago" />
          </div>
        </motion.div>
      </div>

      <p className="mt-8 text-[10px] font-bold uppercase text-slate-700 tracking-[0.5em]">&copy; {new Date().getFullYear()} DS COMPANY. TODOS OS DIREITOS RESERVADOS.</p>
    </div>
  );
}
