import { useState } from 'react';
import { Search, Eye, Truck, CheckCircle, XCircle } from 'lucide-react';
import { mockOrders, formatCurrency, formatDate } from '../data/mockData';

const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: 'badge-warning', confirmed: 'badge-info', shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger' };
    const labels: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado' };
    return <span className={`${map[status] || 'badge-neutral'} px-2.5 py-1 rounded-lg text-xs font-semibold`}>{labels[status] || status}</span>;
};

export default function OrdersPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = mockOrders
        .filter(o => statusFilter === 'all' || o.status === statusFilter)
        .filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.userName.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-4 sm:p-6 animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-secondary">Encomendas</h2>
                <p className="text-sm text-gray-400">{mockOrders.length} encomendas no total</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-border flex-1">
                    <Search size={16} className="text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por ID ou nome..." className="bg-transparent border-none outline-none text-sm flex-1 text-secondary placeholder:text-gray-400" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white rounded-xl text-sm border border-border focus:outline-none focus:border-primary/50">
                    <option value="all">Todos Status</option>
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Produtos</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Morada</th>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(order => (
                                <tr key={order.id} className="border-t border-border table-row-hover">
                                    <td className="px-6 py-4 text-sm font-mono font-semibold text-primary">{order.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-secondary">{order.userName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{order.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-secondary">{formatCurrency(order.total)}</td>
                                    <td className="px-6 py-4">{statusBadge(order.status)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400 max-w-[150px] truncate">{order.deliveryAddress}</td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(order.createdAt)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Ver detalhes"><Eye size={16} /></button>
                                            <button className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Marcar enviado"><Truck size={16} /></button>
                                            <button className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors" title="Marcar entregue"><CheckCircle size={16} /></button>
                                            <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Cancelar"><XCircle size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">Nenhuma encomenda encontrada</div>
                )}
            </div>
        </div>
    );
}
