// Types métier de Bolus. Une "fiche" décrit un médicament : ses infos
// générales, sa forme injectable, sa forme per os / sonde, et les points
// de surveillance infirmière associés.

/** Une voie d'administration possible pour la forme injectable. */
export type IVoieAdministration = 'IVD' | 'IVL' | 'PSE' | 'IM' | 'SC'

/** Détails d'administration par voie injectable (IV, IM, SC...). */
export interface IFormeInjectble {
  solvant: string
  volumeDilution: string
  debitMlH: string | null
  goutttesMin: string | null
  voies: IVoieAdministration[]
  dureeAdministration: string | null
  notes: string | null
}

/** Détails d'administration par voie orale ou sonde d'alimentation. */
export interface IFormePerOs {
  ecrasable: boolean | null
  divisible: boolean | null
  passageEnSonde: boolean | null
  modalitesSonde: string | null
  notes: string | null
}

/** Un point de surveillance clinique spécifique à surveiller par l'infirmier. */
export interface ISurveillance {
  titre: string
  detail: string
}

/** Fiche médicament complète, unité de données centrale de l'app. */
export interface IFiche {
  id: string
  dci: string
  nomsCommerciaux: string[]
  /** Slug de la catégorie (voir ICategorie.slug) */
  categorie: string
  sousFamille: string
  indications: string[]
  antidote: string | null
  contreIndications: string[]
  injectable: IFormeInjectble | null
  perOsSonde: IFormePerOs | null
  surveillanceSpecifique: ISurveillance[]
  compatibilitesMajeures: string[]
  incompatibilitesAbsolues: string[]
  sourcesRcp: string[]
  dateRevision: string
}

/** Catégorie thérapeutique servant à classer et filtrer les fiches. */
export interface ICategorie {
  slug: string
  label: string
  sousFamilles: string[]
  /** Couleur de base saturée (voir CategorieCard pour son usage réel : les
   * cartes ne l'appliquent jamais en fond plein, seulement via color-mix()
   * pour un fond pâle teinté, ou pour le code deux lettres). */
  couleur: string
  /** Code deux lettres affiché sur les cartes (ex. "AI"), dans la couleur
   * saturée de la catégorie. */
  code: string
}
