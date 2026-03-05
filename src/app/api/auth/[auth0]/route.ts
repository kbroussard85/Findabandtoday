import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: handleLogin((req: any) => {
    try {
      const url = new URL(req.url, 'http://localhost');
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
});

export const POST = handleAuth();
