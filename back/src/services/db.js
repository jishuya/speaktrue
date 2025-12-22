const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 연결 테스트
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// 쿼리 함수
const query = async (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  query,
  pool,
};
