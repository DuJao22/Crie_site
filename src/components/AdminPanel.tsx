import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ChevronLeft, 
  MoreVertical, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert,
  Clock,
  Mail,
  RefreshCcw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserData {
  id: number;
  email: string;
  is_paid: number;
  is_admin: number;
  created_at: string;
}

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePaidStatus = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/toggle-paid`, { method: 'POST' });
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
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete user', e);
    }
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
              Controle de <span className="text-brand-purple">Usuários</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Gestão direta do ecossistema DS Company.</p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
             <div className="px-6 py-3 text-center border-r border-white/10">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total</p>
                <p className="text-2xl font-black">{users.length}</p>
             </div>
             <div className="px-6 py-3 text-center">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Ativos</p>
                <p className="text-2xl font-black text-brand-green">{users.filter(u => u.is_paid).length}</p>
             </div>
             <button 
               onClick={fetchUsers}
               className="p-4 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
             >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-purple transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="BUSCAR POR EMAIL..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-xs font-black uppercase tracking-widest focus:border-brand-purple focus:outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 p-1">
            {(['all', 'paid', 'unpaid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
              >
                {f === 'all' ? 'Todos' : f === 'paid' ? 'Pagos' : 'Pendentes'}
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
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status Acesso</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Tipo</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Data Registro</th>
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
                      exit={{ opacity: 0, x: -20 }}
                      key={u.id} 
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple">
                            <Mail size={18} />
                          </div>
                          <span className="font-black text-sm uppercase tracking-tight">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.is_paid ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                          {u.is_paid ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {u.is_paid ? 'Acesso Vitalício' : 'Pendente'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`text-[10px] font-black uppercase tracking-widest ${u.is_admin ? 'text-brand-pink' : 'text-slate-500'}`}>
                            {u.is_admin ? 'Administrador' : 'Estudante'}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                          <Clock size={12} />
                          {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => togglePaidStatus(u.id)}
                             title={u.is_paid ? "Revogar Acesso" : "Liberar Acesso (Isenção)"}
                             className={`p-3 rounded-xl border transition-all ${u.is_paid ? 'border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'border-brand-green/20 text-brand-green hover:bg-brand-green hover:text-white'}`}
                           >
                             {u.is_paid ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                           </button>
                           <button 
                             onClick={() => deleteUser(u.id)}
                             className="p-3 rounded-xl border border-white/10 text-slate-500 hover:bg-white hover:text-black transition-all"
                           >
                             <Trash2 size={18} />
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-black uppercase tracking-widest text-xs">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
