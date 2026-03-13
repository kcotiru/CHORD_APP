import { hash, verify } from '@node-rs/bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { ConflictError, UnauthorizedError } from '../utils/errors';
import { JwtPayload, LoginDTO, RegisterDTO } from '../types';

const SALT_ROUNDS = 12;

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async register(dto: RegisterDTO) {
    const existing = await this.userRepo.findByUsername(dto.username);
    if (existing) throw new ConflictError('Username already taken');

    const passwordHash = await hash(dto.password, SALT_ROUNDS);
    const user = await this.userRepo.create(dto.username, passwordHash);

    return {
      user_id: user.user_id,
      username: user.username,
      created_at: user.created_at,
    };
  }

  async login(dto: LoginDTO) {
    const user = await this.userRepo.findByUsername(dto.username);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await verify(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const payload: JwtPayload = { userId: user.user_id, username: user.username };
    const accessToken = this.signToken(payload, process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN || '15m');
    const refreshToken = this.signToken(payload, process.env.JWT_REFRESH_SECRET!, process.env.JWT_REFRESH_EXPIRES_IN || '7d');

    return {
      accessToken,
      refreshToken,
      user: { user_id: user.user_id, username: user.username },
    };
  }

  async refresh(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
      const user = await this.userRepo.findById(payload.userId);
      if (!user) throw new UnauthorizedError('User not found');

      const newPayload: JwtPayload = { userId: user.user_id, username: user.username };
      return {
        accessToken: this.signToken(newPayload, process.env.JWT_SECRET!, process.env.JWT_EXPIRES_IN || '15m'),
      };
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  private signToken(payload: JwtPayload, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
}
