import slugify from 'slugify';
import { ArtistRepository } from '../repositories/artist.repository';
import { ConflictError, NotFoundError } from '../utils/errors';
import { CreateArtistDTO, UpdateArtistDTO } from '../types';

export class ArtistService {
  constructor(private artistRepo: ArtistRepository) {}

  private makeSlug(name: string): string {
    return slugify(name, { lower: true, strict: true });
  }

  async create(dto: CreateArtistDTO) {
    const slug = this.makeSlug(dto.name);
    const existing = await this.artistRepo.findBySlug(slug);
    if (existing) throw new ConflictError('Artist already exists');
    return this.artistRepo.create(dto.name, slug);
  }

  async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.artistRepo.findAll(limit, offset);
  }

  async getBySlug(slug: string) {
    const artist = await this.artistRepo.findBySlug(slug);
    if (!artist) throw new NotFoundError('Artist not found');
    return artist;
  }

  async getById(artistId: number) {
    const artist = await this.artistRepo.findById(artistId);
    if (!artist) throw new NotFoundError('Artist not found');
    return artist;
  }

  async update(artistId: number, dto: UpdateArtistDTO) {
    const artist = await this.getById(artistId);
    const newName = dto.name ?? artist.name;
    const newSlug = this.makeSlug(newName);

    // Check conflict only if slug changed
    if (newSlug !== artist.slug) {
      const existing = await this.artistRepo.findBySlug(newSlug);
      if (existing) throw new ConflictError('Artist name already taken');
    }

    return this.artistRepo.update(artistId, newName, newSlug);
  }

  async delete(artistId: number) {
    await this.getById(artistId);
    await this.artistRepo.delete(artistId);
  }
}
