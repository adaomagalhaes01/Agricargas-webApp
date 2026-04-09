import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';
import { mockStats, formatCurrency } from '../data/mockData';

const COLORS = ['#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

export default function StatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-primary mb-4" size={32} />
                <p className="text-gray-400">Carregando estatísticas...</p>
            </div>
        );
    }

    const weeklyData = stats.weeklyData || [];
    const topProducts = stats.topProducts || [];
    const maxSales = topProducts.length > 0 ? Math.max(...topProducts.map((p: any) => p.sales || 0)) : 1;

    return (
        <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
            <div>
                <h2 className="text-xl font-bold text-secondary text-left">Estatísticas</h2>
                <p className="text-sm text-gray-400 text-left">Análise detalhada do desempenho em tempo real</p>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Weekly Orders */}
                <div className="bg-white rounded-2xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-secondary mb-1 text-left">Encomendas Semanais</h3>
                    <p className="text-sm text-gray-400 mb-6 text-left">Últimos 7 dias</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
                            <Bar dataKey="orders" fill="#22C55E" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Weekly Revenue */}
                <div className="bg-white rounded-2xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-secondary mb-1 text-left">Receita Semanal</h3>
                    <p className="text-sm text-gray-400 mb-6 text-left">Últimos 7 dias</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} formatter={(v: any) => [formatCurrency(Number(v)), 'Receita']} />
                            <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2.5} dot={{ fill: '#8B5CF6', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-secondary mb-1 text-left">Top 5 Produtos</h3>
                    <p className="text-sm text-gray-400 mb-6 text-left">Mais vendidos (volume total)</p>
                    <div className="space-y-4">
                        {topProducts.map((prod: any, i: number) => (
                            <div key={prod.name + i} className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-300 w-6">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-secondary">{prod.name}</span>
                                        <span className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>{prod.sales}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${(prod.sales / maxSales) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && <p className="text-center text-gray-400 py-10">Sem vendas registradas</p>}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-secondary mb-1">Distribuição por Categoria</h3>
                    <p className="text-sm text-gray-400 mb-6">Proporção de vendas</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={stats.categoryDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" strokeWidth={0} label={({ name, value }) => `${name} ${value}%`}>
                                {stats.categoryDistribution.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
