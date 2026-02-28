import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Camera, Save, Lock, Bell, Smartphone } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        alert('Perfil atualizado com sucesso!');
    };

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fadeIn">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-secondary">Perfil de Usuário</h2>
                <p className="text-gray-400">Gerencie suas informações pessoais e segurança</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-border p-8 text-center shadow-sm">
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-white shadow-lg">
                                {name.charAt(0) || 'A'}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors border-2 border-white">
                                <Camera size={16} />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-secondary">{name}</h3>
                        <p className="text-sm text-gray-400 mb-6">Administrador do Sistema</p>

                        <div className="space-y-3 pt-6 border-t border-border">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Shield size={16} />
                                </div>
                                <span className="font-medium text-secondary">Admin Level</span>
                                <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Super</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <Smartphone size={16} />
                                </div>
                                <span className="font-medium text-secondary">Status</span>
                                <span className="ml-auto bg-green-50 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Activo</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                        <h4 className="font-bold text-secondary mb-4 flex items-center gap-2">
                            <Bell size={18} className="text-primary" />
                            Notificações
                        </h4>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-gray-600">Alertas de segurança</span>
                                <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" defaultChecked />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-gray-600">Relatórios semanais</span>
                                <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" defaultChecked />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Form */}
                    <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                            <h3 className="font-bold text-secondary">Informações Pessoais</h3>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                        <User size={14} /> Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-secondary focus:outline-none focus:border-primary/50 transition-all text-sm"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                        <Mail size={14} /> Endereço de Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-secondary focus:outline-none focus:border-primary/50 transition-all text-sm"
                                        placeholder="admin@agriroute.ao"
                                    />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-border bg-gray-50/50">
                            <h3 className="font-bold text-secondary">Segurança</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                    <Lock size={14} /> Senha Atual
                                </label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-secondary focus:outline-none focus:border-primary/50 transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-600">Nova Senha</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-secondary focus:outline-none focus:border-primary/50 transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-600">Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-border rounded-xl text-secondary focus:outline-none focus:border-primary/50 transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button className="px-6 py-2.5 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-all flex items-center gap-2">
                                    <Shield size={18} />
                                    Actualizar Senha
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
