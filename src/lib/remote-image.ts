const imageExtensionPattern = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:$|[?#])/i;
const privateHostnamePattern =
  /^(?:localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|169\.254(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|::1)$/i;

function toAbsoluteUrl(value: string, baseUrl: URL) {
  if (value.startsWith("//")) {
    return `${baseUrl.protocol}${value}`;
  }

  return new URL(value, baseUrl).toString();
}

export async function resolveRemoteImageUrl(value: string | null) {
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || privateHostnamePattern.test(url.hostname)) {
    return null;
  }

  if (imageExtensionPattern.test(url.toString())) {
    return url.toString();
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ZacCoverResolver/1.0)",
      },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok) return null;
    if (contentType.startsWith("image/")) return url.toString();
    if (!contentType.includes("text/html")) return null;

    const html = await response.text();
    const match = html.match(
      /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    );

    return match?.[1] ? toAbsoluteUrl(match[1], url) : null;
  } catch {
    return null;
  }
}

