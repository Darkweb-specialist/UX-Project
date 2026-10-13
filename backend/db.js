const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'food_donation.db');

let db = null;
let useBuiltinSqlite = false;

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(dbFilePath);
  useBuiltinSqlite = true;
  console.log(`[DB] Using Node.js native SQLite database at: ${dbFilePath}`);
} catch (e) {
  console.warn('[DB] node:sqlite not available, using JSON storage fallback:', e.message);
}

// Fallback JSON-based store in case native sqlite isn't available
const jsonDbPath = path.join(dataDir, 'database.json');
let fallbackStore = {
  donations: [],
  pickups: [],
};

const loadFallback = () => {
  try {
    if (fs.existsSync(jsonDbPath)) {
      fallbackStore = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
    }
  } catch (err) {
    console.error('Failed reading fallback DB:', err);
  }
};

const saveFallback = () => {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(fallbackStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed saving fallback DB:', err);
  }
};

// Seed records
const initialDonations = [
  {
    id: 'don-1',
    foodName: 'Fresh Vegetable Biryani & Raita',
    category: 'Cooked Meals',
    quantity: '25',
    unit: 'meal boxes',
    description: 'Freshly prepared aromatic basmati rice vegetable biryani with fresh yogurt raita.',
    preparedAt: 'Today, 1:30 PM',
    pickupDeadline: 'Today, 8:30 PM',
    pickupAddress: 'Green Leaf Bistro, 42 MG Road, Sector 4',
    latitude: 12.9716,
    longitude: 77.5946,
    donorName: 'Green Leaf Bistro (Chef Ananya)',
    donorPhone: '+91 98765 43210',
    donorType: 'Restaurant',
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    dietary: 'Vegetarian',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'don-2',
    foodName: 'Artisan Sourdough & Wheat Bread Loaves',
    category: 'Bakery & Bread',
    quantity: '18',
    unit: 'loaves',
    description: 'Freshly baked sourdough and whole wheat sandwich bread loaves from daily morning batch.',
    preparedAt: 'Today, 6:00 AM',
    pickupDeadline: 'Tonight, 10:00 PM',
    pickupAddress: 'Golden Crust Bakery, 15 Church Street',
    latitude: 12.9750,
    longitude: 77.6050,
    donorName: 'Golden Crust Artisan Bakery',
    donorPhone: '+91 98111 22334',
    donorType: 'Bakery',
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    dietary: 'Vegetarian',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'don-3',
    foodName: 'Organic Apples, Oranges & Bananas',
    category: 'Fruits & Vegetables',
    quantity: '15',
    unit: 'kg',
    description: 'Surplus farm-fresh organic seasonal fruits. Cleaned, sorted, and ready for pickup.',
    preparedAt: 'Today, 9:00 AM',
    pickupDeadline: 'Tomorrow, 12:00 PM',
    pickupAddress: 'Fresh Roots Mart, 88 Indiranagar Main Road',
    latitude: 12.9784,
    longitude: 77.6408,
    donorName: 'Fresh Roots Organic Supermarket',
    donorPhone: '+91 98450 12345',
    donorType: 'Grocery Shop',
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80',
    dietary: 'Vegan',
    createdAt: new Date().toISOString(),
  },
];

// Initialize schema
const initDatabase = () => {
  if (useBuiltinSqlite && db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        foodName TEXT NOT NULL,
        category TEXT,
        quantity TEXT,
        unit TEXT,
        description TEXT,
        preparedAt TEXT,
        pickupDeadline TEXT,
        pickupAddress TEXT,
        latitude REAL,
        longitude REAL,
        donorName TEXT,
        donorPhone TEXT,
        donorType TEXT,
        status TEXT DEFAULT 'Available',
        imageUrl TEXT,
        dietary TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS pickup_requests (
        id TEXT PRIMARY KEY,
        donationId TEXT NOT NULL,
        foodName TEXT,
        quantity TEXT,
        receiverName TEXT,
        receiverPhone TEXT,
        receiverRole TEXT,
        pickupTimeEstimated TEXT,
        pickupAddress TEXT,
        notes TEXT,
        status TEXT DEFAULT 'Requested',
        requestedAt TEXT
      );
    `);

    // Check count and seed if empty
    const checkStmt = db.prepare('SELECT COUNT(*) as cnt FROM donations');
    const result = checkStmt.get();
    if (result && result.cnt === 0) {
      console.log('[DB] Seeding initial donations...');
      const insertStmt = db.prepare(`
        INSERT INTO donations (
          id, foodName, category, quantity, unit, description, preparedAt,
          pickupDeadline, pickupAddress, latitude, longitude, donorName,
          donorPhone, donorType, status, imageUrl, dietary, createdAt
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      for (const don of initialDonations) {
        insertStmt.run(
          don.id, don.foodName, don.category, don.quantity, don.unit,
          don.description, don.preparedAt, don.pickupDeadline, don.pickupAddress,
          don.latitude, don.longitude, don.donorName, don.donorPhone,
          don.donorType, don.status, don.imageUrl, don.dietary, don.createdAt
        );
      }
      console.log('[DB] Initial seeding complete.');
    }
  } else {
    loadFallback();
    if (!fallbackStore.donations || fallbackStore.donations.length === 0) {
      fallbackStore.donations = [...initialDonations];
      fallbackStore.pickups = [];
      saveFallback();
    }
  }
};

initDatabase();

module.exports = {
  db,
  useBuiltinSqlite,
  getDonationsList: () => {
    if (useBuiltinSqlite && db) {
      const stmt = db.prepare('SELECT * FROM donations ORDER BY createdAt DESC');
      return stmt.all();
    }
    loadFallback();
    return fallbackStore.donations;
  },
  getDonationById: (id) => {
    if (useBuiltinSqlite && db) {
      const stmt = db.prepare('SELECT * FROM donations WHERE id = ?');
      return stmt.get(id);
    }
    loadFallback();
    return fallbackStore.donations.find((d) => d.id === id);
  },
  insertDonation: (don) => {
    if (useBuiltinSqlite && db) {
      const stmt = db.prepare(`
        INSERT INTO donations (
          id, foodName, category, quantity, unit, description, preparedAt,
          pickupDeadline, pickupAddress, latitude, longitude, donorName,
          donorPhone, donorType, status, imageUrl, dietary, createdAt
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      stmt.run(
        don.id, don.foodName, don.category, don.quantity, don.unit,
        don.description, don.preparedAt, don.pickupDeadline, don.pickupAddress,
        don.latitude || null, don.longitude || null, don.donorName, don.donorPhone,
        don.donorType || 'Individual', don.status || 'Available',
        don.imageUrl || '', don.dietary || 'Vegetarian', don.createdAt || new Date().toISOString()
      );
      return don;
    }
    loadFallback();
    fallbackStore.donations.unshift(don);
    saveFallback();
    return don;
  },
  updateDonationStatus: (id, status) => {
    if (useBuiltinSqlite && db) {
      const stmt = db.prepare('UPDATE donations SET status = ? WHERE id = ?');
      stmt.run(status, id);
      return true;
    }
    loadFallback();
    const item = fallbackStore.donations.find((d) => d.id === id);
    if (item) {
      item.status = status;
      saveFallback();
    }
    return true;
  },
  getPickupsList: () => {
    if (useBuiltinSqlite && db) {
      const stmt = db.prepare('SELECT * FROM pickup_requests ORDER BY requestedAt DESC');
      return stmt.all();
    }
    loadFallback();
    return fallbackStore.pickups;
  },
  insertPickupRequest: (req) => {
    if (useBuiltinSqlite && db) {
      const stmt = db.prepare(`
        INSERT INTO pickup_requests (
          id, donationId, foodName, quantity, receiverName, receiverPhone,
          receiverRole, pickupTimeEstimated, pickupAddress, notes, status, requestedAt
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      stmt.run(
        req.id, req.donationId, req.foodName, req.quantity, req.receiverName,
        req.receiverPhone, req.receiverRole, req.pickupTimeEstimated,
        req.pickupAddress, req.notes, req.status || 'Requested', req.requestedAt || new Date().toISOString()
      );
      return req;
    }
    loadFallback();
    fallbackStore.pickups.unshift(req);
    saveFallback();
    return req;
  },
  updatePickupStatus: (id, status) => {
    if (useBuiltinSqlite && db) {
      const stmt = db.prepare('UPDATE pickup_requests SET status = ? WHERE id = ?');
      stmt.run(status, id);
      return true;
    }
    loadFallback();
    const item = fallbackStore.pickups.find((p) => p.id === id);
    if (item) {
      item.status = status;
      saveFallback();
    }
    return true;
  },
};
