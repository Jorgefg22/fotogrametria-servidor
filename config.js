require('dotenv').config();

const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const connectionStringsi = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB2_DATABASE}`;
const connectionStringec = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB3_DATABASE}`;

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
});

const poolbdsi = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionStringsi, // Corregido
});

const poolbdmt = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionStringec, // Corregido
});

module.exports = { pool, poolbdsi, poolbdmt };