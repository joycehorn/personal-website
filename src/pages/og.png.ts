import type { APIRoute } from 'astro';
import { generateOgImage } from '../lib/og-generator';

export const GET: APIRoute = async () => {
  const pngBuffer = await generateOgImage('en');
  return new Response(pngBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
