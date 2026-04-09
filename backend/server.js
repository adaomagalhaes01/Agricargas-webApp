const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateOTP, sendOTPEmail } = require('./mailer');

const db = require('./database');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    authMiddleware,
} = require('./auth');
const { validateRegistration, validateLogin } = require('./validators');

const { swaggerUi, specs } = require('./swagger-config');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Swagger Documentation ──────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


// ─── Helper: remove sensitive fields ────────────────────────
function sanitizeUser(user) {
    const { password, ...safe } = user;
    return safe;
}

// ─── Helper: save refresh token to DB ───────────────────────
function saveRefreshToken(userId, token) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(uuidv4(), userId, token, expiresAt);
}

// ─── Helper: cleanup expired refresh tokens ─────────────────
function cleanupExpiredTokens() {
    db.prepare(`DELETE FROM refresh_tokens WHERE expires_at < datetime('now')`).run();
}

// Run cleanup on startup
cleanupExpiredTokens();

// ═════════════════════════════════════════════════════════════
//  ROUTES
// ═════════════════════════════════════════════════════════════

// ─── Health Check ───────────────────────────────────────────
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Status do servidor
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Register ───────────────────────────────────────────────
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação
 *       409:
 *         description: Email já em uso
 */
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        const errors = validateRegistration(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join('. '), errors });
        }

        // Check if user already exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
        if (existingUser) {
            return res.status(409).json({ message: 'Este email já está em uso' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const userId = uuidv4();
        const now = new Date().toISOString();

        db.prepare(`
      INSERT INTO users (id, name, email, phone, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name.trim(), email.toLowerCase().trim(), phone || null, hashedPassword, now, now);

        // Get created user
        const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

        // Generate tokens
        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        // Save refresh token
        saveRefreshToken(userId, refreshToken);

        console.log(`✅ Novo usuário registrado: ${email}`);

        res.status(201).json({
            message: 'Conta criada com sucesso',
            token: accessToken,
            refreshToken,
            user: sanitizeUser(newUser),
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Login ──────────────────────────────────────────────────
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Autenticar usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        const errors = validateLogin(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join('. '), errors });
        }

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({ message: 'Conta desativada. Entre em contato com o suporte.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou senha incorretos' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token
        saveRefreshToken(user.id, refreshToken);

        console.log(`✅ Login bem-sucedido: ${email}`);

        res.json({
            message: 'Login realizado com sucesso',
            token: accessToken,
            refreshToken,
            user: sanitizeUser(user),
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Refresh Token ──────────────────────────────────────────
/**
 * @swagger
 * /api/refresh-token:
 *   post:
 *     summary: Renovar tokens de acesso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Novos tokens gerados
 *       401:
 *         description: Refresh token inválido
 */
app.post('/api/refresh-token', (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token não fornecido' });
        }

        // Verify the refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (err) {
            return res.status(401).json({ message: 'Refresh token inválido ou expirado' });
        }

        // Check if token exists in DB
        const storedToken = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?').get(refreshToken);
        if (!storedToken) {
            return res.status(401).json({ message: 'Refresh token não reconhecido' });
        }

        // Get user
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
        if (!user || !user.is_active) {
            return res.status(401).json({ message: 'Usuário não encontrado ou desativado' });
        }

        // Delete old refresh token
        db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);

        // Generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Save new refresh token
        saveRefreshToken(user.id, newRefreshToken);

        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken,
            user: sanitizeUser(user),
        });
    } catch (error) {
        console.error('Erro ao renovar token:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Get Current User (Protected) ──────────────────────────
/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Obter perfil do usuário logado
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *       401:
 *         description: Não autorizado
 */
app.get('/api/me', authMiddleware, (req, res) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json({ user: sanitizeUser(user) });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Update Profile (Protected) ─────────────────────────────
/**
 * @swagger
 * /api/me:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               profile_type: { type: string }
 *               company_nif: { type: string }
 *               company_name: { type: string }
 *               photo: { type: string }
 *     responses:
 *       200:
 *         description: Perfil atualizado
 */
app.put('/api/me', authMiddleware, async (req, res) => {
    try {
        const { name, phone, profile_type, company_nif, company_name, photo } = req.body;
        const now = new Date().toISOString();

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (name !== undefined) { updates.push('name = ?'); values.push(name.trim()); }
        if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
        if (profile_type !== undefined) { updates.push('profile_type = ?'); values.push(profile_type); }
        if (company_nif !== undefined) { updates.push('company_nif = ?'); values.push(company_nif); }
        if (company_name !== undefined) { updates.push('company_name = ?'); values.push(company_name); }
        if (photo !== undefined) { updates.push('photo = ?'); values.push(photo); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'Nenhum campo para atualizar' });
        }

        updates.push('updated_at = ?');
        values.push(now);
        values.push(req.userId);

        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

        const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
        res.json({
            message: 'Perfil atualizado com sucesso',
            user: sanitizeUser(updatedUser),
        });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Change Password (Protected) ────────────────────────────
/**
 * @swagger
 * /api/me/password:
 *   put:
 *     summary: Alterar senha
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       401:
 *         description: Senha atual incorreta
 */
app.put('/api/me/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Senha atual incorreta' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        db.prepare('UPDATE users SET password = ?, updated_at = ? WHERE id = ?')
            .run(hashedPassword, new Date().toISOString(), req.userId);

        // Revoke all refresh tokens for security
        db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(req.userId);

        res.json({ message: 'Senha alterada com sucesso. Faça login novamente.' });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Complete Onboarding (Protected) ────────────────────────
/**
 * @swagger
 * /api/me/onboarding:
 *   post:
 *     summary: Completar onboarding
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_type: { type: string }
 *               company_nif: { type: string }
 *               company_name: { type: string }
 *     responses:
 *       200:
 *         description: Onboarding concluído
 */
app.post('/api/me/onboarding', authMiddleware, (req, res) => {
    try {
        const { profile_type, company_nif, company_name } = req.body;
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE users 
            SET profile_type = ?, company_nif = ?, company_name = ?, 
                onboarding_completed = 1, updated_at = ?
            WHERE id = ?
        `).run(
            profile_type || 'individual',
            company_nif || null,
            company_name || null,
            now,
            req.userId
        );

        const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

        console.log(`✅ Onboarding completo: ${updatedUser.email} (${profile_type})`);

        res.json({
            message: 'Onboarding completo',
            user: sanitizeUser(updatedUser),
        });
    } catch (error) {
        console.error('Erro no onboarding:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Logout (Protected) ────────────────────────────────────
/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Sair do sistema
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logout realizado
 */
app.post('/api/logout', authMiddleware, (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            // Delete specific refresh token
            db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
        } else {
            // Delete all refresh tokens for this user
            db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(req.userId);
        }

        res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Delete Account (Protected) ─────────────────────────────
/**
 * @swagger
 * /api/me:
 *   delete:
 *     summary: Deletar conta
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Conta deletada
 *       401:
 *         description: Senha incorreta
 */
app.delete('/api/me', authMiddleware, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Senha é necessária para deletar a conta' });
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }

        // Delete refresh tokens first (foreign key)
        db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(req.userId);
        // Delete user
        db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);

        console.log(`⚠️ Conta deletada: ${user.email}`);

        res.json({ message: 'Conta deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── List All Users (Admin/Dashboard) ────────────────────────
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos os usuários (Admin)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
app.get('/api/users', (req, res) => {
    try {
        const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();

        const mappedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role || 'user',
            status: user.is_active ? 'active' : 'inactive',
            profile_type: user.profile_type,
            company_nif: user.company_nif,
            company_name: user.company_name,
            photo: user.photo,
            createdAt: user.created_at,
            onboarding_completed: user.onboarding_completed === 1
        }));

        res.json(mappedUsers);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Get Admin Stats (Dashboard) ────────────────────────────
/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Obter estatísticas do painel (Admin)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Estatísticas gerais
 */
app.get('/api/admin/stats', (req, res) => {
    try {
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
        const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
        const activeUsersCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get().count;
        const pendingPayments = db.prepare("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'pending' OR payment_status = 'proof_submitted'").get().count;

        // Revenue calculations (all non-cancelled orders)
        const revenueResult = db.prepare("SELECT SUM(total) as total FROM orders WHERE status != 'cancelled'").get();
        const totalRevenue = revenueResult.total || 0;

        // Revenue per month (last 6 months)
        const revenueDataRaw = db.prepare(`
            SELECT 
                strftime('%m', created_at) as month_num,
                SUM(total) as value
            FROM orders
            WHERE status != 'cancelled'
            AND created_at >= date('now', '-6 months')
            GROUP BY month_num
            ORDER BY created_at ASC
        `).all();

        const monthNames = { '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez' };

        // Ensure at least 6 months of data even if empty
        let revenueData = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const mNum = String(d.getMonth() + 1).padStart(2, '0');
            const mName = monthNames[mNum];
            const found = revenueDataRaw.find(r => r.month_num === mNum);
            revenueData.push({
                month: mName,
                value: found ? found.value : 0
            });
        }

        // Category Distribution (by total sales value)
        const categoryDataRaw = db.prepare(`
            SELECT c.name, SUM(oi.price * oi.quantity) as revenue
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            LEFT JOIN order_items oi ON p.id = oi.product_id
            GROUP BY c.id
        `).all();

        const totalCategoryRevenue = categoryDataRaw.reduce((acc, c) => acc + (c.revenue || 0), 0);
        const categoryDistribution = categoryDataRaw.map(c => ({
            name: c.name,
            value: totalCategoryRevenue > 0 ? Math.round((c.revenue || 0) / totalCategoryRevenue * 100) : 0
        }));

        // Detailed weekly data (last 7 days)
        const weeklyDataRaw = db.prepare(`
            SELECT 
                date(created_at) as date,
                COUNT(*) as orders,
                SUM(total) as revenue
            FROM orders
            WHERE created_at >= date('now', '-7 days')
            AND status != 'cancelled'
            GROUP BY date(created_at)
            ORDER BY date(created_at) ASC
        `).all();

        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = weeklyDataRaw.find(w => w.date === dateStr);
            weeklyData.push({
                day: weekdays[d.getDay()],
                orders: found ? found.orders : 0,
                revenue: found ? found.revenue : 0
            });
        }

        // Top 5 Products
        const topProducts = db.prepare(`
            SELECT p.name, SUM(oi.quantity) as sales
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY p.id
            ORDER BY sales DESC
            LIMIT 5
        `).all();

        const stats = {
            totalUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            pendingPayments,
            activeUsers: activeUsersCount,
            totalVehicles: 0,
            revenueData,
            weeklyData,
            topProducts: topProducts.length > 0 ? topProducts : [
                { name: 'Nenhum', sales: 0 }
            ],
            categoryDistribution: categoryDistribution.length > 0 ? categoryDistribution : [
                { name: 'Geral', value: 100 }
            ],
            recentOrders: db.prepare(`
                SELECT o.*, u.name as userName 
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                ORDER BY o.created_at DESC 
                LIMIT 5
            `).all()
        };

        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Categories ──────────────────────────────────────────────
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Listar categorias
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
app.get('/api/categories', (req, res) => {
    try {
        const categories = db.prepare('SELECT * FROM categories').all();
        res.json(categories);
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Criar nova categoria
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               icon: { type: string }
 *               color: { type: string }
 *               bg: { type: string }
 *     responses:
 *       201:
 *         description: Categoria criada
 */
app.post('/api/categories', (req, res) => {
    try {
        const { name, icon, color, bg } = req.body;
        if (!name) return res.status(400).json({ message: 'Nome da categoria é obrigatório' });
        const id = Date.now().toString();
        db.prepare('INSERT INTO categories (id, name, icon, color, bg) VALUES (?, ?, ?, ?, ?)')
            .run(id, name, icon || '📦', color || '#22C55E', bg || '#D4F4E7');
        res.status(201).json({ id, name, icon, color, bg });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar categoria' });
    }
});

app.put('/api/categories/:id', (req, res) => {
    try {
        const { name, icon, color, bg } = req.body;
        db.prepare('UPDATE categories SET name = ?, icon = ?, color = ?, bg = ? WHERE id = ?')
            .run(name, icon, color, bg, req.params.id);
        res.json({ message: 'Categoria atualizada' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar categoria' });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
        res.json({ message: 'Categoria removida' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover categoria' });
    }
});

// ─── Products ────────────────────────────────────────────────
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar produtos ativos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
app.get('/api/products', (req, res) => {
    try {
        const products = db.prepare(`
            SELECT p.*, c.name as category_name, c.icon as category_icon, c.color as category_color, c.bg as category_bg
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = 1
            ORDER BY p.created_at DESC
        `).all();

        // Map to match frontend expectations
        const mapped = products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category_name,
            category_id: p.category_id,
            image: p.image,
            description: p.description,
            stock: p.stock,
            rating: p.rating,
            reviews: p.reviews,
            badge: p.badge,
            status: p.is_active === 1 ? 'active' : 'inactive',
            createdAt: p.created_at,
            category_icon: p.category_icon,
            category_color: p.category_color,
            category_bg: p.category_bg
        }));

        res.json(mapped);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Atualizar produto
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               category_id: { type: string }
 *               image: { type: string }
 *               description: { type: string }
 *               stock: { type: number }
 *               is_active: { type: integer }
 *     responses:
 *       200:
 *         description: Produto atualizado
 */
app.put('/api/products/:id', (req, res) => {
    try {
        const { name, price, category_id, image, description, stock, badge, is_active } = req.body;
        db.prepare(`
            UPDATE products 
            SET name = ?, price = ?, category_id = ?, image = ?, description = ?, stock = ?, badge = ?, is_active = ?, updated_at = datetime('now')
            WHERE id = ?
        `).run(name, price, category_id, image, description, stock, badge, is_active, req.params.id);
        res.json({ message: 'Produto atualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar produto' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
        res.json({ message: 'Produto removido' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover produto' });
    }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Criar novo produto
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category_id]
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               category_id: { type: string }
 *               image: { type: string }
 *               description: { type: string }
 *               stock: { type: number }
 *     responses:
 *       201:
 *         description: Produto criado
 */
app.post('/api/products', (req, res) => {
    try {
        const { name, price, category_id, image, description, stock, badge } = req.body;

        if (!name || !price || !category_id) {
            return res.status(400).json({ message: 'Nome, preço e categoria são obrigatórios' });
        }

        const id = Date.now().toString();
        db.prepare(`
            INSERT INTO products (id, name, price, category_id, image, description, stock, badge)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, name, price, category_id, image || null, description || null, stock || 0, badge || null);

        const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ═════════════════════════════════════════════════════════════
//  PASSWORD RECOVERY ROUTES
// ═════════════════════════════════════════════════════════════

// ─── Forgot Password (Send OTP) ─────────────────────────────
/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Solicitar recuperação de senha (enviar OTP)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Código enviado se o email existir
 */
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email é obrigatório' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
        if (!user) {
            // Don't reveal if email exists — always return success
            return res.json({ message: 'Se o email estiver cadastrado, você receberá um código de recuperação.' });
        }

        // Rate limit: max 1 OTP per minute per email
        const recentOTP = db.prepare(`
            SELECT * FROM otp_codes 
            WHERE email = ? AND used = 0 AND created_at > datetime('now', '-1 minute')
        `).get(normalizedEmail);

        if (recentOTP) {
            return res.status(429).json({ message: 'Aguarde 1 minuto antes de solicitar outro código.' });
        }

        // Invalidate all previous OTPs for this email
        db.prepare('UPDATE otp_codes SET used = 1 WHERE email = ? AND used = 0').run(normalizedEmail);

        // Generate OTP (5 digits)
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        // Save OTP to database
        db.prepare(`
            INSERT INTO otp_codes (id, user_id, email, code, type, expires_at)
            VALUES (?, ?, ?, ?, 'password_reset', ?)
        `).run(uuidv4(), user.id, normalizedEmail, otpCode, expiresAt);

        // Send email
        const emailResult = await sendOTPEmail(normalizedEmail, otpCode, user.name);

        console.log(`🔐 OTP gerado para: ${normalizedEmail} (Código: ${otpCode})`);

        res.json({
            message: 'Se o email estiver cadastrado, você receberá um código de recuperação.',
            // In development, include the code for testing
            ...(process.env.NODE_ENV !== 'production' && { _devCode: otpCode }),
        });
    } catch (error) {
        console.error('Erro ao enviar OTP:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Verify OTP ─────────────────────────────────────────────
/**
 * @swagger
 * /api/verify-otp:
 *   post:
 *     summary: Verificar código OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email: { type: string }
 *               code: { type: string }
 *     responses:
 *       200:
 *         description: Código verificado
 *       400:
 *         description: Código inválido ou expirado
 */
app.post('/api/verify-otp', (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: 'Email e código são obrigatórios' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find valid OTP
        const otpRecord = db.prepare(`
            SELECT * FROM otp_codes 
            WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
            ORDER BY created_at DESC
            LIMIT 1
        `).get(normalizedEmail, code);

        if (!otpRecord) {
            return res.status(400).json({ message: 'Código inválido ou expirado' });
        }

        // Mark as verified but don't mark as used yet (will be used on password reset)
        res.json({
            message: 'Código verificado com sucesso',
            resetToken: otpRecord.id, // Use the OTP record ID as a reset token
        });
    } catch (error) {
        console.error('Erro ao verificar OTP:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Reset Password (with OTP) ──────────────────────────────
/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Redefinir senha com OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword]
 *             properties:
 *               email: { type: string }
 *               code: { type: string }
 *               resetToken: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Senha redefinida
 */
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, code, resetToken, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
        }

        if (!email || (!code && !resetToken)) {
            return res.status(400).json({ message: 'Email e código/token são obrigatórios' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find valid OTP by code or resetToken
        let otpRecord;
        if (resetToken) {
            otpRecord = db.prepare(`
                SELECT * FROM otp_codes 
                WHERE id = ? AND email = ? AND used = 0 AND expires_at > datetime('now')
            `).get(resetToken, normalizedEmail);
        } else {
            otpRecord = db.prepare(`
                SELECT * FROM otp_codes 
                WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
                ORDER BY created_at DESC
                LIMIT 1
            `).get(normalizedEmail, code);
        }

        if (!otpRecord) {
            return res.status(400).json({ message: 'Código inválido ou expirado. Solicite um novo código.' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update user's password
        db.prepare('UPDATE users SET password = ?, updated_at = ? WHERE id = ?')
            .run(hashedPassword, new Date().toISOString(), otpRecord.user_id);

        // Mark OTP as used
        db.prepare('UPDATE otp_codes SET used = 1 WHERE id = ?').run(otpRecord.id);

        // Invalidate all refresh tokens for security
        db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(otpRecord.user_id);

        console.log(`✅ Senha redefinida para: ${normalizedEmail}`);

        res.json({ message: 'Senha redefinida com sucesso! Faça login com a nova senha.' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ─── Orders ──────────────────────────────────────────────────
/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Listar todas as encomendas (Admin)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Lista de encomendas
 */
app.get('/api/admin/orders', (req, res) => {
    try {
        const orders = db.prepare(`
            SELECT o.*, u.name as userName, u.email as userEmail
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `).all();

        const ordersWithItems = orders.map(order => {
            const items = db.prepare(`
                SELECT oi.*, p.name as productName, p.image as productImage
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `).all(order.id);
            return { ...order, items };
        });

        res.json(ordersWithItems);
    } catch (error) {
        console.error('Erro ao listar encomendas:', error);
        res.status(500).json({ message: 'Erro ao listar encomendas' });
    }
});

/**
 * @swagger
 * /api/orders/user/{user_id}:
 *   get:
 *     summary: Listar encomendas de um usuário específico
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Histórico de encomendas
 */
app.get('/api/orders/user/:user_id', (req, res) => {
    try {
        const orders = db.prepare(`
            SELECT * FROM orders 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).all(req.params.user_id);

        const ordersWithItems = orders.map(order => {
            const items = db.prepare(`
                SELECT oi.*, p.name as productName, p.image as productImage, p.description as productDescription
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `).all(order.id);
            return { ...order, items };
        });

        res.json(ordersWithItems);
    } catch (error) {
        console.error('Erro ao buscar encomendas do utilizador:', error);
        res.status(500).json({ message: 'Erro ao buscar histórico' });
    }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Criar nova encomenda
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, items, total]
 *             properties:
 *               user_id: { type: string }
 *               total: { type: number }
 *               delivery_address: { type: string }
 *               payment_proof: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id: { type: string }
 *                     quantity: { type: number }
 *                     price: { type: number }
 *     responses:
 *       201:
 *         description: Encomenda realizada
 */
app.post('/api/orders', (req, res) => {
    const { user_id, items, total, delivery_address, payment_proof } = req.body;

    if (!user_id || !items || items.length === 0) {
        return res.status(400).json({ message: 'Dados da encomenda incompletos' });
    }

    const orderId = `ORD-${Date.now()}`;
    const transaction = db.transaction(() => {
        db.prepare(`
            INSERT INTO orders (id, user_id, total, delivery_address, payment_proof, payment_status)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(orderId, user_id, total, delivery_address || null, payment_proof || null, payment_proof ? 'proof_submitted' : 'pending');

        const insertItem = db.prepare(`
            INSERT INTO order_items (id, order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?, ?)
        `);

        items.forEach((item, index) => {
            insertItem.run(`${orderId}-${index}`, orderId, item.product_id, item.quantity, item.price);
        });
    });

    try {
        transaction();
        res.status(201).json({ id: orderId, message: 'Encomenda realizada com sucesso' });
    } catch (error) {
        console.error('Erro na transação de encomenda:', error);
        res.status(500).json({ message: 'Erro ao processar encomenda' });
    }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Atualizar status de uma encomenda
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *               payment_status: { type: string }
 *     responses:
 *       200:
 *         description: Status atualizado
 */
app.put('/api/orders/:id/status', (req, res) => {
    try {
        const { status, payment_status } = req.body;
        db.prepare(`
            UPDATE orders 
            SET status = COALESCE(?, status), 
                payment_status = COALESCE(?, payment_status),
                updated_at = datetime('now')
            WHERE id = ?
        `).run(status, payment_status, req.params.id);
        res.json({ message: 'Status da encomenda atualizado' });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ message: 'Erro ao atualizar status' });
    }
});

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

// ─── Error Handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

// ─── Start Server ───────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
  ╔════════════════════════════════════════════╗
  ║   🚜 AgriCargas Backend API               ║
  ║   Rodando em http://localhost:${PORT}        ║
  ║                                            ║
  ║   Rotas disponíveis:                       ║
  ║   POST   /api/register                     ║
  ║   POST   /api/login                        ║
  ║   GET    /api/me                           ║
  ║   GET    /api-docs (Swagger)               ║
  ╚════════════════════════════════════════════╝
  `);
});
