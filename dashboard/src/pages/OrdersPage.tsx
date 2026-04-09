import { useState, useEffect } from 'react';
import { Search, Eye, Truck, CheckCircle, XCircle, Loader2, DollarSign, MapPin, X, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../data/mockData';

const statusBadge = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', shipped: 'bg-indigo-100 text-indigo-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
    const labels: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado' };
    return <span className={`${map[status] || 'bg-gray-100 text-gray-700'} px-2.5 py-1 rounded-lg text-xs font-semibold`}>{labels[status] || status}</span>;
};

const paymentBadge = (status: string) => {
    const map: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', proof_submitted: 'bg-purple-100 text-purple-700', confirmed: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    const labels: Record<string, string> = { pending: 'Aguardando', proof_submitted: 'Comprovativo Enviado', confirmed: 'Confirmado', rejected: 'Recusado' };
    return <span className={`${map[status] || 'bg-gray-100 text-gray-700'} px-2.5 py-1 rounded-lg text-xs font-semibold`}>{labels[status] || status}</span>;
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            setOrders(data);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, updates: any) => {
        try {
            await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            fetchOrders();
            if (selectedOrder?.id === orderId) setSelectedOrder(null);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const filtered = (orders || [])
        .filter(o => statusFilter === 'all' || o.status === statusFilter)
        .filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.userName.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-4 sm:p-6 animate-fadeIn relative min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-secondary">Encomendas</h2>
                    <p className="text-sm text-gray-400">{orders.length} encomendas no total</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-border flex-1 shadow-sm">
                    <Search size={16} className="text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por ID ou nome..." className="bg-transparent border-none outline-none text-sm flex-1 text-secondary placeholder:text-gray-400" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 bg-white rounded-xl text-sm border border-border focus:outline-none focus:border-primary/50 shadow-sm">
                    <option value="all">Todos Status</option>
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregue</option>
                    <option value="cancelled">Cancelado</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-border">
                                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Pagamento</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4 text-center">Acções</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map(order => (
                                    <tr key={order.id} className="table-row-hover group">
                                        <td className="px-6 py-4 text-sm font-mono font-semibold text-primary">{order.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-secondary">{order.userName}</span>
                                                <span className="text-[10px] text-gray-400">{order.userEmail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-secondary">{formatCurrency(order.total)}</td>
                                        <td className="px-6 py-4">{statusBadge(order.status)}</td>
                                        <td className="px-6 py-4">{paymentBadge(order.payment_status)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{formatDate(order.created_at)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5" title="Ver detalhes"><Eye size={18} /></button>

                                                {/* Actions based on payment_status/status */}
                                                {(order.payment_status === 'proof_submitted' || order.payment_status === 'pending') && order.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => updateStatus(order.id, { payment_status: 'confirmed', status: 'confirmed' })} className="p-2 rounded-xl bg-green-50 text-green-500 hover:bg-green-100 transition-colors" title="Aprovar"><CheckCircle size={18} /></button>
                                                        <button onClick={() => updateStatus(order.id, { payment_status: 'rejected', status: 'cancelled' })} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Recusar"><XCircle size={18} /></button>
                                                    </>
                                                )}

                                                {order.status === 'confirmed' && (
                                                    <button onClick={() => updateStatus(order.id, { status: 'shipped' })} className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors" title="Marcar Enviado"><Truck size={18} /></button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button onClick={() => updateStatus(order.id, { status: 'delivered' })} className="p-2 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors" title="Marcar Entregue"><CheckCircle size={18} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-secondary">Detalhes da Encomenda</h3>
                                <p className="text-sm font-mono text-primary mt-1">{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2.5 rounded-2xl hover:bg-gray-100 transition-colors text-gray-400"><X size={20} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cliente & Entrega</h4>
                                    <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Eye size={16} /></div>
                                            <div>
                                                <p className="text-sm font-bold text-secondary">{selectedOrder.userName}</p>
                                                <p className="text-[11px] text-gray-400">{selectedOrder.userEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><MapPin size={16} /></div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-400 uppercase">Morada de Entrega</p>
                                                <p className="text-sm text-secondary">{selectedOrder.delivery_address || 'Não especificada'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Produtos</h4>
                                    <div className="space-y-2">
                                        {selectedOrder.items?.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-border rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    {item.productImage ? <img src={item.productImage} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Package size={16} className="text-gray-300" /></div>}
                                                    <div>
                                                        <p className="text-sm font-bold text-secondary">{item.productName}</p>
                                                        <p className="text-xs text-gray-400">{item.quantity}x {formatCurrency(item.price)}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-bold text-primary">{formatCurrency(item.quantity * item.price)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between mt-4 p-4 bg-primary/5 rounded-2xl">
                                        <span className="text-sm font-bold text-secondary">Total da Encomenda</span>
                                        <span className="text-lg font-black text-primary">{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Comprovativo de Pagamento</h4>
                                {selectedOrder.payment_proof ? (
                                    <div className="space-y-4">
                                        <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden border border-border shadow-inner relative group">
                                            {selectedOrder.payment_proof.includes('application/pdf') ? (
                                                <iframe
                                                    src={selectedOrder.payment_proof}
                                                    className="w-full h-full border-none"
                                                    title="Comprovativo PDF"
                                                />
                                            ) : (
                                                <img
                                                    src={selectedOrder.payment_proof}
                                                    alt="Comprovativo"
                                                    className="w-full h-full object-contain"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => {
                                                        const win = window.open();
                                                        win?.document.write(`<iframe src="${selectedOrder.payment_proof}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                                    }}
                                                    className="bg-white text-secondary px-4 py-2 rounded-xl text-sm font-bold shadow-xl flex items-center gap-2"
                                                >
                                                    <Eye size={16} /> Visualizar em tela cheia
                                                </button>
                                            </div>
                                        </div>
                                        {selectedOrder.status === 'pending' && (
                                            <div className="flex gap-3">
                                                <button onClick={() => updateStatus(selectedOrder.id, { payment_status: 'confirmed', status: 'confirmed' })} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">Aprovar Encomenda</button>
                                                <button onClick={() => updateStatus(selectedOrder.id, { payment_status: 'rejected', status: 'cancelled' })} className="flex-1 py-3 bg-red-50 text-red-500 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-all">Recusar Encomenda</button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-[4/5] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                        <DollarSign size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm font-bold">Nenhum comprovativo enviado</p>
                                        <p className="text-xs mt-1">O cliente ainda não anexou o pagamento.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
