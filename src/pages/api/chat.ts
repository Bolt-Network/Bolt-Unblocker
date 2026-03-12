import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return new Response(
            JSON.stringify({ error: "API key not configured on server." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return new Response(
            JSON.stringify({ error: "Invalid JSON body." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": request.headers.get("origin") ?? "",
            "X-Title": "Bolt AI",
        },
        body: JSON.stringify(body),
    });

    const data = await upstream.json();

    return new Response(JSON.stringify(data), {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
    });
};