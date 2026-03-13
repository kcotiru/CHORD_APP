import { Router } from 'express';
import { SongController } from '../controllers/song.controller';
import { SongService } from '../services/song.service';
import { SongRepository } from '../repositories/song.repository';
import { ArtistRepository } from '../repositories/artist.repository';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  CreateSongSchema,
  UpdateSongSchema,
  TransposeSchema,
  PaginationSchema,
} from '../utils/validation';

const router = Router();

const songService = new SongService(new SongRepository(), new ArtistRepository());
const ctrl = new SongController(songService);

/**
 * @route  GET /songs
 * @desc   List all songs (paginated, optional ?search=)
 * @access Public
 */
router.get('/', validate(PaginationSchema, 'query'), ctrl.getAll);

/**
 * @route  GET /songs/by-slug/:slug
 * @desc   Get a song by its slug
 * @access Public
 */
router.get('/by-slug/:slug', ctrl.getBySlug);

/**
 * @route  GET /songs/by-artist/:artistId
 * @desc   List songs for a specific artist
 * @access Public
 */
router.get(
  '/by-artist/:artistId',
  validate(PaginationSchema, 'query'),
  ctrl.getByArtist
);

/**
 * @route  GET /songs/:id
 * @desc   Get a song by ID
 * @access Public
 */
router.get('/:id', ctrl.getById);

/**
 * @route  GET /songs/:id/parse
 * @desc   Parse song content into typed ContentBlocks for UI rendering
 * @access Public
 * @returns { song, blocks: ContentBlock[] }
 */
router.get('/:id/parse', ctrl.parse);

/**
 * @route  POST /songs/:id/transpose
 * @desc   Transpose a song's chord chart
 * @body   { semitones: number(-11..11), preference?: 'sharp'|'flat', save?: boolean }
 * @access Public (read-only transpose) / Private (save=true)
 * @returns { song, blocks: ContentBlock[], newRootKey: string }
 */
router.post(
  '/:id/transpose',
  validate(TransposeSchema),
  (req, res, next) => {
    // If client wants to persist the transposition, require auth
    if (req.body.save === true) {
      return authenticate(req as any, res, next);
    }
    next();
  },
  ctrl.transpose
);

/**
 * @route  POST /songs
 * @desc   Create a new song
 * @access Private
 */
router.post('/', authenticate, validate(CreateSongSchema), ctrl.create);

/**
 * @route  PATCH /songs/:id
 * @desc   Update a song
 * @access Private
 */
router.patch('/:id', authenticate, validate(UpdateSongSchema), ctrl.update);

/**
 * @route  DELETE /songs/:id
 * @desc   Delete a song
 * @access Private
 */
router.delete('/:id', authenticate, ctrl.delete);

export default router;
