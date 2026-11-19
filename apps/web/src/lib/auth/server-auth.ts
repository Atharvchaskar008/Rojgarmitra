import { NextRequest, NextResponse } from 'next/server';
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

/**
 * Verifies the Firebase ID Token from the Authorization header and fetches the user's role from Firestore.
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or malformed Authorization header. Expected Bearer <token>', 401);
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    throw new AuthError('Token is empty', 401);
  }

  // Demo fallback token for testing and offline development
  if (token.startsWith('demo_token_') && (process.env.APP_MODE === 'demo' || process.env.NODE_ENV === 'test')) {
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
 * Standard JSON error response helper.
 */
export function handleApiError(error: any) {
  if (error instanceof AuthError) {
    return NextResponse.json(
      {
        error: {
          code: error.status === 403 ? 'FORBIDDEN' : 'UNAUTHORIZED',
          message: error.message,
        },
      },
      { status: error.status }
    );
  }

  console.error('[API Handler Error]:', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: error?.message || 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
