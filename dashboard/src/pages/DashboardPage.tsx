import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, TrendingUp, CreditCard, UserCheck, Truck, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockStats, mockOrders, formatCurrency, formatDate } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6'];

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        pending: 'badge-warning', confirmed: 'badge-info', shipped: 'badge-info',
        delivered: 'badge-success', cancelled: 'badge-danger',
        proof_submitted: 'badge-warning',
    };
    const labelMap: Record<string, string> = {
        pending: 'Pendente', confirmed: 'Confirmado', shipped: 'Enviado',
        delivered: 'Entregue', cancelled: 'Cancelado',
        proof_submitted: 'Comprovante',
    };
    return <span className={`${map[status] || 'badge-neutral'} px-2.5 py-1 rounded-lg text-xs font-semibold`}>{labelMap[status] || status}</span>;
};

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(mockStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error('Erro ao carregar estatísticas');
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Utilizadores', value: stats.totalUsers || 0, icon: Users, color: '#3B82F6', bg: '#DBEAFE', change: '+12%' },
        { label: 'Produtos Activos', value: stats.totalProducts || 0, icon: Package, color: '#22C55E', bg: '#D4F4E7', change: '+5' },
        { label: 'Total Encomendas', value: stats.totalOrders || 0, icon: ShoppingCart, color: '#8B5CF6', bg: '#EDE9FE', change: '+8%' },
        { label: 'Receita Total', value: formatCurrency(stats.totalRevenue || 0), icon: TrendingUp, color: '#F59E0B', bg: '#FFF8E1', change: '+15%' },
        { label: 'Pagamentos Pendentes', value: stats.pendingPayments || 0, icon: CreditCard, color: '#EF4444', bg: '#FEE2E2', change: 'Novos' },
        { label: 'Utilizadores Activos', value: stats.activeUsers || 0, icon: UserCheck, color: '#06B6D4', bg: '#CFFAFE', change: '93%' },
        { label: 'Frota Registada', value: stats.totalVehicles || 0, icon: Truck, color: '#F43F5E', bg: '#FFE4E6', change: 'Registados' },
    ];

    return (
        <div className="p-4 sm:p-6 space-y-6 animate-fadeIn relative">
            {loading && (
                <div className="absolute top-0 right-0 p-4">
                    <Loader2 className="animate-spin text-primary" size={20} />
                </div>
            )}

            {/* Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-secondary">Olá, {user?.name || 'Administrador'}</h2>
                    <p className="text-gray-400">Seja bem vindo de volta. {error && <span className="text-red-400">({error})</span>}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-card rounded-2xl p-5 border border-border card-hover">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                                <stat.icon size={22} style={{ color: stat.color }} />
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: stat.bg, color: stat.color }}>
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-secondary">{stat.value}</p>
                        <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-secondary">Receita Mensal</h3>
                            <p className="text-sm text-gray-400">Últimos 6 meses</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold gradient-text">{formatCurrency(stats.totalRevenue)}</p>
                            <p className="text-xs text-green-500 font-semibold">+15% vs último mês</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={stats.revenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                formatter={(value: any) => [formatCurrency(Number(value)), 'Receita']}
                            />
                            <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2.5} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-secondary mb-2">Categorias</h3>
                    <p className="text-sm text-gray-400 mb-4">Distribuição de vendas</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={stats.categoryDistribution}
                                cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                paddingAngle={4} dataKey="value" strokeWidth={0}
                            >
                                {stats.categoryDistribution.map((_, i) => (
                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [`${value}%`, 'Percentagem']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                        {stats.categoryDistribution.map((cat, i) => (
                            <div key={cat.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-gray-600">{cat.name}</span>
                                </div>
                                <span className="font-semibold text-secondary">{cat.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl border border-border">
                <div className="p-6 pb-4 border-b border-border">
                    <h3 className="text-lg font-bold text-secondary">Encomendas Recentes</h3>
                    <p className="text-sm text-gray-400">Últimas encomendas realizadas</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Pagamento</th>
                                <th className="px-6 py-3">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats.recentOrders || []).map((order: any) => (
                                <tr key={order.id} className="border-t border-border table-row-hover">
                                    <td className="px-6 py-4 text-sm font-mono font-semibold text-primary">{order.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-secondary">{order.userName}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-secondary">{formatCurrency(order.total)}</td>
                                    <td className="px-6 py-4">{statusBadge(order.status)}</td>
                                    <td className="px-6 py-4 text-xs">{statusBadge(order.payment_status)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(order.created_at)}</td>
                                </tr>
                            ))}
                            {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Nenhuma encomenda recente</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
