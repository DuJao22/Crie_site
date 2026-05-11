import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  Award,
  BookOpen,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface QuizViewProps {
  moduleId: number;
  moduleTitle: string;
  onClose: () => void;
  onSuccess: (score: number) => void;
}

export default function QuizView({ moduleId, moduleTitle, onClose, onSuccess }: QuizViewProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(10).fill(null));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number, passed: boolean } | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/modules/${moduleId}/quiz`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
          setAnswers(new Array(data.length).fill(null));
        }
      } catch (e) {
        console.error('Failed to fetch quiz', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [moduleId]);

  const handleSubmit = async () => {
    if (answers.includes(null)) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/modules/${moduleId}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setResult({ score: data.score, passed: data.passed });
      }
    } catch (e) {
      console.error('Failed to submit quiz', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b]">
        <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] p-6 text-center space-y-4">
        <XCircle size={64} className="text-slate-700" />
        <h2 className="text-2xl font-black uppercase">Nenhuma pergunta encontrada</h2>
        <p className="text-slate-500 text-sm">Este módulo ainda não possui um questionário configurado.</p>
        <button onClick={onClose} className="px-8 py-4 bg-white text-black font-black uppercase text-xs rounded-xl">Voltar</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex-1 bg-[#09090b] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/5 border border-white/10 rounded-[40px] p-10 text-center space-y-8 backdrop-blur-xl"
        >
          <div className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center ${result.passed ? 'bg-brand-green/20 text-brand-green' : 'bg-red-500/20 text-red-500'}`}>
            {result.passed ? <Award size={48} /> : <XCircle size={48} />}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter">
              {result.passed ? 'Aprovado!' : 'Tente Novamente'}
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              Você acertou {result.score} de {questions.length} questões.
            </p>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            {result.passed 
              ? 'Parabéns! Você demonstrou domínio sobre este conteúdo e o próximo módulo foi desbloqueado.' 
              : 'Você precisa de pelo menos 7 acertos para passar. Revise o conteúdo e tente mais uma vez.'}
          </p>

          <div className="pt-4">
            {result.passed ? (
              <button 
                onClick={() => onSuccess(result.score)}
                className="w-full py-5 bg-brand-purple text-white font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all"
              >
                Continuar Jornada <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={() => {
                  setResult(null);
                  setCurrentIdx(0);
                  setAnswers(new Array(questions.length).fill(null));
                }}
                className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-brand-purple hover:text-white transition-all"
              >
                Reiniciar Teste <RotateCcw size={16} />
              </button>
            )}
            <button onClick={onClose} className="mt-4 text-[10px] font-black uppercase text-slate-500 hover:text-white tracking-widest">Sair do Quiz</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="flex-1 bg-[#09090b] flex flex-col overflow-hidden">
      {/* Quiz Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase text-brand-purple tracking-widest">Questionário Obrigatório</p>
            <h2 className="text-lg font-black uppercase tracking-tight line-clamp-1">{moduleTitle}</h2>
          </div>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10">
           <span className="text-xs font-black uppercase tracking-tighter">
             Questão <span className="text-brand-purple">{currentIdx + 1}</span> / {questions.length}
           </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          className="h-full bg-brand-purple"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="max-w-3xl w-full space-y-12 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                {q.question}
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const newAnswers = [...answers];
                      newAnswers[currentIdx] = idx;
                      setAnswers(newAnswers);
                    }}
                    className={`p-6 rounded-3xl border text-left flex items-center gap-6 transition-all group ${
                      answers[currentIdx] === idx 
                      ? 'bg-brand-purple/20 border-brand-purple text-white' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border transition-colors ${
                      answers[currentIdx] === idx 
                      ? 'bg-brand-purple border-brand-purple text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                      : 'bg-black/20 border-white/10 group-hover:border-white/30'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="font-bold text-sm md:text-base">{opt}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-white/5 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between">
        <button 
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          Anterior
        </button>

        {currentIdx === questions.length - 1 ? (
          <button 
            onClick={handleSubmit}
            disabled={submitting || answers.includes(null)}
            className="px-10 py-5 bg-brand-green text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:opacity-90 disabled:opacity-30 flex items-center gap-3 transition-all shadow-[0_10px_20px_rgba(0,255,136,0.2)]"
          >
            {submitting ? 'Enviando...' : 'Finalizar Teste'} <CheckCircle2 size={16} />
          </button>
        ) : (
          <button 
            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={answers[currentIdx] === null}
            className="px-10 py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-brand-purple hover:text-white disabled:opacity-30 flex items-center gap-3 transition-all"
          >
            Próxima <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
