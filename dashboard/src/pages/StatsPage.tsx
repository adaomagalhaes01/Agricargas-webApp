import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { mockStats, formatCurrency } from '../data/mockData';

const weeklyData = [
    { day: 'Seg', orders: 45, revenue: 2500000 },
    { day: 'Ter', orders: 52, revenue: 3100000 },
    { day: 'Qua', orders: 38, revenue: 2200000 },
    { day: 'Qui', orders: 65, revenue: 4000000 },
    { day: 'Sex', orders: 72, revenue: 4500000 },
    { day: 'Sáb', orders: 85, revenue: 5200000 },
    { day: 'Dom', orders: 30, revenue: 1800000 },
];

const topProducts = [
    { name: 'Cenouras', sales: 245 },
    { name: 'Tomates', sales: 198 },
    { name: 'Mangas', sales: 176 },
    { name: 'Bananas', sales: 154 },
    { name: 'Pimentão', sales: 132 },
];

const COLORS = ['#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444'];

export default function StatsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
            <div>
                <h2 className="text-xl font-bold text-secondary">Estatísticas</h2>
                <p className="text-sm text-gray-400">Análise detalhada do desempenho</p>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Weekly Orders */}
                <div className="bg-white rounded-2xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-secondary mb-1">Encomendas Semanais</h3>
                    <p className="text-sm text-gray-400 mb-6">Últimos 7 dias</p>
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
                    <h3 className="text-lg font-bold text-secondary mb-1">Receita Semanal</h3>
                    <p className="text-sm text-gray-400 mb-6">Últimos 7 dias</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                            <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} formatter={(v: number) => [formatCurrency(v), 'Receita']} />
                            <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2.5} dot={{ fill: '#8B5CF6', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-secondary mb-1">Top 5 Produtos</h3>
                    <p className="text-sm text-gray-400 mb-6">Mais vendidos este mês</p>
                    <div className="space-y-4">
                        {topProducts.map((prod, i) => (
                            <div key={prod.name} className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-300 w-6">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-secondary">{prod.name}</span>
                                        <span className="text-sm font-bold" style={{ color: COLORS[i] }}>{prod.sales}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${(prod.sales / topProducts[0].sales) * 100}%`, backgroundColor: COLORS[i] }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-border">
                    <h3 className="text-lg font-bold text-secondary mb-1">Distribuição por Categoria</h3>
                    <p className="text-sm text-gray-400 mb-6">Proporção de vendas</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={mockStats.categoryDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" strokeWidth={0} label={({ name, value }) => `${name} ${value}%`}>
                                {mockStats.categoryDistribution.map((_, i) => (
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
