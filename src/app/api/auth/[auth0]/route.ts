import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      // This ensures the audience is set for your API calls
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email'
    },
    returnTo: '/upgrade', // Directs users back to the upgrade flow after login
  }),
});

export const POST = handleAuth();
