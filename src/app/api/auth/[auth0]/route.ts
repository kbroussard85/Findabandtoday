import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: handleLogin((req: any) => {
    try {
      const url = new URL(req.url);
      const role = url.searchParams.get('role');
      const returnTo = url.searchParams.get('returnTo') || '/profile';

      return {
        authorizationParams: {
          audience: process.env.AUTH0_AUDIENCE,
          scope: 'openid profile email',
          ...(role ? { role } : {}),
        },
        returnTo,
      };
    } catch {
      return { returnTo: '/profile' };
    }
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logout: handleLogout((req: any) => {
    try {
      const url = new URL(req.url);
      const returnTo = url.searchParams.get('returnTo') || process.env.AUTH0_BASE_URL || '/';
      return {
        returnTo,
      };
    } catch {
      return { returnTo: process.env.AUTH0_BASE_URL || '/' };
    }
  }),
});

export const POST = handleAuth();
