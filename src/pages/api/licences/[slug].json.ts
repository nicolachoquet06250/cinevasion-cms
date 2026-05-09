import type { APIRoute } from 'astro';
import { getPost } from '../../../lib/cms';

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response(JSON.stringify({ error: 'Slug non fourni' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  const post = await getPost(slug);

  if (!post) {
    return new Response(JSON.stringify({ error: 'Article non trouvé' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return new Response(JSON.stringify(post, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
