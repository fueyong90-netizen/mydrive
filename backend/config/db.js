const { Pool } = require('pg');

// Support Supabase et PostgreSQL classique
const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: String(process.env.DB_PASSWORD), // ✅ CONVERSION EN STRING
      port: parseInt(process.env.DB_PORT) || 5432,
    });

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err.message);
});

module.exports = pool;
