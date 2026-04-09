import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    bg: string;
    productCount?: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', icon: '', color: '#22C55E' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingId
                ? `/api/categories/${editingId}`
                : '/api/categories';
            const method = editingId ? 'PUT' : 'POST';

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            setShowModal(false);
            setEditingId(null);
            setFormData({ name: '', icon: '', color: '#22C55E' });
            fetchCategories();
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, icon: cat.icon, color: cat.color });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover esta categoria?')) return;
        try {
            await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            fetchCategories();
        } catch (error) {
            console.error('Erro ao remover categoria:', error);
        }
    };

    return (
        <div className="p-4 sm:p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-secondary">Categorias</h2>
                    <p className="text-sm text-gray-400">{categories.length} categorias cadastradas</p>
                </div>
                <button onClick={() => { setEditingId(null); setFormData({ name: '', icon: '', color: '#22C55E' }); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20">
                    <Plus size={18} /> Nova Categoria
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-white rounded-2xl border border-border p-6 card-hover text-center">
                            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{ backgroundColor: cat.bg || '#F0F0F0' }}>
                                {cat.icon}
                            </div>
                            <h3 className="text-lg font-bold text-secondary mb-1">{cat.name}</h3>
                            <div className="flex gap-2 justify-center mt-4">
                                <button onClick={() => handleEdit(cat)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                    <Edit size={13} /> Editar
                                </button>
                                <button onClick={() => handleDelete(cat.id)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                    <Trash2 size={13} /> Remover
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-secondary">{editingId ? 'Editar' : 'Nova'} Categoria</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Nome</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Frutas Tropicais" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Ícone (emoji ou nome do Ionicons)</label>
                                <input required type="text" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="🍎 ou leaf-outline" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1.5">Cor</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                                    <span className="text-sm text-gray-500">{formData.color}</span>
                                </div>
                            </div>
                            <button disabled={saving} type="submit" className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                                {editingId ? 'Salvar Alterações' : 'Criar Categoria'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
