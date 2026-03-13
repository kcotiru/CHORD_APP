import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
  process.exit(1);
});

export async function connectDB(): Promise<void> {
  const client = await pool.connect();
  client.release();
  console.log('✅ PostgreSQL connected');
}

export default pool;
