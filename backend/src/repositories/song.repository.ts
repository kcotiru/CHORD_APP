import pool from '../config/database';
import { SongEntity, CreateSongDTO, UpdateSongDTO } from '../types';

export class SongRepository {
  async create(data: CreateSongDTO & { slug: string }): Promise<SongEntity> {
    const { rows } = await pool.query<SongEntity>(
      `INSERT INTO songs (artist_id, title, slug, content, root_key, bpm)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.artist_id, data.title, data.slug, data.content, data.root_key, data.bpm ?? null]
    );
    return rows[0];
  }

  async findById(songId: number): Promise<SongEntity | null> {
    const { rows } = await pool.query<SongEntity>(
      'SELECT * FROM songs WHERE song_id = $1',
      [songId]
    );
    return rows[0] ?? null;
  }

  async findBySlug(slug: string): Promise<SongEntity | null> {
    const { rows } = await pool.query<SongEntity>(
      'SELECT * FROM songs WHERE slug = $1',
      [slug]
    );
    return rows[0] ?? null;
  }

  async findByArtist(
    artistId: number,
    limit: number,
    offset: number
  ): Promise<{ songs: SongEntity[]; total: number }> {
    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query<SongEntity>(
        'SELECT * FROM songs WHERE artist_id = $1 ORDER BY title LIMIT $2 OFFSET $3',
        [artistId, limit, offset]
      ),
      pool.query<{ count: string }>(
        'SELECT COUNT(*) FROM songs WHERE artist_id = $1',
        [artistId]
      ),
    ]);
    return { songs: rows, total: parseInt(countRows[0].count, 10) };
  }

  async findAll(
    limit: number,
    offset: number,
    search?: string
  ): Promise<{ songs: SongEntity[]; total: number }> {
    const whereClause = search
      ? `WHERE s.title ILIKE $3 OR a.name ILIKE $3`
      : '';
    const params: (number | string)[] = search
      ? [limit, offset, `%${search}%`]
      : [limit, offset];

    const [{ rows }, { rows: countRows }] = await Promise.all([
      pool.query<SongEntity>(
        `SELECT s.* FROM songs s
         JOIN artists a ON a.artist_id = s.artist_id
         ${whereClause}
         ORDER BY s.title LIMIT $1 OFFSET $2`,
        params
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) FROM songs s
         JOIN artists a ON a.artist_id = s.artist_id
         ${whereClause}`,
        search ? [`%${search}%`] : []
      ),
    ]);
    return { songs: rows, total: parseInt(countRows[0].count, 10) };
  }

  async update(songId: number, data: UpdateSongDTO & { slug?: string }): Promise<SongEntity | null> {
    const fields = Object.keys(data) as (keyof typeof data)[];
    if (fields.length === 0) return this.findById(songId);

    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map((f) => data[f]);

    const { rows } = await pool.query<SongEntity>(
      `UPDATE songs SET ${setClause} WHERE song_id = $1 RETURNING *`,
      [songId, ...values]
    );
    return rows[0] ?? null;
  }

  async delete(songId: number): Promise<boolean> {
    const { rowCount } = await pool.query(
      'DELETE FROM songs WHERE song_id = $1',
      [songId]
    );
    return (rowCount ?? 0) > 0;
  }
}
