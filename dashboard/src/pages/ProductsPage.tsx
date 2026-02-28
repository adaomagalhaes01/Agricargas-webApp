import { useState } from 'react';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import { mockProducts, mockCategories, formatCurrency } from '../data/mockData';

export default function ProductsPage() {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: '', category: '', stock: '', description: '' });

    const filtered = mockProducts
        .filter(p => catFilter === 'all' || p.category === catFilter)
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-4 sm:p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-secondary">Produtos</h2>
                    <p className="text-sm text-gray-400">{mockProducts.length} produtos cadastrados</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} /> Novo Produto
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-border flex-1">
                    <Search size={16} className="text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar produto..." className="bg-transparent border-none outline-none text-sm flex-1 text-secondary placeholder:text-gray-400" />
                </div>
                <select
                    value={catFilter}
                    onChange={e => setCatFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white rounded-xl text-sm border border-border text-secondary focus:outline-none focus:border-primary/50"
                >
                    <option value="all">Todas Categorias</option>
                    {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl border border-border overflow-hidden card-hover">
                        <div className="h-36 bg-gradient-to-br from-primary-50 to-emerald-50 flex items-center justify-center relative">
                            <span className="text-5xl">🥬</span>
                            {product.badge && (
                                <span className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold text-white ${product.badge.includes('OFF') ? 'bg-red-500' : 'bg-primary'}`}>{product.badge}</span>
                            )}
                            <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${product.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-secondary text-sm">{product.name}</h3>
                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">{product.category}</span>
                            </div>
                            <p className="text-lg font-bold gradient-text mb-2">{formatCurrency(product.price)}</p>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>Stock: <strong className={product.stock === 0 ? 'text-red-500' : 'text-secondary'}>{product.stock}</strong></span>
                                <span>⭐ {product.rating} ({product.reviews})</span>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                                <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                    <Edit size={13} /> Editar
                                </button>
                                <button className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-secondary">Novo Produto</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X size={20} /></button>
                        </div>
                        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setShowModal(false); }}>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Nome do Produto</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Tomates Frescos" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Preço (Kz)</label>
                                    <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="10000" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Stock</label>
                                    <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} placeholder="100" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Categoria</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50">
                                    <option value="">Selecionar...</option>
                                    {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Descrição</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Descrição do produto..." rows={3} className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 resize-none" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20">
                                Adicionar Produto
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
