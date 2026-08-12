import type { APIRoute } from 'astro';

/**
 * Hand-generated sitemap. Emits XML for every real route on atharvapatil.tech.
 * Priority + changefreq are opinionated: home + status + resume update most
 * frequently; case studies and services less so; accessibility/contact
 * rarely. Priority ranges 0.4 → 1.0.
 *
 * Route list is the source of truth — keep in sync with src/pages/*.astro
 * plus the nested /mission-os/demo route.
 */

const SITE = 'https://atharvapatil.tech';

const routes: Array<{ path: string; priority: number; changefreq: string }> = [
  { path: '/',                  priority: 1.0, changefreq: 'weekly' },
  { path: '/work/',             priority: 0.9, changefreq: 'weekly' },
  { path: '/mission-os/',       priority: 0.9, changefreq: 'weekly' },
  { path: '/mission-os/demo/',  priority: 0.8, changefreq: 'monthly' },
  { path: '/nexus/',            priority: 0.9, changefreq: 'weekly' },
  { path: '/kanvaz/',           priority: 0.8, changefreq: 'monthly' },
  { path: '/pursue-os/',        priority: 0.8, changefreq: 'weekly' },
  { path: '/3d/',               priority: 0.7, changefreq: 'monthly' },
  { path: '/services/',         priority: 0.7, changefreq: 'monthly' },
  { path: '/about/',            priority: 0.7, changefreq: 'monthly' },
  { path: '/resume/',           priority: 0.8, changefreq: 'monthly' },
  { path: '/contact/',          priority: 0.6, changefreq: 'yearly' },
  { path: '/status/',           priority: 0.7, changefreq: 'weekly' },
  { path: '/accessibility/',    priority: 0.4, changefreq: 'yearly' },
  { path: '/privacy/',          priority: 0.4, changefreq: 'yearly' },
  { path: '/terms/',            priority: 0.4, changefreq: 'yearly' },
  { path: '/editorial/',        priority: 0.4, changefreq: 'yearly' },
];

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = routes.map((r) =>
    `  <url>\n` +
    `    <loc>${SITE}${r.path}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${r.changefreq}</changefreq>\n` +
    `    <priority>${r.priority.toFixed(1)}</priority>\n` +
    `  </url>`
  ).join('\n');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
