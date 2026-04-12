import { NextRequest, NextResponse } from 'next/server'

/**
 * Authentication context structure
 */
export interface AuthUser {
  id: string
  role: 'ADMIN' | 'SELLER'
}

/**
 * Middleware to extract authentication context and check role.
 * In a real production environment, this would verify a JWT.
 */
export const authenticate = async (request: NextRequest) => {
  // Placeholder for JWT verification logic returning an AuthUser
  // In a real app, you'd verify the cookie or Authorization header here
  const user: AuthUser | null = { id: 'admin-1', role: 'ADMIN' }; // Mock behavior

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'User authentication context is missing.' },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Higher-order logic to restrict access based on user role.
 * @param user The authenticated user
 * @param roles Array of allowed roles (e.g., ['ADMIN'])
 */
export const authorize = (user: AuthUser, roles: string[]) => {
  if (!roles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'This endpoint is restricted to users with elevated permissions.' },
      { status: 403 }
    );
  }
  return null;
}
