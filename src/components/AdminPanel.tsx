import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ChevronLeft, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert,
  Clock,
  Mail,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
  Plus,
  Image as ImageIcon,
  CheckSquare,
  ChevronRight,
  Save,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserData {
  id: number;
  email: string;
  is_paid: number;
  is_admin: number;
  created_at: string;
}

interface Question {
  id?: number;
  question: string;
  options: string[];
  correct_option: number;
}

interface ModuleData {
  id: number;
  title: string;
  description: string;
  content: string;
  image_url: string;
  is_free: number;
  order_index: number;
  questions: Question[];
}

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'modules'>('users');
  const [users, setUsers] = useState<UserData[]>([]);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Module Editing
  const [editingModule, setEditingModule] = useState<null | Partial<ModuleData>>(null);
  const [editingQuestions, setEditingQuestions] = useState<Question[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/modules', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (e) {
      console.error('Failed to fetch modules', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else fetchModules();
  }, [activeTab]);

  const togglePaidStatus = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/toggle-paid`, { method: 'POST', credentials: 'include' });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, is_paid: u.is_paid ? 0 : 1 } : u));
      }
    } catch (e) {
      console.error('Failed to toggle status', e);
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  const deleteModule = async (id: number) => {
    if (!window.confirm('Excluir este módulo apagará todas as aulas e progresso associados. Continuar?')) return;
    try {
      const res = await fetch(`/api/admin/modules/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setModules(modules.filter(m => m.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete module', e);
    }
  };

  const saveModule = async () => {
    if (!editingModule?.title) return alert('Título é obrigatório');
    
    const method = editingModule.id ? 'PUT' : 'POST';
    const url = editingModule.id ? `/api/admin/modules/${editingModule.id}` : '/api/admin/modules';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingModule),
        credentials: 'include'
      });
      
      if (res.ok) {
        setEditingModule(null);
        fetchModules();
      }
    } catch (e) {
      alert('Erro ao salvar módulo');
    }
  };

  const saveQuestions = async () => {
    if (editingQuestions.length !== 10) return alert('São necessárias exatamente 10 perguntas.');
    
    // Validate each question
    for (const q of editingQuestions) {
      if (!q.question || q.options.some(o => !o)) {
        return alert('Todas as perguntas e opções devem ser preenchidas.');
      }
    }

    try {
      const res = await fetch(`/api/admin/modules/${editingModule?.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: editingQuestions }),
        credentials: 'include'
      });
      
      if (res.ok) {
        alert('Questionário salvo com sucesso!');
        setEditingQuestions([]);
        setEditingModule(null);
        fetchModules();
      }
    } catch (e) {
      alert('Erro ao salvar perguntas');
    }
  };

  const addQuestion = () => {
    if (editingQuestions.length >= 10) return;
    setEditingQuestions([...editingQuestions, { 
      question: '', 
      options: ['', '', '', ''], 
      correct_option: 0 
    }]);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'paid' ? u.is_paid : !u.is_paid);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-12 font-sans selection:bg-brand-purple">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft size={16} /> Voltar ao Painel
            </button>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none flex items-center gap-4">
              Painel de <span className="text-brand-purple">Gerenciamento</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Acesso total ao sistema LP Master.</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
            >
              <Users size={16} /> Usuários
            </button>
            <button 
              onClick={() => setActiveTab('modules')}
              className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'modules' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
            >
              <BookOpen size={16} /> Módulos
            </button>
          </div>
        </div>

        {activeTab === 'users' ? (
          <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-purple transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="BUSCAR USUÁRIO..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-xs font-black uppercase tracking-widest focus:border-brand-purple focus:outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
                {(['all', 'paid', 'unpaid'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                  >
                    {f === 'all' ? 'Todos' : f === 'paid' ? 'Ativos' : 'Pendentes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Usuário</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tipo</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.map((u) => (
                        <motion.tr 
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={u.id} 
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-8 py-6">
                            <div className="font-black text-sm uppercase tracking-tight">{u.email}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.is_paid ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                              {u.is_paid ? 'Ativo' : 'Inativo'}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {u.is_admin ? 'Admin' : 'Estudante'}
                          </td>
                          <td className="px-8 py-6 text-right space-x-2">
                             <button onClick={() => togglePaidStatus(u.id)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-green hover:text-white"><ShieldCheck size={16} /></button>
                             <button onClick={() => deleteUser(u.id)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Gerenciar Módulos</h2>
              <button 
                onClick={() => setEditingModule({ title: '', description: '', image_url: '', is_free: 1, order_index: modules.length })}
                className="bg-brand-purple px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:opacity-90 transition-all"
              >
                <Plus size={16} /> Novo Módulo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map(m => (
                <div key={m.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.title} className="w-full h-40 object-cover" />
) : (
                    <div className="w-full h-40 bg-white/5 flex items-center justify-center text-slate-700">
                      <ImageIcon size={40} />
                    </div>
                  )}
                  <div className="p-6 space-y-4 flex-1">
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-lg leading-none">{m.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{m.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className={`text-[10px] font-black uppercase px-2 py-1 rounded bg-white/5 ${m.is_free ? 'text-brand-green' : 'text-yellow-500'}`}>
                         {m.is_free ? 'Gratuito' : 'Pago/Trava'}
                       </span>
                       <span className="text-[10px] font-black text-slate-500">Módulo #{m.order_index + 1}</span>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button 
                        onClick={() => setEditingModule(m)}
                        className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all"
                      >
                        Configurar
                      </button>
                      <button 
                        onClick={() => {
                          setEditingModule(m);
                          setEditingQuestions(m.questions || []);
                        }}
                        className="flex-1 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-brand-purple hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        <CheckSquare size={14} /> Quiz ({m.questions?.length || 0}/10)
                      </button>
                      <button onClick={() => deleteModule(m.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Editing Overlay */}
            <AnimatePresence>
              {editingModule && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-[#09090b]/90 backdrop-blur-xl p-6 overflow-y-auto flex items-start justify-center"
                >
                  <div className="w-full max-w-4xl bg-[#111113] border border-white/10 rounded-[40px] p-8 md:p-12 my-12 relative shadow-2xl">
                    <button 
                      onClick={() => {
                        setEditingModule(null);
                        setEditingQuestions([]);
                      }}
                      className="absolute top-8 right-8 text-slate-500 hover:text-white border border-white/5 p-3 rounded-full"
                    >
                      <XCircle size={24} />
                    </button>

                    <div className="space-y-12">
                      <div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter">
                          {editingQuestions.length > 0 ? 'Editar Questionário' : (editingModule.id ? 'Editar Módulo' : 'Novo Módulo')}
                        </h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
                          {editingQuestions.length > 0 ? 'Configure as 10 questões obrigatórias do módulo.' : 'Defina os detalhes e a capa do módulo.'}
                        </p>
                      </div>

                      {editingQuestions.length > 0 ? (
                        <div className="space-y-10">
                          {editingQuestions.map((q, qIdx) => (
                            <div key={qIdx} className="space-y-6 p-8 bg-white/5 border border-white/10 rounded-[32px]">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-brand-purple tracking-widest">Questão #{qIdx + 1}</span>
                                <button 
                                  onClick={() => setEditingQuestions(editingQuestions.filter((_, i) => i !== qIdx))}
                                  className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <input 
                                type="text" 
                                placeholder="PERGUNTA..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black tracking-widest focus:border-brand-purple outline-none"
                                value={q.question}
                                onChange={(e) => {
                                  const newQ = [...editingQuestions];
                                  newQ[qIdx].question = e.target.value;
                                  setEditingQuestions(newQ);
                                }}
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex gap-2">
                                    <button 
                                      onClick={() => {
                                        const newQ = [...editingQuestions];
                                        newQ[qIdx].correct_option = oIdx;
                                        setEditingQuestions(newQ);
                                      }}
                                      className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-all font-black text-xs ${q.correct_option === oIdx ? 'bg-brand-green border-brand-green text-black' : 'border-white/10 text-slate-500'}`}
                                    >
                                      {String.fromCharCode(65 + oIdx)}
                                    </button>
                                    <input 
                                      type="text" 
                                      placeholder={`OPÇÃO ${String.fromCharCode(65 + oIdx)}...`}
                                      className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-6 text-[10px] font-black tracking-widest focus:border-brand-purple outline-none"
                                      value={opt}
                                      onChange={(e) => {
                                        const newQ = [...editingQuestions];
                                        newQ[qIdx].options[oIdx] = e.target.value;
                                        setEditingQuestions(newQ);
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {editingQuestions.length < 10 && (
                            <button 
                              onClick={addQuestion}
                              className="w-full py-8 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 hover:border-brand-purple hover:text-brand-purple transition-all flex items-center justify-center gap-4 font-black uppercase text-xs tracking-widest"
                            >
                              <Plus /> Adicionar Questão ({editingQuestions.length}/10)
                            </button>
                          )}

                          <button 
                            onClick={saveQuestions}
                            className="w-full py-6 bg-brand-green text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-4"
                          >
                            <Save /> Salvar Questionário Completo
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Título do Módulo</label>
                                <input 
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black"
                                  value={editingModule.title}
                                  onChange={e => setEditingModule({...editingModule, title: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Descrição curta (Overview)</label>
                                <input 
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black"
                                  value={editingModule.description}
                                  onChange={e => setEditingModule({...editingModule, description: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Conteúdo da Aula (Texto Completo)</label>
                                <textarea 
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black h-48 resize-none"
                                  value={editingModule.content}
                                  onChange={e => setEditingModule({...editingModule, content: e.target.value})}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ordem</label>
                                  <input 
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black"
                                    value={editingModule.order_index}
                                    onChange={e => setEditingModule({...editingModule, order_index: parseInt(e.target.value)})}
                                  />
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Visibilidade</label>
                                   <div className="flex gap-2">
                                      <button 
                                        onClick={() => setEditingModule({...editingModule, is_free: 1})}
                                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase border transition-all ${editingModule.is_free ? 'bg-brand-green border-brand-green text-black' : 'border-white/10 text-slate-500'}`}
                                      >
                                        Grátis
                                      </button>
                                      <button 
                                        onClick={() => setEditingModule({...editingModule, is_free: 0})}
                                        className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase border transition-all ${!editingModule.is_free ? 'bg-yellow-500 border-yellow-500 text-black' : 'border-white/10 text-slate-500'}`}
                                      >
                                        Pago
                                      </button>
                                   </div>
                                </div>
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">URL da Imagem Capa</label>
                                <input 
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black"
                                  placeholder="https://..."
                                  value={editingModule.image_url}
                                  onChange={e => setEditingModule({...editingModule, image_url: e.target.value})}
                                />
                              </div>
                              <div className="aspect-video bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center relative group">
                                 {editingModule.image_url ? (
                                   <img src={editingModule.image_url} className="w-full h-full object-cover" />
                                 ) : (
                                   <div className="text-center space-y-2 text-slate-700">
                                      <ImageIcon size={48} className="mx-auto" />
                                      <p className="text-[10px] font-black uppercase tracking-widest">Prévia da Capa</p>
                                   </div>
                                 )}
                              </div>
                              <button 
                                onClick={saveModule}
                                className="w-full py-6 bg-brand-purple text-white font-black uppercase text-sm tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-4"
                              >
                                <Save /> Salvar Módulo
                              </button>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
