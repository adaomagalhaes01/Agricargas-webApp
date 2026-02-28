import { Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="p-4 sm:p-6 animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-secondary">Definições</h2>
                <p className="text-sm text-gray-400">Configurações da conta e do sistema</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Profile */}
                <div className="bg-white rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-bold text-secondary mb-6">Perfil</h3>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <p className="font-semibold text-secondary">{user?.name || 'Admin'}</p>
                            <p className="text-sm text-gray-400">{user?.email || 'admin@agriroute.ao'}</p>
                        </div>
                    </div>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Nome</label>
                            <input type="text" defaultValue={user?.name || ''} className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                            <input type="email" defaultValue={user?.email || ''} className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all">
                            <Save size={16} /> Guardar
                        </button>
                    </form>
                </div>

                {/* Security */}
                <div className="bg-white rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-bold text-secondary mb-6">Segurança</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Senha Actual</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Nova Senha</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirmar Nova Senha</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-secondary hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all">
                            <Save size={16} /> Alterar Senha
                        </button>
                    </form>
                </div>

                {/* App Config */}
                <div className="bg-white rounded-2xl border border-border p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-secondary mb-6">Configurações do App</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Nome do App</label>
                            <input type="text" defaultValue="AgriRoute" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Moeda</label>
                            <input type="text" defaultValue="Kz (Kwanza)" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Taxa de Entrega (Kz)</label>
                            <input type="number" defaultValue="5000" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1.5">Encomenda Mínima (Kz)</label>
                            <input type="number" defaultValue="10000" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50" />
                        </div>
                    </div>
                    <button type="button" className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all mt-6">
                        <Save size={16} /> Guardar Configurações
                    </button>
                </div>
            </div>
        </div>
    );
}
