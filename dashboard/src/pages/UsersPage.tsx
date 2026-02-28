import { useState } from 'react';
import { Search, MoreVertical, Shield, UserX, UserCheck } from 'lucide-react';
import { mockUsers, formatDate } from '../data/mockData';

const statusColors: Record<string, string> = {
    active: 'badge-success',
    inactive: 'badge-warning',
    blocked: 'badge-danger',
};
const statusLabels: Record<string, string> = {
    active: 'Activo', inactive: 'Inactivo', blocked: 'Bloqueado',
};

export default function UsersPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');

    const filtered = mockUsers
        .filter(u => filter === 'all' || u.status === filter)
        .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-4 sm:p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-secondary">Utilizadores</h2>
                    <p className="text-sm text-gray-400">{mockUsers.length} utilizadores registados</p>
                </div>
            </div>

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
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
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
