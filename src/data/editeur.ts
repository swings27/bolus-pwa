// Informations légales centralisées : les pages Mentions légales, Contact
// et CGU les lisent d'ici plutôt que de les répéter en dur, pour qu'une
// mise à jour (changement d'adresse, obtention du SIRET...) se fasse en un
// seul endroit. Tant que des champs ci-dessous restent entre crochets,
// scripts/verif-editeur.mjs fait échouer npm run build:prod — voir ce
// script pour le détail du garde-fou. (Ne pas faire figurer le marqueur
// littéral dans ce commentaire : le script le repère par simple recherche
// de sous-chaîne dans tout le fichier, y compris les commentaires.)
export const EDITEUR = {
  nom: 'Anna Trabaud-Lopez',
  statut: 'Micro-entreprise (entreprise individuelle)',
  siret: '[À COMPLÉTER — en cours de création]',
  adresse: '3 Cours Victor Hugo, 33150 Cenon, France',
  email: 'contact@bolus-app.fr',
  directeurPublication: 'Anna Trabaud-Lopez',
}

export const HEBERGEUR = {
  nom: 'Vercel Inc.',
  adresse: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  site: 'https://vercel.com',
}

// version : constante indépendante de __APP_VERSION__ (voir vite.config.ts,
// qui reflète la version de package.json) — celle-ci est la version
// affichée dans les pages légales, mise à jour manuellement si elle doit un
// jour diverger de la version applicative.
export const APP = {
  version: '0.1.0',
  contact: 'contact@bolus-app.fr',
  siteWeb: 'https://bolus-app.fr',
}
