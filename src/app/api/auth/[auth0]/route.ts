import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    login: handleLogin((req: any) => {
        const url = new URL(req.url, 'http://localhost');
        const returnTo = url.searchParams.get('returnTo');
        const role = url.searchParams.get('role');

        return {
            authorizationParams: {
                ...(role && { role }),
            },
            returnTo: returnTo || '/directory',
        };
    }),
});

export const POST = handleAuth();
