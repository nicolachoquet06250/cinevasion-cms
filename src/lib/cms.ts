import fs from 'fs/promises';
import path from 'path';
import { simpleGit } from 'simple-git';

// Chemin vers le répertoire de données (peut être configuré via variable d'environnement)
// Par défaut, on cherche un dossier "cinevasion-data" à côté du projet CMS
const DATA_DIR = process.env.CMS_DATA_DIR || path.join(process.cwd(), '..', 'cinevasion-data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');
const POSTS_DIR = path.join(DATA_DIR, 'posts');

// On initialise git dans le répertoire de données
const git = simpleGit(DATA_DIR);

async function ensureDirs() {
  await fs.mkdir(POSTS_DIR, { recursive: true });
}

export async function getPosts() {
  try {
    const content = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

export async function savePost(post: { slug: string, title: string, content: string, date?: string }) {
  await ensureDirs();
  
  const postFilename = `${post.slug}.json`;
  const postPath = path.join(POSTS_DIR, postFilename);
  const postData = {
    ...post,
    date: post.date || new Date().toISOString(),
    // L'URL dépendra de là où sont servis les fichiers statiques (ex: GitHub Pages ou autre domaine)
    url: `/posts/${postFilename}`
  };

  // Sauvegarder le fichier individuel
  await fs.writeFile(postPath, JSON.stringify(postData, null, 2), 'utf-8');

  // Mettre à jour l'index
  const posts = await getPosts();
  const index = [...posts];
  const existingIndex = index.findIndex(p => p.slug === post.slug);
  
  const summary = {
    slug: post.slug,
    title: post.title,
    url: postData.url,
    date: postData.date
  };

  if (existingIndex >= 0) {
    index[existingIndex] = summary;
  } else {
    index.push(summary);
  }

  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');

  // Commit et Push Git
  try {
    // Dans simple-git initialisé avec baseDir, on peut utiliser des chemins relatifs
    const relativePostPath = path.relative(DATA_DIR, postPath);
    const relativeIndexPath = path.relative(DATA_DIR, INDEX_FILE);

    await git.add([relativePostPath, relativeIndexPath]);
    await git.commit(`CMS: update post ${post.slug}`);
    await git.push();
    console.log(`Committed and pushed changes for ${post.slug} to external repo`);
  } catch (err) {
    console.error('Git operation failed:', err);
  }

  return postData;
}
