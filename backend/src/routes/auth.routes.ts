import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { validate } from '../middleware/validate.middleware';
import { RegisterSchema, LoginSchema, RefreshSchema } from '../utils/validation';

const router = Router();

const authService = new AuthService(new UserRepository());
const ctrl = new AuthController(authService);

/**
 * @route  POST /auth/register
 * @desc   Register a new user
 * @access Public
 */
router.post('/register', validate(RegisterSchema), ctrl.register);

/**
 * @route  POST /auth/login
 * @desc   Login and receive JWT tokens
 * @access Public
 */
router.post('/login', validate(LoginSchema), ctrl.login);

/**
 * @route  POST /auth/refresh
 * @desc   Exchange a refresh token for a new access token
 * @access Public
 */
router.post('/refresh', validate(RefreshSchema), ctrl.refresh);

export default router;
