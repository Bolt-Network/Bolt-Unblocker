import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
    // 1. Clear all server-side cookies by name
    // You need to enumerate them — Astro's cookies API doesn't have a "clear all"
    const cookieNames = ['session', 'auth-token', 'refresh-token']; // your actual cookie names

    for (const name of cookieNames) {
        cookies.delete(name, {
            path: '/',
            // match the same domain/secure settings you used when setting them
        });
    }

    // 2. If you have server-side sessions (e.g. Redis, DB), destroy them here
    // await sessionStore.destroy(sessionId);

    return new Response(null, {
        status: 200,
        headers: {
            // 3. Tell the browser to clear ALL site data — cookies, cache, storage
            'Clear-Site-Data': '"cache", "cookies", "storage"',
            'Content-Type': 'application/json',
        },
    });
};