import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { IMAGES_DIR } from '../../lib/cms';

export const GET: APIRoute = async ({ params }) => {
  const { filename } = params;

  if (!filename) {
    return new Response(JSON.stringify({ error: 'Nom de fichier non fourni' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  const filePath = path.join(IMAGES_DIR, filename);

  try {
    const buffer = await fs.readFile(filePath);
    
    // Détection basique du type MIME par extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg';
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Image non trouvée' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
