import { AccessTokenPayload } from '../../modules/auth/infrastructure/jwt-token.service';

declare global {
  namespace Express {
    interface Request {
      /** Set by JwtAuthGuard from the verified access token; absent on @Public() routes. */
      user?: AccessTokenPayload;
    }
  }
}

export {};
