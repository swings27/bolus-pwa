/** Métadonnée de classement pour une fiche, absente du JSON clinique
 * (public/data/<id>.json ne contient ni id, ni categorie, ni sousFamille —
 * ce sont des données cliniques pures, structurées par DCI). */
export interface IFicheMeta {
  /** Slug de catégorie, voir src/data/categories.ts. */
  categorie: string
  /** Doit correspondre exactement à une entrée de ICategorie.sousFamilles
   * pour la catégorie ci-dessus, sous peine de tomber dans le groupe
   * "Autres" de ListeCategorie. */
  sousFamille: string
}

// Une entrée par fichier de public/data/ (clé = nom de fichier sans
// extension, ex. "adrenaline" pour /data/adrenaline.json — toujours en
// ASCII, jamais accentué : ce sont ces clés qui servent d'id dans les URLs
// /fiche/:id, Dexie et les favoris). Sert de double registre : la
// correspondance catégorie pour le classement (Categories/ListeCategorie),
// ET la liste des fiches à charger par useFichesLoader — un fichier JSON
// ajouté dans public/data/ doit être déclaré ici pour apparaître dans l'app.
export const CATALOGUE_FICHES: Record<string, IFicheMeta> = {
  adrenaline: { categorie: 'cardiovasculaire', sousFamille: 'Cardiotropes' },
  amiodarone: { categorie: 'cardiovasculaire', sousFamille: 'Cardiotropes' },
  amoxicilline: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  'amoxicilline-acide-clavulanique': { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  atropine: { categorie: 'cardiovasculaire', sousFamille: 'Cardiotropes' },
  diazepam: { categorie: 'psychotropes', sousFamille: 'Anticonvulsivants' },
  gentamicine: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  ibuprofene: { categorie: 'antalgiques', sousFamille: 'AINS' },
  ketoprofene: { categorie: 'antalgiques', sousFamille: 'AINS' },
  metronidazole: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  nefopam: { categorie: 'antalgiques', sousFamille: 'Antalgiques palier 1'},
  paracetamol: { categorie: 'antalgiques', sousFamille: 'Antalgiques palier 1' },
  'piperacilline-tazobactam': { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  spiramycine: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  tramadol: { categorie: 'antalgiques', sousFamille: 'Antalgiques palier 2'},
}
