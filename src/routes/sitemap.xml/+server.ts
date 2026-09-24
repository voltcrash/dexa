import { navItems } from "$lib/nav.js";
import { abilities, moves, pokemon } from "$lib/server/dex.js";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
  const paths = [
    ...navItems.map((item) => item.href),
    ...pokemon.map((p) => `/pokemon/${p.slug}`),
    ...moves.map((m) => `/moves/${m.slug}`),
    ...abilities.map((a) => `/abilities/${a.slug}`),
  ];
  const urls = paths.map((path) => `<url><loc>${url.origin}${path}</loc></url>`).join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    {
      headers: {
        "content-type": "application/xml",
        "cache-control": "public, max-age=0, s-maxage=86400",
      },
    },
  );
};
