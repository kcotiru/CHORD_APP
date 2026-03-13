import pool from '../config/database';
import { UserEntity } from '../types';

export class UserRepository {
  async create(username: string, passwordHash: string): Promise<UserEntity> {
    const { rows } = await pool.query<UserEntity>(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       RETURNING user_id, username, password_hash, created_at`,
      [username, passwordHash]
    );
    return rows[0];
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const { rows } = await pool.query<UserEntity>(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return rows[0] ?? null;
  }

  async findById(userId: number): Promise<UserEntity | null> {
    const { rows } = await pool.query<UserEntity>(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );
    return rows[0] ?? null;
  }
}
