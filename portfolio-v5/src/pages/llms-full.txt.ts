import { llmsFull } from '../lib/machine-docs.ts';

// Generated at build time from the same data the pages render.
export const GET = () =>
  new Response(llmsFull(), {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'access-control-allow-origin': '*' },
  });
