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
  'acide-tranexamique': { categorie: 'cardiovasculaire', sousFamille: 'Hémostatiques' },
  adrenaline: { categorie: 'cardiovasculaire', sousFamille: 'Cardiotropes' },
  amiodarone: { categorie: 'cardiovasculaire', sousFamille: 'Cardiotropes' },
  amoxicilline: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  'amoxicilline-acide-clavulanique': { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  atropine: { categorie: 'cardiovasculaire', sousFamille: 'Cardiotropes' },
  cefotaxime: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques'},
  'chlorure-de-potassium': { categorie: 'electrolytes', sousFamille: '' },
  ciprofloxacine: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques'},
  diazepam: { categorie: 'psychotropes', sousFamille: 'Anticonvulsivants' },
  enoxaparine: { categorie: 'cardiovasculaire', sousFamille: 'Anticoagulants' },
  fosfomycine: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  furosemide: { categorie: 'cardiovasculaire', sousFamille: 'Diurétiques' },
  gentamicine: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  'heparine-calcique': { categorie: 'cardiovasculaire', sousFamille: 'Anticoagulants' },
  'heparine-sodique': { categorie: 'cardiovasculaire', sousFamille: 'Anticoagulants' },
  hydrocortisone: { categorie: 'endocrinologie', sousFamille: 'Corticoïdes'},
  ibuprofene: { categorie: 'antalgiques', sousFamille: 'AINS' },
  'imipenem-cilastatine': { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  ketamine: { categorie: 'anesthesiques', sousFamille: 'Généraux' },
  ketoprofene: { categorie: 'antalgiques', sousFamille: 'AINS' },
  levetiracetam: { categorie: 'psychotropes', sousFamille: 'Anticonvulsivants' },
  metronidazole: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  midazolam: { categorie: 'psychotropes', sousFamille: 'Hypnotiques' },
  nefopam: { categorie: 'antalgiques', sousFamille: 'Antalgiques palier 1'},
  nicardipine: { categorie: 'cardiovasculaire', sousFamille: 'Antihypertenseurs' },
  noradrenaline: { categorie: 'cardiovasculaire', sousFamille: 'Cardiotropes' },
  ondansetron: { categorie: 'gastrologie', sousFamille: 'Antiémétiques'},
  pantoprazole: { categorie: 'gastrologie', sousFamille: 'Protecteurs gastriques' },
  paracetamol: { categorie: 'antalgiques', sousFamille: 'Antalgiques palier 1' },
  'piperacilline-tazobactam': { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  phloroglucinol: { categorie: 'gastrologie', sousFamille: 'Antispasmodiques'},
  spiramycine: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques' },
  tramadol: { categorie: 'antalgiques', sousFamille: 'Antalgiques palier 2'},
  vancomycine: { categorie: 'anti-infectieux', sousFamille: 'Antibiotiques'},
}
