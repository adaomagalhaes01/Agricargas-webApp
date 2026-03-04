import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Package, FolderTree, ShoppingCart, Truck,
    CreditCard, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
}

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Utilizadores', icon: Users },
    { path: '/carrinhos', label: 'Carrinhos', icon: Truck },
    { path: '/products', label: 'Produtos', icon: Package },
    { path: '/categories', label: 'Categorias', icon: FolderTree },
    { path: '/orders', label: 'Encomendas', icon: ShoppingCart },
    { path: '/payments', label: 'Pagamentos', icon: CreditCard },
    { path: '/stats', label: 'Estatísticas', icon: BarChart3 },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-sidebar z-50 sidebar-transition flex flex-col
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className={`flex items-center h-16 px-4 border-b border-border ${collapsed ? 'justify-center' : 'gap-3'}`}>
                    <img src="/images/agrilogo.png" alt="Logo" className="h-8 w-8 flex-shrink-0" />
                    {!collapsed && (
                        <span className="text-secondary text-lg font-bold whitespace-nowrap">AgriRoute</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                   ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                                    } ${collapsed ? 'justify-center' : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon size={20} className="flex-shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User info - REMOVED as requested */}
                <div className="p-3 border-t border-border" />

                {/* Collapse toggle - desktop only */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-white items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>
        </>
    );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
            <Menu size={22} className="text-gray-600" />
        </button>
    );
}
