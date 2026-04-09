import { useState, useEffect } from 'react';
import { Search, MoreVertical, Shield, UserX, UserCheck, Loader2 } from 'lucide-react';
import { formatDate } from '../data/mockData';
import { User } from '../types';

const statusColors: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-warning',
    blocked: 'badge-danger',
};
const statusLabels: Record<string, string> = {
    active: 'Activo', inactive: 'Inactivo', blocked: 'Bloqueado',
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Erro ao carregar utilizadores');
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filtered = users
        .filter(u => filter === 'all' || u.status === filter)
        .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-4 sm:p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-secondary">Utilizadores</h2>
                    <p className="text-sm text-gray-400">{users.length} utilizadores registados</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-border flex-1">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Pesquisar utilizador..."
                        className="bg-transparent border-none outline-none text-sm flex-1 text-secondary placeholder:text-gray-400"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'active', 'inactive', 'blocked'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-border hover:bg-gray-50'}`}
                        >
                            {s === 'all' ? 'Todos' : statusLabels[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                <th className="px-6 py-3">Utilizador</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Registo</th>
                                <th className="px-6 py-3">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(user => (
                                <tr key={user.id} className="border-t border-border table-row-hover">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-semibold text-secondary">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${user.role === 'admin' ? 'text-purple-600' : 'text-gray-500'}`}>
                                            {user.role === 'admin' && <Shield size={12} />}
                                            {user.role === 'admin' ? 'Admin' : 'Utilizador'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`${statusColors[user.status || 'active']} px-2.5 py-1 rounded-lg text-xs font-semibold`}>
                                            {statusLabels[user.status || 'active']}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(user.createdAt || '')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <button className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Activar">
                                                <UserCheck size={16} />
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Bloquear">
                                                <UserX size={16} />
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">Nenhum utilizador encontrado</div>
                )}
            </div>
        </div>
    );
}
