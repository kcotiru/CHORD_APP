import { Request, Response, NextFunction } from "express";
import { createUserClient, SupabaseClient } from "../config/supabase";
import { UnauthorizedError } from "../utils/errors";

/**
 * Augment the Express Request type so every downstream handler has
 * access to the authenticated user id and a scoped Supabase client.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string;
      userClient: SupabaseClient;
      jwt: string;
    }
  }
}

/**
 * Extracts the Bearer JWT from the Authorization header, validates it
 * against Supabase Auth, and attaches a user-scoped client to the request.
 *
 * The user-scoped client passes the JWT in every query so Supabase RLS
 * policies (auth.uid() = owner_id, etc.) apply automatically.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid Authorization header");
    }

    const jwt = authHeader.slice(7); // strip "Bearer "

    // Create a temporary client just to verify the token
    const tempClient = createUserClient(jwt);
    const {
      data: { user },
      error,
    } = await tempClient.auth.getUser();

    if (error || !user) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    // Attach the verified user info and a persistent scoped client
    req.userId = user.id;
    req.jwt = jwt;
    req.userClient = createUserClient(jwt);

    next();
  } catch (err) {
    next(err);
  }
}
