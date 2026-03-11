import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin((req) => {
    try {
      const url = new URL(req.url || '', 'http://localhost');
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
  logout: handleLogout((req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const returnTo = url.searchParams.get('returnTo') || process.env.AUTH0_BASE_URL || '/';
    return {
      returnTo,
    };
  }),
});

export const POST = handleAuth();
