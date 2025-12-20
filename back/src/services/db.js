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

// 로깅이 포함된 쿼리 함수
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  console.log('\n[DB Query]', {
    query: text.replace(/\s+/g, ' ').trim(),
    params,
    duration: `${duration}ms`,
    rowCount: result.rowCount,
  });
  console.log('[DB Result]', JSON.stringify(result.rows, null, 2));

  return result;
};

module.exports = {
  query,
  pool,
};
