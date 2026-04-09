import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Loader2, Package } from 'lucide-react';
import { formatCurrency } from '../data/mockData';
import { Product, Category } from '../types';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', price: '', category_id: '', stock: '', description: '', badge: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories')
            ]);
            const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
            setProducts(pData);
            setCategories(cData);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingId
                ? `/api/products/${editingId}`
                : '/api/products';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    stock: Number(formData.stock),
                    is_active: 1
                })
            });
            if (res.ok) {
                setShowModal(false);
                setEditingId(null);
                setFormData({ name: '', price: '', category_id: '', stock: '', description: '', badge: '' });
                fetchData();
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            price: String(product.price),
            category_id: product.category_id || '',
            stock: String(product.stock),
            description: product.description || '',
            badge: product.badge || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este produto?')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Erro ao deletar:', error);
        }
    };

    const filtered = (products || [])
        .filter(p => catFilter === 'all' || p.category === catFilter)
        .filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-4 sm:p-6 animate-fadeIn relative min-h-screen">
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-secondary">Produtos</h2>
                    <p className="text-sm text-gray-400">{filtered.length} produtos encontrados</p>
                </div>
                <button
                    onClick={() => { setEditingId(null); setFormData({ name: '', price: '', category_id: '', stock: '', description: '', badge: '' }); setShowModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={18} /> Novo Produto
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-border flex-1 shadow-sm focus-within:border-primary/50 transition-all">
                    <Search size={16} className="text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar produto..." className="bg-transparent border-none outline-none text-sm flex-1 text-secondary placeholder:text-gray-400" />
                </div>
                <select
                    value={catFilter}
                    onChange={e => setCatFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white rounded-xl text-sm border border-border text-secondary focus:outline-none focus:border-primary/50 shadow-sm"
                >
                    <option value="all">Todas Categorias</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(product => {
                    return (
                        <div key={product.id} className="bg-white rounded-2xl border border-border overflow-hidden card-hover group">
                            <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                                        {(product as any).category_icon || '📦'}
                                    </span>
                                )}
                                {product.badge && (
                                    <span className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider ${product.badge.includes('OFF') ? 'bg-red-500' : 'bg-primary shadow-lg shadow-primary/20'}`}>{product.badge}</span>
                                )}
                                <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ring-4 ring-white ${product.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-secondary text-sm truncate flex-1 pr-2">{product.name}</h3>
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md self-start">{product.category}</span>
                                </div>
                                <p className="text-lg font-bold text-primary mb-2">{formatCurrency(product.price)}</p>
                                <div className="flex items-center justify-between text-[11px] text-gray-400">
                                    <span>Stock: <strong className={product.stock === 0 ? 'text-red-500 font-bold' : 'text-secondary'}>{product.stock}</strong></span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-400 text-xs">★</span>
                                        <span className="font-medium">{product.rating || '0.0'}</span>
                                        <span className="text-[9px]">({product.reviews || 0})</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                    <button onClick={() => handleEdit(product)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all">
                                        <Edit size={13} /> Editar
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 active:scale-95 transition-all">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && !loading && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Package className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-400 font-medium">Nenhum produto encontrado</p>
                    <button onClick={() => { setSearch(''); setCatFilter('all'); }} className="text-primary text-sm font-bold mt-2 hover:underline">Limpar filtros</button>
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-[32px] w-full max-w-lg p-8 animate-fadeIn shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-secondary">{editingId ? 'Editar' : 'Novo'} Produto</h3>
                                <p className="text-sm text-gray-400">{editingId ? 'Atualize os dados do item' : 'Cadastre os detalhes do item'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2.5 rounded-2xl hover:bg-gray-100 transition-colors text-gray-400"><X size={20} /></button>
                        </div>
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-2">Nome do Produto</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Tomates Frescos" className="w-full px-5 py-3.5 bg-gray-50 border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-secondary mb-2">Preço (Kz)</label>
                                    <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="10000" className="w-full px-5 py-3.5 bg-gray-50 border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-secondary mb-2">Stock</label>
                                    <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} placeholder="100" className="w-full px-5 py-3.5 bg-gray-50 border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-2">Categoria</label>
                                <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50 transition-all cursor-pointer">
                                    <option value="">Selecionar...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-2">Badge / Etiqueta (Opcional)</label>
                                <input type="text" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} placeholder="Ex: Novo, 10% OFF" className="w-full px-5 py-3.5 bg-gray-50 border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-secondary mb-2">Descrição</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Descrição detalhada do produto..." rows={3} className="w-full px-5 py-3.5 bg-gray-50 border border-border rounded-2xl text-sm focus:outline-none focus:border-primary/50 resize-none transition-all" />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                            >
                                {saving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                                {saving ? 'A Salvar...' : (editingId ? 'Salvar Alterações' : 'Adicionar Produto')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
