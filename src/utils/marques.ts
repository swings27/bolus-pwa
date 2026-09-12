// Exigence légale (marque déposée) : tout nom commercial affiché doit porter
// le symbole ® — centralisé ici pour ne jamais l'omettre à un nouveau point
// d'affichage. N'agit qu'à l'affichage, jamais sur les données stockées
// (fiche.nomsCommerciaux reste tel que publié dans le JSON source), pour ne
// pas mêler typographie légale et recherche/indexation (useSearch).
export function avecMarqueDeposee(noms: string[]): string[] {
  return noms.map((nom) => `${nom}®`)
}
