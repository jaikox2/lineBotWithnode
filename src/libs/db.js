const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ssobot',
  password: '5393',
  port: 5432,
});

module.exports = pool;
