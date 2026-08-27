// Clés de la table Dexie "parametres" (voir db/index.ts), centralisées ici
// plutôt que dupliquées en chaîne littérale à chaque site de lecture/écriture.
// Avant ce fichier, "fiches_version" par exemple était déclarée
// indépendamment dans useFichesLoader.ts ET retourBeta.ts (même valeur, deux
// constantes sans lien), et relue en dur dans Parametres.tsx sans passer par
// aucune des deux — un renommage à un seul endroit aurait cassé les autres
// silencieusement, sans erreur de compilation. Importer ces constantes
// partout transforme ce risque en simple erreur TypeScript si jamais un site
// d'usage est oublié.
//
// Exception : le script inline anti-flash de thème dans index.html a sa
// propre copie de la valeur de CLE_THEME ("theme"), lue depuis localStorage
// avant même que React (et donc cet import) ne puisse s'exécuter — à garder
// synchronisée manuellement si cette valeur change un jour.
export const CLE_THEME = 'theme'
export const CLE_DISCLAIMER_ACCEPTE = 'disclaimer_accepte'
export const CLE_FICHES_VERSION = 'fiches_version'
export const CLE_FICHES_DATE_CATALOGUE = 'fiches_date_catalogue'
export const CLE_STOCKAGE_PERSISTANT = 'stockage_persistant'
export const CLE_NOMBRE_SESSIONS = 'nombre_sessions'
export const CLE_INSTALL_BANNER_MASQUE = 'install_banner_masque'
export const CLE_HISTORIQUE_RECHERCHE = 'historique_recherche'
export const CLE_FAVORIS = 'favoris'
