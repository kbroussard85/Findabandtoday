import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

const authHandler = handleAuth({
  login: handleLogin({
    authorizationParams: {
      // This ensures the audience is set for your API calls
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email'
    },
    returnTo: '/profile', // Redirect to /profile since /upgrade is missing
  }),
});

export const GET = authHandler;
export const POST = authHandler;
