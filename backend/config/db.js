const { Pool } = require('pg');

// Support Supabase et PostgreSQL classique
let pool;

if (process.env.DATABASE_URL) {
  // Supabase ou autre service cloud
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });
} else {
  // PostgreSQL local - FORCER IPv4
  pool = new Pool({
    user: process.env.DB_USER,
    host: '127.0.0.1', // ✅ FORCER 127.0.0.1 au lieu de localhost
    database: process.env.DB_DATABASE,
    password: String(process.env.DB_PASSWORD),
    port: parseInt(process.env.DB_PORT) || 5432,
  });
}

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err.message);
  process.exit(1); // Arrêter le serveur en cas d'erreur critique
});

module.exports = pool;
