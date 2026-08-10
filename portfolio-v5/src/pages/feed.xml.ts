import type { APIRoute } from 'astro';
import { CHANGELOG } from '../data/changelog';
import { SITE, CONTACT } from '../data/site';

/**
 * RSS 2.0 feed for the site changelog. Every version bump becomes an
 * <item>. Lets readers subscribe to updates without polling /status.
 */

const SITE_URL = 'https://atharvapatil.tech';

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = () => {
  const now = new Date();
  const pubDate = now.toUTCString();

  const items = CHANGELOG.map((entry, i) => {
    // Space entries one day apart backwards from today so RSS readers
    // sort them in the intended (newest-first) order without relying on
    // a real per-entry date we don't have.
    const d = new Date(now.getTime() - i * 86400000);
    const guid = `${SITE_URL}/status/#${entry.version.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const bodyHtml = entry.body.map((p) => `&lt;p&gt;${escapeXml(p)}&lt;/p&gt;`).join('');
    return (
      `    <item>\n` +
      `      <title>${escapeXml(entry.version)} — ${escapeXml(entry.summary)}</title>\n` +
      `      <link>${guid}</link>\n` +
      `      <guid isPermaLink="false">${guid}</guid>\n` +
      `      <pubDate>${d.toUTCString()}</pubDate>\n` +
      `      <description>${bodyHtml}</description>\n` +
      `    </item>`
    );
  }).join('\n');

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml(SITE.title)} — changelog</title>\n` +
    `    <link>${SITE_URL}/status/</link>\n` +
    `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n` +
    `    <description>${escapeXml(SITE.description)}</description>\n` +
    `    <language>en</language>\n` +
    `    <managingEditor>${CONTACT.email} (${SITE.title})</managingEditor>\n` +
    `    <webMaster>${CONTACT.email} (${SITE.title})</webMaster>\n` +
    `    <lastBuildDate>${pubDate}</lastBuildDate>\n` +
    `    <generator>Astro ${5.18}</generator>\n` +
    `${items}\n` +
    `  </channel>\n` +
    `</rss>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
