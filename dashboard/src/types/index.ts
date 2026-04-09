export interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
    role?: 'admin' | 'user';
    createdAt?: string;
    status?: 'active' | 'inactive' | 'blocked';
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    category_id?: string;
    image?: string;
    description?: string;
    stock: number;
    rating: number;
    reviews: number;
    badge?: string | null;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    bg: string;
    productCount: number;
}

export interface Order {
    id: string;
    userId: string;
    userName: string;
    products: { productId: string; name: string; quantity: number; price: number }[];
    total: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'proof_submitted' | 'confirmed' | 'rejected';
    paymentProof?: string;
    createdAt: string;
    deliveryAddress?: string;
}

export interface PaymentProof {
    id: string;
    orderId: string;
    userId: string;
    userName: string;
    amount: number;
    proofImage: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
}

export interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingPayments: number;
    activeUsers: number;
    totalVehicles?: number;
    recentOrders: Order[];
    revenueData: { month: string; value: number }[];
    categoryDistribution: { name: string; value: number }[];
}
export interface Vehicle {
    id: string;
    plate: string;
    model: string;
    driver: string;
    type: 'moto' | 'carro' | 'camião';
    status: 'available' | 'in_delivery' | 'maintenance';
    registeredAt: string;
}
