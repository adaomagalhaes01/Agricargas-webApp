import { useState } from 'react';
import { Search, Plus, Truck, Bike, Car, MoreVertical, MapPin, CheckCircle2, Clock, AlertTriangle, X, Save } from 'lucide-react';
import { mockVehicles, formatDate } from '../data/mockData';

const statusConfig: Record<string, { label: string, color: string, bg: string, icon: any }> = {
    available: { label: 'Disponível', color: '#16A34A', bg: '#D4F4E7', icon: CheckCircle2 },
    in_delivery: { label: 'Em Entrega', color: '#2563EB', bg: '#DBEAFE', icon: Clock },
    maintenance: { label: 'Manutenção', color: '#DC2626', bg: '#FEE2E2', icon: AlertTriangle },
};

const typeIcons: Record<string, any> = {
    moto: Bike,
    carro: Car,
    camião: Truck,
};

export default function CarrinhosPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'available' | 'in_delivery' | 'maintenance'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        plate: '',
        model: '',
        driver: '',
        type: 'carro' as 'moto' | 'carro' | 'camião',
        status: 'available' as 'available' | 'in_delivery' | 'maintenance'
    });

    const resetForm = () => {
        setFormData({
            plate: '',
            model: '',
            driver: '',
            type: 'carro',
            status: 'available'
        });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would normally call an API
        console.log('Registering vehicle:', formData);
        alert('Veículo registado com sucesso!');
        setIsModalOpen(false);
        resetForm();
    };

    const filtered = mockVehicles
        .filter(v => filter === 'all' || v.status === filter)
        .filter(v =>
            v.plate.toLowerCase().includes(search.toLowerCase()) ||
            v.model.toLowerCase().includes(search.toLowerCase()) ||
            v.driver.toLowerCase().includes(search.toLowerCase())
        );

    return (
        <div className="p-4 sm:p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-secondary">Carrinhos e Veículos</h2>
                    <p className="text-sm text-gray-400">Gestão da frota de entregas da plataforma</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary/25"
                >
                    <Plus size={18} />
                    Registar Veículo
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl border border-border">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total Frota</p>
                    <p className="text-2xl font-bold text-secondary">{mockVehicles.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-border">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Disponíveis</p>
                    <p className="text-2xl font-bold text-green-600">{mockVehicles.filter(v => v.status === 'available').length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-border">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Em Trânsito</p>
                    <p className="text-2xl font-bold text-blue-600">{mockVehicles.filter(v => v.status === 'in_delivery').length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-border">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Manutenção</p>
                    <p className="text-2xl font-bold text-red-600">{mockVehicles.filter(v => v.status === 'maintenance').length}</p>
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
                        placeholder="Pesquisar por matrícula, modelo ou motorista..."
                        className="bg-transparent border-none outline-none text-sm flex-1 text-secondary placeholder:text-gray-400"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {(['all', 'available', 'in_delivery', 'maintenance'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-primary text-white' : 'bg-white text-gray-500 border border-border hover:bg-gray-50'}`}
                        >
                            {s === 'all' ? 'Todos' : statusConfig[s].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vehicle Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(vehicle => {
                    const status = statusConfig[vehicle.status];
                    const Icon = typeIcons[vehicle.type];
                    const StatusIcon = status.icon;

                    return (
                        <div key={vehicle.id} className="bg-white rounded-3xl border border-border p-5 hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-primary/10 transition-colors">
                                    <Icon size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-secondary text-lg">{vehicle.plate}</h3>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{vehicle.type}</span>
                                </div>
                                <p className="text-sm text-gray-400">{vehicle.model}</p>
                            </div>

                            <div className="space-y-3 mb-5">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <MapPin size={14} />
                                    </div>
                                    <span className="font-medium text-secondary">{vehicle.driver}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400" style={{ color: status.color, backgroundColor: status.bg + '50' }}>
                                        <StatusIcon size={14} />
                                    </div>
                                    <span className="font-semibold" style={{ color: status.color }}>{status.label}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] text-gray-400 font-medium">
                                <span>REGISTADO EM {formatDate(vehicle.registeredAt)}</span>
                                <button className="text-primary hover:underline font-bold">VER DETALHES</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Truck size={32} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">Nenhum veículo encontrado para os filtros aplicados.</p>
                </div>
            )}
            {/* Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fadeIn overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-secondary">Registar Novo Veículo</h3>
                                <p className="text-xs text-gray-400">Preencha os dados técnicos do transporte</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleRegister} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Matrícula</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="EX: LD-00-00-AA"
                                        value={formData.plate}
                                        onChange={e => setFormData({ ...formData, plate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-secondary focus:outline-none focus:border-primary transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Veículo</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-secondary focus:outline-none focus:border-primary transition-all text-sm"
                                    >
                                        <option value="carro">Carro (Carrinho)</option>
                                        <option value="moto">Moto</option>
                                        <option value="camião">Camião</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Modelo / Marca</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="EX: Toyota Hilux 2024"
                                    value={formData.model}
                                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-secondary focus:outline-none focus:border-primary transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Motorista Responsável</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Nome completo do motorista"
                                    value={formData.driver}
                                    onChange={e => setFormData({ ...formData, driver: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-secondary focus:outline-none focus:border-primary transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Status Inicial</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['available', 'in_delivery', 'maintenance'] as const).map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: s })}
                                            className={`py-2 px-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${formData.status === s ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border text-gray-400 hover:bg-gray-50'}`}
                                        >
                                            {statusConfig[s].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl border border-border text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Save size={18} />
                                    Confirmar Registo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
