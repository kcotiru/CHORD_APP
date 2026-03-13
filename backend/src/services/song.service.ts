import slugify from 'slugify';
import { SongRepository } from '../repositories/song.repository';
import { ArtistRepository } from '../repositories/artist.repository';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parseContent, parseAndTranspose } from '../utils/chord.utils';
import { CreateSongDTO, UpdateSongDTO, TransposeOptions } from '../types';

export class SongService {
  constructor(
    private songRepo: SongRepository,
    private artistRepo: ArtistRepository
  ) {}

  private makeSlug(title: string): string {
    return slugify(title, { lower: true, strict: true });
  }

  async create(dto: CreateSongDTO) {
    const artist = await this.artistRepo.findById(dto.artist_id);
    if (!artist) throw new NotFoundError('Artist not found');

    const slug = this.makeSlug(dto.title);
    return this.songRepo.create({ ...dto, slug });
  }

  async getAll(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;
    return this.songRepo.findAll(limit, offset, search);
  }

  async getById(songId: number) {
    const song = await this.songRepo.findById(songId);
    if (!song) throw new NotFoundError('Song not found');
    return song;
  }

  async getBySlug(slug: string) {
    const song = await this.songRepo.findBySlug(slug);
    if (!song) throw new NotFoundError('Song not found');
    return song;
  }

  async getByArtist(artistId: number, page = 1, limit = 20) {
    const artist = await this.artistRepo.findById(artistId);
    if (!artist) throw new NotFoundError('Artist not found');
    const offset = (page - 1) * limit;
    return this.songRepo.findByArtist(artistId, limit, offset);
  }

  async update(songId: number, dto: UpdateSongDTO) {
    const song = await this.getById(songId);
    const slug = dto.title ? this.makeSlug(dto.title) : song.slug;
    return this.songRepo.update(songId, { ...dto, slug });
  }

  async delete(songId: number) {
    await this.getById(songId);
    await this.songRepo.delete(songId);
  }

  // ── Chord Chart Logic ────────────────────────────────────────────────────────

  /** Parse a song's content into typed ContentBlocks. */
  async parseSong(songId: number) {
    const song = await this.getById(songId);
    const blocks = parseContent(song.content);
    return { song, blocks };
  }

  /**
   * Transpose a song's content on-the-fly (does NOT persist to DB).
   * Returns the transposed blocks and the new root key.
   */
  async transposeSong(songId: number, options: TransposeOptions) {
    const song = await this.getById(songId);

    if (options.semitones === 0) {
      return {
        song,
        blocks: parseContent(song.content),
        newRootKey: song.root_key,
      };
    }

    const { blocks, newRootKey } = parseAndTranspose(song.content, song.root_key, options);
    return { song, blocks, newRootKey };
  }

  /**
   * Transpose and persist: saves the transposed content & root_key to DB.
   */
  async transposeSongAndSave(songId: number, options: TransposeOptions) {
    if (options.semitones === 0) throw new ValidationError('semitones must be non-zero');

    const { song, blocks, newRootKey } = await this.transposeSong(songId, options);

    // Reconstruct content string from transposed blocks
    const newContent = blocks.map((b) => b.raw_text).join('\n');
    const updated = await this.songRepo.update(songId, {
      content: newContent,
      root_key: newRootKey,
    });

    return { song: updated, blocks, newRootKey };
  }
}
