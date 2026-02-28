import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin((req) => {
    const { searchParams } = new URL(req.url);
    const returnTo = searchParams.get('returnTo');
    const role = searchParams.get('role');

    return {
      authorizationParams: {
        role: role, // This passes the role to Auth0
      },
      returnTo: returnTo || '/profile',
    };
  }),
});
