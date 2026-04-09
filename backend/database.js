const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'agricargas.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    profile_type TEXT DEFAULT 'individual',
    company_nif TEXT,
    company_name TEXT,
    photo TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    bg TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category_id TEXT,
    image TEXT,
    description TEXT,
    stock INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    badge TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    payment_proof TEXT,
    delivery_address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS otp_codes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT DEFAULT 'password_reset',
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Create indexes
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
  CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
  CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);
`);

// Seed Categories if empty
const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (categoryCount.count === 0) {
  const categories = [
    { id: '1', name: 'Hortaliças', icon: 'leaf-outline', color: '#22C55E', bg: '#D4F4E7' },
    { id: '2', name: 'Frutas', icon: 'nutrition-outline', color: '#F59E0B', bg: '#FFF8E1' },
    { id: '3', name: 'Cereais', icon: 'grid-outline', color: '#8B5CF6', bg: '#EDE9FE' },
    { id: '4', name: 'Legumes', icon: 'flask-outline', color: '#3B82F6', bg: '#DBEAFE' },
  ];

  const insertCat = db.prepare('INSERT INTO categories (id, name, icon, color, bg) VALUES (?, ?, ?, ?, ?)');
  categories.forEach(cat => insertCat.run(cat.id, cat.name, cat.icon, cat.color, cat.bg));
  console.log('🌱 Seeded categories');
}

// Seed a sample product if empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
  db.prepare(`
        INSERT INTO products (id, name, price, category_id, badge, stock, rating, reviews, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('1', 'Tomates Frescos', 10000, '1', 'Novo', 100, 4.8, 24, 'https://images.unsplash.com/photo-1546097759-4bd817f51931?q=80&w=300&auto=format&fit=crop');
  console.log('🌱 Seeded sample product');
}

// Migration: add onboarding_completed column if not exists
try {
  db.exec(`ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0`);
  console.log('✅ Migration: onboarding_completed column added');
} catch (e) {
  // Column already exists, ignore
}

// Migration: add role column if not exists
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
  console.log('✅ Migration: role column added');
} catch (e) {
  // Column already exists, ignore
}

module.exports = db;
