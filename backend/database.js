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

// Seed Categories (English demo catalog)
const categories = [
  { id: '1', name: 'Vegetables', icon: 'leaf-outline', color: '#22C55E', bg: '#D4F4E7' },
  { id: '2', name: 'Fruits', icon: 'nutrition-outline', color: '#F59E0B', bg: '#FFF8E1' },
  { id: '3', name: 'Cereals', icon: 'grid-outline', color: '#8B5CF6', bg: '#EDE9FE' },
  { id: '4', name: 'Legumes', icon: 'flask-outline', color: '#3B82F6', bg: '#DBEAFE' },
];

const insertCat = db.prepare('INSERT OR IGNORE INTO categories (id, name, icon, color, bg) VALUES (?, ?, ?, ?, ?)');
const updateCat = db.prepare('UPDATE categories SET name = ?, icon = ?, color = ?, bg = ? WHERE id = ?');
categories.forEach(cat => {
  insertCat.run(cat.id, cat.name, cat.icon, cat.color, cat.bg);
  updateCat.run(cat.name, cat.icon, cat.color, cat.bg, cat.id);
});
console.log('🌱 Seeded categories');

// Translate legacy demo products to English
const legacyNames = {
  'Tomates Frescos': 'Fresh Tomatoes',
  'Abacate': 'Hass Avocado',
  'Banana': 'Bananas',
  'Pão': 'Bread',
  'Manga': 'Mango',
  'Couve': 'Kale',
  'Melão': 'Melon',
};
const renameProduct = db.prepare('UPDATE products SET name = ? WHERE name = ?');
Object.entries(legacyNames).forEach(([from, to]) => renameProduct.run(to, from));

// Seed the English demo catalog (idempotent)
const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;
const demoProducts = [
  ['mock-1', 'Fresh Tomatoes', 1200, '1', img('1546097759-4bd817f51931'), 'Juicy, sun-ripened tomatoes picked fresh from the farm.', 180, 4.8, 124, 'Best Seller'],
  ['mock-2', 'Hass Avocado', 2500, '2', img('1523049673857-eb18f1d7b578'), 'Creamy Hass avocados, naturally ripened and ready to eat.', 95, 4.7, 89, 'New'],
  ['mock-3', 'Bananas', 1400, '2', img('1571771894821-ce9b6c11b08e'), 'Sweet, energy-packed bananas from local plantations.', 320, 4.6, 156, 'Best Seller'],
  ['mock-4', 'Kale', 800, '1', img('1540420773420-3366772f4999'), 'Fresh organic kale with crisp, nutrient-rich leaves.', 210, 4.9, 67, 'Organic'],
  ['mock-5', 'Mango', 1800, '2', img('1553279768-865429fa0078'), 'Sweet, aromatic mangoes at the peak of ripeness.', 140, 4.8, 98, '10% OFF'],
  ['mock-6', 'Pineapple', 1600, '2', img('1550258987-190a2d41a8ba'), 'Tropical pineapples with a sweet and tangy flavor.', 110, 4.5, 54, null],
  ['mock-7', 'Onions', 950, '1', img('1508747703725-719777637510'), 'Firm, full-flavored onions for everyday cooking.', 260, 4.4, 72, null],
  ['mock-8', 'Bell Peppers', 2100, '1', img('1563565375-f3fdfdbefa83'), 'Colorful bell peppers, crisp and full of vitamins.', 130, 4.7, 61, 'Fresh'],
  ['mock-9', 'White Maize', 1100, '3', img('1551754655-cd27e38d2076'), 'Premium white maize, dried and ready to mill.', 400, 4.6, 83, 'Best Seller'],
  ['mock-10', 'Long Grain Rice', 3200, '3', img('1586201375761-83865001e31c'), 'High-quality long grain rice with a fluffy texture.', 275, 4.5, 47, null],
  ['mock-11', 'Red Beans', 1700, '4', img('1551462147-37885acc36f1'), 'Protein-rich red beans, sorted and cleaned.', 190, 4.7, 59, 'Organic'],
  ['mock-12', 'Peanuts', 2200, '4', img('1567892737950-30c4db37cd89'), 'Crunchy, naturally roasted peanuts rich in protein.', 165, 4.8, 76, null],
  ['mock-13', 'Soybeans', 1950, '4', img('1599940824399-b87987ceb72a'), 'High-protein soybeans for healthy meals.', 120, 4.4, 33, 'New'],
];

const insertProduct = db.prepare(`
  INSERT OR IGNORE INTO products (id, name, price, category_id, image, description, stock, rating, reviews, badge)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
demoProducts.forEach(p => insertProduct.run(...p));
// Hide legacy demo rows without media so the English demo catalog is shown cleanly
db.prepare("UPDATE products SET is_active = 0 WHERE id NOT LIKE 'mock-%' AND (image IS NULL OR image = '')").run();
console.log('🌱 Seeded demo products');

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
