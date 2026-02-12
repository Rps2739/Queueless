import mysql from 'mysql2/promise';
import logger from '@/lib/logger';

let pool;

export async function createConnection() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      logger.info("Database connection pool created successfully.");
    } catch (error) {
      logger.error("CRITICAL: Failed to create database pool", { error: error.message });
      throw error;
    }
  }
  return pool;
}