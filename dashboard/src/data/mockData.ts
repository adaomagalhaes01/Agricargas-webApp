import { DashboardStats, Product, Category, Order, PaymentProof, User } from '../types';

// Mock data for demo purposes. Replace with real API calls.
export const mockUsers: User[] = [
    { id: '1', name: 'Maria Santos', email: 'maria@email.com', role: 'user', status: 'active', createdAt: '2026-01-15' },
    { id: '2', name: 'João Domingos', email: 'joao@email.com', role: 'user', status: 'active', createdAt: '2026-01-20' },
    { id: '3', name: 'Ana Francisca', email: 'ana@email.com', role: 'user', status: 'active', createdAt: '2026-02-01' },
    { id: '4', name: 'Pedro Manuel', email: 'pedro@email.com', role: 'user', status: 'inactive', createdAt: '2026-02-05' },
    { id: '5', name: 'Luiza Mendes', email: 'luiza@email.com', role: 'user', status: 'active', createdAt: '2026-02-10' },
    { id: '6', name: 'Carlos Silva', email: 'carlos@email.com', role: 'admin', status: 'active', createdAt: '2026-01-01' },
    { id: '7', name: 'Teresa Gomes', email: 'teresa@email.com', role: 'user', status: 'blocked', createdAt: '2026-02-12' },
    { id: '8', name: 'Manuel Joaquim', email: 'manuel@email.com', role: 'user', status: 'active', createdAt: '2026-02-18' },
];

export const mockCategories: Category[] = [
    { id: '1', name: 'Hortaliças', icon: '🥬', color: '#22C55E', bg: '#D4F4E7', productCount: 12 },
    { id: '2', name: 'Frutas', icon: '🍎', color: '#F59E0B', bg: '#FFF8E1', productCount: 8 },
    { id: '3', name: 'Cereais', icon: '🌾', color: '#8B5CF6', bg: '#EDE9FE', productCount: 5 },
    { id: '4', name: 'Legumes', icon: '🥕', color: '#3B82F6', bg: '#DBEAFE', productCount: 10 },
];

export const mockProducts: Product[] = [
    { id: '1', name: 'Tomates', price: 10000, category: 'Hortaliças', stock: 150, rating: 4.5, reviews: 12, badge: null, status: 'active', createdAt: '2026-01-10' },
    { id: '2', name: 'Cenouras', price: 30000, category: 'Hortaliças', stock: 80, rating: 4.8, reviews: 8, badge: 'Mais Vendido', status: 'active', createdAt: '2026-01-12' },
    { id: '3', name: 'Tomates Cherry', price: 15000, category: 'Hortaliças', stock: 60, rating: 4.2, reviews: 5, badge: '10% OFF', status: 'active', createdAt: '2026-01-15' },
    { id: '4', name: 'Cenouras Baby', price: 25000, category: 'Legumes', stock: 45, rating: 5.0, reviews: 15, badge: 'Mais Vendido', status: 'active', createdAt: '2026-01-18' },
    { id: '5', name: 'Bananas', price: 8000, category: 'Frutas', stock: 200, rating: 4.6, reviews: 20, badge: null, status: 'active', createdAt: '2026-01-20' },
    { id: '6', name: 'Milho', price: 12000, category: 'Cereais', stock: 0, rating: 4.0, reviews: 3, badge: null, status: 'inactive', createdAt: '2026-01-22' },
    { id: '7', name: 'Pimentão Verde', price: 18000, category: 'Hortaliças', stock: 35, rating: 4.3, reviews: 7, badge: 'Novo', status: 'active', createdAt: '2026-02-01' },
    { id: '8', name: 'Mangas', price: 20000, category: 'Frutas', stock: 90, rating: 4.9, reviews: 25, badge: 'Mais Vendido', status: 'active', createdAt: '2026-02-05' },
];

export const mockOrders: Order[] = [
    { id: 'ORD001', userId: '1', userName: 'Maria Santos', products: [{ productId: '1', name: 'Tomates', quantity: 5, price: 10000 }, { productId: '2', name: 'Cenouras', quantity: 2, price: 30000 }], total: 110000, status: 'delivered', paymentStatus: 'confirmed', createdAt: '2026-02-20', deliveryAddress: 'Luanda, Morro Bento' },
    { id: 'ORD002', userId: '2', userName: 'João Domingos', products: [{ productId: '5', name: 'Bananas', quantity: 10, price: 8000 }], total: 80000, status: 'shipped', paymentStatus: 'confirmed', createdAt: '2026-02-22', deliveryAddress: 'Luanda, Talatona' },
    { id: 'ORD003', userId: '3', userName: 'Ana Francisca', products: [{ productId: '8', name: 'Mangas', quantity: 3, price: 20000 }], total: 60000, status: 'pending', paymentStatus: 'proof_submitted', paymentProof: '/images/proof-example.jpg', createdAt: '2026-02-24', deliveryAddress: 'Benguela, Centro' },
    { id: 'ORD004', userId: '5', userName: 'Luiza Mendes', products: [{ productId: '4', name: 'Cenouras Baby', quantity: 4, price: 25000 }], total: 100000, status: 'confirmed', paymentStatus: 'proof_submitted', paymentProof: '/images/proof-example.jpg', createdAt: '2026-02-25', deliveryAddress: 'Luanda, Kilamba' },
    { id: 'ORD005', userId: '8', userName: 'Manuel Joaquim', products: [{ productId: '7', name: 'Pimentão Verde', quantity: 6, price: 18000 }], total: 108000, status: 'pending', paymentStatus: 'pending', createdAt: '2026-02-26', deliveryAddress: 'Luanda, Viana' },
];

export const mockPaymentProofs: PaymentProof[] = [
    { id: 'PAY001', orderId: 'ORD003', userId: '3', userName: 'Ana Francisca', amount: 60000, proofImage: '/images/proof-example.jpg', status: 'pending', submittedAt: '2026-02-24T10:30:00' },
    { id: 'PAY002', orderId: 'ORD004', userId: '5', userName: 'Luiza Mendes', amount: 100000, proofImage: '/images/proof-example.jpg', status: 'pending', submittedAt: '2026-02-25T14:15:00' },
    { id: 'PAY003', orderId: 'ORD001', userId: '1', userName: 'Maria Santos', amount: 110000, proofImage: '/images/proof-example.jpg', status: 'approved', submittedAt: '2026-02-20T09:00:00', reviewedAt: '2026-02-20T11:00:00' },
];

export const mockStats: DashboardStats = {
    totalUsers: 523,
    totalProducts: 45,
    totalOrders: 1284,
    totalRevenue: 15750000,
    pendingPayments: 2,
    activeUsers: 489,
    recentOrders: mockOrders.slice(0, 5),
    revenueData: [
        { month: 'Set', value: 8500000 },
        { month: 'Out', value: 9200000 },
        { month: 'Nov', value: 11000000 },
        { month: 'Dez', value: 13500000 },
        { month: 'Jan', value: 14200000 },
        { month: 'Fev', value: 15750000 },
    ],
    categoryDistribution: [
        { name: 'Hortaliças', value: 35 },
        { name: 'Frutas', value: 25 },
        { name: 'Legumes', value: 22 },
        { name: 'Cereais', value: 18 },
    ],
};

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'decimal', minimumFractionDigits: 0 }).format(value) + ' Kz';
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
