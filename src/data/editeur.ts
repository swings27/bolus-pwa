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
  // Adresse de contact unique de l'application : mentions légales, page
  // Contact, politique de confidentialité et mails de retour bêta la lisent
  // tous ici. Il existait auparavant un APP.contact séparé, avec la même
  // valeur — deux constantes pour la même donnée, donc deux endroits à
  // changer le jour où cette adresse bougerait. Toute demande de contact,
  // quel qu'en soit le motif, arrive sur cette seule adresse.
  email: 'contact@bolus-app.fr',
  directeurPublication: 'Anna Trabaud-Lopez',
}

export const HEBERGEUR = {
  nom: 'Vercel Inc.',
  adresse: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  site: 'https://vercel.com',
}

// Plus de `version` ici : elle doublonnait __APP_VERSION__ (voir
// vite.config.ts, qui reflète la version de package.json) et les deux
// avaient divergé — l'écran Paramètres affichait 0.0.0 pendant que le mail
// de retour bêta annonçait 0.1.0, pour la même application. Une seule
// source désormais, package.json, lue partout via __APP_VERSION__.
export const APP = {
  siteWeb: 'https://bolus-app.fr',
}

// Bascule unique pour toute la période de bêta-test : pilote l'affichage du
// bouton flottant de retour (voir BoutonRetourBeta.tsx). À repasser à false
// une fois la bêta terminée, sans avoir à retoucher le composant lui-même.
export const MODE_BETA = true

// Distincte de MODE_BETA : celle-ci reflète l'état du CONTENU, pas celui de
// la période de test. Passée à false le 15 septembre 2026 : le catalogue ne
// contient plus de fiches de développement, ce sont les fiches finales
// issues des RCP. Le bandeau « Version de test — données non validées »
// disparaît donc (voir BandeauBeta.tsx) et le Header reprend sa gestion
// normale de la zone sûre iOS (voir Header.tsx), tandis que la bêta
// elle-même continue — MODE_BETA reste à true, le bouton flottant de retour
// est toujours là.
export const DONNEES_MOCK = false
