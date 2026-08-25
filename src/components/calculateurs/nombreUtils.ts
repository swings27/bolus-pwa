// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce fichier ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

// Convertit une saisie (déjà normalisée en point par ChampNumerique) en
// nombre, ou null si vide / invalide — jamais NaN propagé dans un calcul.
export function parseNombre(valeur: string): number | null {
  if (valeur.trim() === '') return null
  const n = Number(valeur)
  return Number.isFinite(n) ? n : null
}

// Formate en virgule française avec au plus `decimales` décimales, sans
// zéro inutile (125 → "125", 62.5 → "62,5").
export function formaterFR(valeur: number, decimales: number): string {
  return valeur.toLocaleString('fr-FR', { maximumFractionDigits: decimales })
}
