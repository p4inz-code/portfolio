import { changelogJson } from '../lib/machine-docs.ts';

// Generated at build time from the same data the pages render.
export const GET = () =>
  new Response(JSON.stringify(changelogJson(), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' },
  });
