import pool from '../config/database';
import { ArtistEntity } from '../types';

export class ArtistRepository {
  async create(name: string, slug: string): Promise<ArtistEntity> {
    const { rows } = await pool.query<ArtistEntity>(
      `INSERT INTO artists (name, slug) VALUES ($1, $2)
       RETURNING artist_id, name, slug`,
      [name, slug]
    );
    return rows[0];
  }

  async findById(artistId: number): Promise<ArtistEntity | null> {
    const { rows } = await pool.query<ArtistEntity>(
      'SELECT * FROM artists WHERE artist_id = $1',
      [artistId]
    );
    return rows[0] ?? null;
  }

  async findBySlug(slug: string): Promise<ArtistEntity | null> {
    const { rows } = await pool.query<ArtistEntity>(
      'SELECT * FROM artists WHERE slug = $1',
      [slug]
    );
    return rows[0] ?? null;
  }

  async findAll(limit: number, offset: number): Promise<{ artists: ArtistEntity[]; total: number }> {
    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query<ArtistEntity>('SELECT * FROM artists ORDER BY name LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query<{ count: string }>('SELECT COUNT(*) FROM artists'),
    ]);
    return { artists: rows, total: parseInt(countRows[0].count, 10) };
  }

  async update(artistId: number, name: string, slug: string): Promise<ArtistEntity | null> {
    const { rows } = await pool.query<ArtistEntity>(
      `UPDATE artists SET name = $1, slug = $2
       WHERE artist_id = $3 RETURNING artist_id, name, slug`,
      [name, slug, artistId]
    );
    return rows[0] ?? null;
  }

  async delete(artistId: number): Promise<boolean> {
    const { rowCount } = await pool.query(
      'DELETE FROM artists WHERE artist_id = $1',
      [artistId]
    );
    return (rowCount ?? 0) > 0;
  }
}
