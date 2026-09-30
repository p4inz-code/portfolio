import { buildKb } from '../data/chat-kb.ts';

// Static JSON generated at build time from the same data the pages render.
// The chat function fetches this at request time (functions/api/chat.ts).
export const GET = () =>
  new Response(JSON.stringify(buildKb()), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
