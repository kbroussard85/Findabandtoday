import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin((req) => {
    try {
      const url = new URL(req.url || '', 'http://localhost');
      const role = url.searchParams.get('role');
      const returnTo = url.searchParams.get('returnTo') || '/directory';

      return {
        authorizationParams: {
          ...(role ? { role } : {}),
        },
        returnTo,
      };
    } catch {
      return { returnTo: '/directory' };
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
