import { Router } from 'express';
import { ArtistController } from '../controllers/artist.controller';
import { ArtistService } from '../services/artist.service';
import { ArtistRepository } from '../repositories/artist.repository';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  CreateArtistSchema,
  UpdateArtistSchema,
  PaginationSchema,
} from '../utils/validation';

const router = Router();

const artistService = new ArtistService(new ArtistRepository());
const ctrl = new ArtistController(artistService);

/**
 * @route  GET /artists
 * @desc   List all artists (paginated)
 * @access Public
 */
router.get('/', validate(PaginationSchema, 'query'), ctrl.getAll);

/**
 * @route  GET /artists/:slug
 * @desc   Get a single artist by slug
 * @access Public
 */
router.get('/:slug', ctrl.getBySlug);

/**
 * @route  POST /artists
 * @desc   Create a new artist
 * @access Private
 */
router.post('/', authenticate, validate(CreateArtistSchema), ctrl.create);

/**
 * @route  PATCH /artists/:id
 * @desc   Update an artist
 * @access Private
 */
router.patch('/:id', authenticate, validate(UpdateArtistSchema), ctrl.update);

/**
 * @route  DELETE /artists/:id
 * @desc   Delete an artist (cascades to songs)
 * @access Private
 */
router.delete('/:id', authenticate, ctrl.delete);

export default router;
