import { Bell, Search, User, LogOut, ChevronDown, AlertCircle } from 'lucide-react';
import { MobileMenuButton } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    title: string;
    subtitle?: string;
    onMobileMenuClick: () => void;
}

export default function Header({ title, subtitle, onMobileMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    return (
        <>
            <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <MobileMenuButton onClick={onMobileMenuClick} />
                    <div>
                        <h1 className="text-lg font-bold text-secondary">{title}</h1>
                        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search - desktop only */}
                    <div className="hidden md:flex items-center gap-2 bg-bg rounded-xl px-3 py-2 border border-border">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Pesquisar..."
                            className="bg-transparent border-none outline-none text-sm text-secondary w-48 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <Bell size={20} className="text-gray-500" />
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
                    </button>

                    <div className="h-6 w-[1px] bg-border mx-1" />

                    {/* User Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-all duration-200"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-secondary">{user?.name || 'Administrador'}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Admin</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isUserMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsUserMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-xl py-2 z-20 animate-fadeIn origin-top-right">
                                    <div className="px-4 py-3 border-b border-border/50 mb-1">
                                        <p className="text-sm font-bold text-secondary">{user?.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            navigate('/profile');
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                                    >
                                        <User size={18} />
                                        <span>Perfil de Usuário</span>
                                    </button>
                                    <div className="h-px bg-border/50 my-1" />
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            setShowLogoutModal(true);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span>Sair</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-secondary/40 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
                    <div className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-fadeIn">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <AlertCircle className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-secondary text-center mb-2">Terminar Sessão</h3>
                        <p className="text-gray-500 text-center mb-8">Tem a certeza que deseja sair do sistema?</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="py-3 px-4 rounded-xl border border-border text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLogout}
                                className="py-3 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                            >
                                Sim, Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
