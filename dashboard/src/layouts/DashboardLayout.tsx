import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    '/': { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
    '/users': { title: 'Utilizadores', subtitle: 'Gestão de utilizadores' },
    '/products': { title: 'Produtos', subtitle: 'Gestão de produtos' },
    '/categories': { title: 'Categorias', subtitle: 'Gestão de categorias' },
    '/orders': { title: 'Encomendas', subtitle: 'Gestão de encomendas' },
    '/payments': { title: 'Pagamentos', subtitle: 'Comprovantes de pagamento' },
    '/stats': { title: 'Estatísticas', subtitle: 'Análise de desempenho' },
    '/profile': { title: 'O Meu Perfil', subtitle: 'Gestão de conta' },
    '/carrinhos': { title: 'Carrinhos e Frota', subtitle: 'Gestão de veículos da plataforma' },
};

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const { title, subtitle } = pageTitles[location.pathname] || { title: 'Dashboard', subtitle: '' };

    return (
        <div className="min-h-screen bg-bg">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main content area */}
            <div className={`sidebar-transition ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'}`}>
                <Header
                    title={title}
                    subtitle={subtitle}
                    onMobileMenuClick={() => setMobileOpen(true)}
                />
                <main className="min-h-[calc(100vh-64px)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
