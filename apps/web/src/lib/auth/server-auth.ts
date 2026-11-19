import type { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '../firebase/admin';
import { UserRole, SupportedLocale } from '@rojgarmitra/shared';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: UserRole;
  preferredLocale: SupportedLocale;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

// In-memory sliding-window rate limiter per client/UID
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Enforces per-client rate limiting to protect LLM & discovery endpoints.
 */
export function checkRateLimit(key: string, maxRequests = 15, windowMs = 60000): void {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return;
  }

  if (entry.count >= maxRequests) {
    throw new AuthError('Too many requests. Rate limit exceeded. Please wait a moment before trying again.', 429);
  }

  entry.count++;
}

/**
 * Verifies the Firebase ID Token from the Authorization header and fetches the user's role from Firestore.
 */
export async function authenticateRequest(req: NextRequest | { headers: { get(name: string): string | null } }): Promise<AuthenticatedUser> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header. Expected Bearer <token>', 401);
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    throw new AuthError('Token is empty', 401);
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

  // Demo fallback token for testing and offline development
  if (token.startsWith('demo_token_')) {
    // Strictly forbid demo tokens in production or live Vercel deployments
    if (isProduction) {
      throw new AuthError('Demo authentication tokens are strictly forbidden in production', 401);
    }

    if (process.env.APP_MODE === 'demo' || process.env.NODE_ENV === 'test') {
      const parts = token.split('_'); // demo_token_<role>_<uid>
      const role = (parts[2] as UserRole) || 'candidate';
      const uid = parts.slice(3).join('_') || 'demo_user_1';
      return {
        uid,
        email: `${uid}@rojgarmitra.local`,
        role,
        preferredLocale: 'mr',
      };
    }

    throw new AuthError('Demo tokens disabled in this environment', 401);
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Fetch user document from Firestore to enforce stored role
    const userDoc = await adminDb.collection('users').doc(uid).get();
    let role: UserRole = 'candidate';
    let preferredLocale: SupportedLocale = 'mr';

    if (userDoc.exists) {
      const data = userDoc.data();
      if (data?.role) {
        role = data.role as UserRole;
      }
      if (data?.preferredLocale) {
        preferredLocale = data.preferredLocale as SupportedLocale;
      }
    }

    return {
      uid,
      email: decodedToken.email,
      role,
      preferredLocale,
    };
  } catch (error: any) {
    console.error('[Auth Error] verifyIdToken failed:', error?.message);
    throw new AuthError('Invalid or expired Firebase ID token', 401);
  }
}

/**
 * Role guard helper for Next.js route handlers.
 */
export function requireRole(user: AuthenticatedUser, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError(
      `Forbidden: Required role [${allowedRoles.join(', ')}], but current user role is '${user.role}'`,
      403
    );
  }
}

/**
 * Standard JSON error response helper using Web Standard Response.
 */
export function handleApiError(error: any): Response {
  if (error instanceof AuthError) {
    const code = error.status === 403 ? 'FORBIDDEN' : error.status === 429 ? 'RATE_LIMITED' : 'UNAUTHORIZED';
    return Response.json(
      {
        error: {
          code,
          message: error.message,
        },
      },
      { status: error.status }
    );
  }

  console.error('[API Handler Error]:', error);
  return Response.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: error?.message || 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
