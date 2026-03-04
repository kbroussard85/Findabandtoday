import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const GET = handleAuth({
    login: handleLogin((req: NextRequest) => {
        // Use a dummy base for relative URLs to avoid errors
        const url = new URL(req.url || '', 'http://n');
        const returnTo = url.searchParams.get('returnTo');
        const role = url.searchParams.get('role');

        return {
            authorizationParams: {
                role: role, // Pass role to Auth0 if needed
            },
            returnTo: returnTo || '/directory',
        };
    }),
});

export const POST = handleAuth();
