import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const GET = handleAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: async (req: NextRequest, ctx: any) => {
    try {
      const url = new URL(req.url);
      const role = url.searchParams.get('role');
      const returnTo = url.searchParams.get('returnTo') || '/profile';

      return handleLogin(req, ctx, {
        authorizationParams: {
          audience: process.env.AUTH0_AUDIENCE,
          scope: 'openid profile email',
          ...(role ? { role } : {}),
        },
        returnTo,
      });
    } catch {
      return handleLogin(req, ctx, { returnTo: '/profile' });
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logout: async (req: NextRequest, ctx: any) => {
    try {
      const url = new URL(req.url);
      const returnTo = url.searchParams.get('returnTo') || process.env.AUTH0_BASE_URL || '/';
      return handleLogout(req, ctx, {
        returnTo,
      });
    } catch {
      return handleLogout(req, ctx, { returnTo: process.env.AUTH0_BASE_URL || '/' });
    }
  },
});

export const POST = handleAuth();
