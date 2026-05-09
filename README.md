# Cinevasion CMS (Headless JSON Static CMS)

Ce projet est un CMS Headless qui permet de gérer du contenu statique via une interface d'administration. Chaque action (création/modification) génère des fichiers JSON et effectue un commit automatique dans le repository Git.

## Fonctionnement

- **Interface d'administration** : Accessible via `/admin/licences`.
- **Génération JSON** : Les fichiers sont créés dans un répertoire externe (configurable).
- **Index Central** : Un fichier `index.json` liste tous les contenus.
- **Git** : Chaque modification déclenche un commit et un push automatique dans le dépôt de données externe.

## Configuration du dépôt de données

Par défaut, le CMS cherche un dossier nommé `cinevasion-data` au même niveau que le dossier du projet CMS.

Vous pouvez configurer le chemin via la variable d'environnement `CMS_DATA_DIR` :

```bash
# Exemple sur Windows (PowerShell)
$env:CMS_DATA_DIR = "C:\chemin\vers\votre\repo-data"
npm run dev
```

Le répertoire cible doit être un dépôt Git initialisé avec un "remote" configuré pour que le `push` fonctionne.

## Structure des données (dans le dépôt externe)

- `index.json` : Listing global.
- `posts/[slug].json` : Fichiers de contenu individuels.

## Installation et lancement

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

3. Accédez à l'administration : `http://localhost:4321/admin/licences`

## 🚀 Commandes

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installe les dépendances                         |
| `npm run dev`             | Lance le serveur de développement (SSR)          |
| `npm run build`           | Build l'application pour la production           |
| `npm run preview`         | Prévisualise le build localement                 |

## 👀 En savoir plus

- Basé sur [Astro](https://astro.build) en mode SSR.
- Utilise [simple-git](https://www.npmjs.com/package/simple-git) pour les commits automatiques.
