import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { mockPaymentProofs, formatCurrency, formatDate } from '../data/mockData';

const statusConfig: Record<string, { badge: string; label: string; icon: typeof Clock }> = {
    pending: { badge: 'badge-warning', label: 'Pendente', icon: Clock },
    approved: { badge: 'badge-success', label: 'Aprovado', icon: CheckCircle },
    rejected: { badge: 'badge-danger', label: 'Rejeitado', icon: XCircle },
};

export default function PaymentsPage() {
    return (
        <div className="p-4 sm:p-6 animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-secondary">Comprovantes de Pagamento</h2>
                <p className="text-sm text-gray-400">Revise e aprove os comprovantes enviados pelos clientes</p>
            </div>

            {/* Pending highlights */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {['pending', 'approved', 'rejected'].map(status => {
                    const count = mockPaymentProofs.filter(p => p.status === status).length;
                    const config = statusConfig[status];
                    return (
                        <div key={status} className="bg-white rounded-2xl border border-border p-5 card-hover">
                            <div className="flex items-center gap-3 mb-2">
                                <config.icon size={20} className={status === 'pending' ? 'text-amber-500' : status === 'approved' ? 'text-green-500' : 'text-red-500'} />
                                <span className="text-sm font-medium text-gray-500">{config.label}</span>
                            </div>
                            <p className="text-3xl font-bold text-secondary">{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Payment Proofs List */}
            <div className="space-y-4">
                {mockPaymentProofs.map(proof => {
                    const config = statusConfig[proof.status];
                    return (
                        <div key={proof.id} className="bg-white rounded-2xl border border-border p-5 card-hover">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                        <Eye size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-secondary text-sm">Encomenda #{proof.orderId}</h4>
                                            <span className={`${config.badge} px-2.5 py-1 rounded-lg text-xs font-semibold`}>{config.label}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">Cliente: <strong>{proof.userName}</strong></p>
                                        <p className="text-sm text-gray-400">Submetido: {formatDate(proof.submittedAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="text-xl font-bold gradient-text">{formatCurrency(proof.amount)}</p>
                                    {proof.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors">
                                                <CheckCircle size={14} /> Aprovar
                                            </button>
                                            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                                                <XCircle size={14} /> Rejeitar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
