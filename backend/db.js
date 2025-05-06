const { Pool } = require('pg');
require('dotenv').config();

// Poolのインスタンス生成
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'reservations',  // ✅ ここが間違っていないか？
  password: 'postgres',
  port: 5432,
});

module.exports = pool;
