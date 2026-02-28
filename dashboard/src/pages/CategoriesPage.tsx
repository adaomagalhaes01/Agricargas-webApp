import { useState } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { mockCategories } from '../data/mockData';

export default function CategoriesPage() {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', icon: '', color: '#22C55E' });

    return (
        <div className="p-4 sm:p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-secondary">Categorias</h2>
                    <p className="text-sm text-gray-400">{mockCategories.length} categorias</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20">
                    <Plus size={18} /> Nova Categoria
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockCategories.map(cat => (
                    <div key={cat.id} className="bg-white rounded-2xl border border-border p-6 card-hover text-center">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{ backgroundColor: cat.bg }}>
                            {cat.icon}
                        </div>
                        <h3 className="text-lg font-bold text-secondary mb-1">{cat.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{cat.productCount} produtos</p>
                        <div className="flex gap-2 justify-center">
                            <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Edit size={13} /> Editar
                            </button>
                            <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                <Trash2 size={13} /> Remover
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-secondary">Nova Categoria</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setShowModal(false); }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Nome</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Frutas Tropicais" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Ícone (emoji)</label>
                                <input type="text" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="🍎" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Cor</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                                    <span className="text-sm text-gray-500">{formData.color}</span>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20">
                                Criar Categoria
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
