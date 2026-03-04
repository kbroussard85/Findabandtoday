import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: handleLogin((req: any) => {
    try {
      if (!req || !req.url) {
        return { returnTo: '/directory' };
      }

      const url = new URL(req.url, 'http://localhost');
      const returnTo = url.searchParams.get('returnTo') || '/directory';
      const role = url.searchParams.get('role');

      return {
        returnTo,
        ...(role ? { authorizationParams: { role } } : {})
      };
    } catch (e) {
      console.error('Auth0 login error:', e);
      return { returnTo: '/directory' };
    }
  }),
});

export const POST = handleAuth();
