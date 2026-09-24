import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
  const body = [
    "User-agent: *",
    "Disallow: /api/",
    "Disallow: /collection",
    `Sitemap: ${url.origin}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "content-type": "text/plain", "cache-control": "public, max-age=86400" },
  });
};
