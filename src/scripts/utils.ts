/**
 * Normalizes a URL by adding https:// if no protocol is specified.
 */
export function normalizeUrl(url: string): string {
    if (!url.match(/^https?:\/\//i)) {
        return `https://${url}`;
    }
    return url;
}

/**
 * Gets the favicon URL for a given URL using Google's favicon service.
 */
export function getFaviconUrl(url: string): string {
    try {
        const normalized = normalizeUrl(url);
        const urlObj = new URL(normalized);
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    } catch {
        // Fallback SVG icon
        return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><circle cx='12' cy='12' r='10'/></svg>";
    }
}

/**
 * Extracts the domain from a URL and removes "www.".
 */
export function extractDomain(url: string): string {
    try {
        return new URL(normalizeUrl(url)).hostname.replace("www.", "");
    } catch {
        return url;
    }
}
