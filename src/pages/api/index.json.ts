import type { APIRoute } from 'astro';
import {getLicences} from '../../lib/cms';

export const GET: APIRoute = async () => {
  const licences = await getLicences();

  return new Response(JSON.stringify(licences, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
