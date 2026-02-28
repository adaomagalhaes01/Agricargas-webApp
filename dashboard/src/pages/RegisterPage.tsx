import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const { register, isAuthenticated, loading } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    if (isAuthenticated) return <Navigate to="/" replace />;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        try {
            await register(name, email, password);
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        }
    };

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 w-full max-w-md animate-fadeIn">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img src="/images/agrilogo.png" alt="Logo" className="h-12 w-auto" />
                        <span className="text-3xl font-bold text-secondary">AgriRoute</span>
                    </div>
                    <p className="text-gray-400 text-sm">Painel Administrativo</p>
                </div>

                <div className="bg-white border border-border rounded-3xl p-8 shadow-xl shadow-gray-200/50">
                    <h2 className="text-2xl font-bold text-secondary mb-1">Criar Conta</h2>
                    <p className="text-gray-400 text-sm mb-8">Preencha os dados para criar a sua conta</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2">Nome Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Seu nome"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@agriroute.ao"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all text-sm pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2">Confirmar Senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-border rounded-xl text-secondary placeholder:text-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/25 mt-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                            {loading ? 'A criar...' : 'Criar Conta'}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        Já tem conta?{' '}
                        <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
