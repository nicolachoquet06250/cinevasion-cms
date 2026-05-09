import fs from 'fs/promises';
import path from 'path';
import { simpleGit, type SimpleGit } from 'simple-git';

const IMAGES_URL = process.env.GITHUB_PAGES_IMAGES ?? '/images';
const DATA_URL = process.env.GITHUB_PAGES_DATA ?? '/licences';

// Chemin vers le répertoire de données (peut être configuré via variable d'environnement)
// Par défaut, on cherche un dossier "cinevasion-data" à côté du projet CMS
export const DATA_DIR = process.env.CMS_DATA_DIR || path.join(process.cwd(), '..', 'cinevasion-data');
export const IMAGES_DIR = process.env.CMS_IMAGES_DIR || path.join(process.cwd(), '..', 'cinevasion-images');

const INDEX_FILE = path.join(DATA_DIR, 'index.json');
const LICENCES_DIR = path.join(DATA_DIR, 'licences');

let dataGitInstance: SimpleGit | null = null;
let imagesGitInstance: SimpleGit | null = null;

async function getDataGit() {
  if (!dataGitInstance) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    dataGitInstance = simpleGit(DATA_DIR);
  }
  return dataGitInstance;
}

async function getImagesGit() {
  if (!imagesGitInstance) {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    imagesGitInstance = simpleGit(IMAGES_DIR);
  }
  return imagesGitInstance;
}

async function ensureDirs() {
  await fs.mkdir(LICENCES_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });
}

export interface Movie {
  title: string;
  synopsis: string;
  releaseDate: string;
  image: string;
  trailerUrl?: string;
}

export interface Licence {
  slug: string;
  title: string;
  date?: string;
  movies?: Movie[];
  url?: string;
}

export async function getLicences() {
  try {
    const content = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

export async function getLicence(slug: string) {
  try {
    const licencePath = path.join(LICENCES_DIR, `${slug}.json`);
    const content = await fs.readFile(licencePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

export async function saveLicence(licence: Licence) {
  await ensureDirs();
  const git = await getDataGit();
  
  const licenceFilename = `${licence.slug}.json`;
  const licencePath = path.join(LICENCES_DIR, licenceFilename);
  const licenceData = {
    ...licence,
    date: licence.date || new Date().toISOString(),
    // L'URL dépendra de là où sont servis les fichiers statiques (ex: GitHub Pages ou autre domaine)
    url: `${DATA_URL}/${licenceFilename}`
  };

  // Sauvegarder le fichier individuel
  await fs.writeFile(licencePath, JSON.stringify(licenceData, null, 2), 'utf-8');

  // Mettre à jour l'index
  const licences = await getLicences();
  const index = [...licences];
  const existingIndex = index.findIndex((p: any) => p.slug === licence.slug);
  
  const summary = {
    slug: licence.slug,
    title: licence.title,
    url: licenceData.url,
    date: licenceData.date
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
    const relativeLicencePath = path.relative(DATA_DIR, licencePath);
    const relativeIndexPath = path.relative(DATA_DIR, INDEX_FILE);

    await git.add([relativeLicencePath, relativeIndexPath]);
    await git.commit(`CMS: update licence ${licence.slug}`);
    await git.push();
    console.log(`Committed and pushed changes for ${licence.slug} to external repo`);
  } catch (err) {
    console.error('Git operation failed:', err);
  }

  return licenceData;
}

export async function saveImage(filename: string, buffer: Buffer) {
  await ensureDirs();
  const git = await getImagesGit();

  const filePath = path.join(IMAGES_DIR, filename);
  await fs.writeFile(filePath, buffer);

  try {
    await git.add(filename);
    await git.commit(`CMS: add image ${filename}`);
    await git.push();
    console.log(`Committed and pushed image ${filename} to external repo`);
  } catch (err) {
    console.error('Git operation for image failed:', err);
  }

  // Ici on retourne le lien qui sera stocké dans le JSON.
  // Idéalement ce serait l'URL brute (ex: raw.githubusercontent.com)
  // Pour l'instant on met un chemin relatif ou une convention.
  return `${IMAGES_URL}/${filename}`;
}
