// Types métier de Bolus. Une "fiche" décrit un médicament : ses infos
// générales, sa forme injectable, sa forme per os / sonde, et les points
// de surveillance infirmière associés.

/** Une voie d'administration possible pour la forme injectable. */
export type IVoieAdministration = 'IVD' | 'IVL' | 'PSE' | 'IM' | 'SC'

/** Une ligne de posologie structurée pour une population donnée. */
export interface IPosologie {
  population: string
  dose: string
  intervalle: string
  maxParJour: string
  /** Précision optionnelle affichée à côté du maximum (ex. "4 doses"). */
  maxParJourDetail: string | null
}

/** Bloc de préparation avant administration (perfusion courte, reconstitution...). */
export interface IPreparationInjectable {
  /** Étiquette courte affichée en badge (ex. "PERF"). */
  badge: string
  duree: string
  description: string
  stabilite: string | null
}

/** État d'une contrainte d'administration pour une forme galénique donnée. */
export type IEtatFormeGalenique = 'oui' | 'non' | 'a-verifier' | 'deja-liquide' | 'non-ouvrable'

/** Une forme galénique disponible pour la voie orale/sonde, avec ses contraintes. */
export interface IFormeGalenique {
  nom: string
  secable: IEtatFormeGalenique
  ecrasable: IEtatFormeGalenique
}

/** Forme à privilégier en cas de passage en sonde (voir IFormePerOs.formeAPrivilegier). */
export interface IFormeAPrivilegier {
  nom: string
  /** Nom commercial associé à cette forme précise, distinct des noms
   * commerciaux génériques de la fiche (IFiche.nomsCommerciaux). */
  marque: string | null
  note: string | null
  alternative: string | null
}

/** Détails d'administration par voie injectable (IV, IM, SC...). */
export interface IFormeInjectable {
  solvant: string
  volumeDilution: string
  debitMlH: string | null
  gouttesMin: string | null
  voies: IVoieAdministration[]
  dureeAdministration: string | null
  notes: string | null
  /** Remplace l'affichage générique (solvant/débit/voies) quand présent. */
  preparation: IPreparationInjectable | null
  incompatibiliteY: string[] | null
  posologies: IPosologie[] | null
  ajustementPosologique: string | null
}

/** Détails d'administration par voie orale ou sonde d'alimentation. */
export interface IFormePerOs {
  ecrasable: boolean | null
  divisible: boolean | null
  passageEnSonde: boolean | null
  modalitesSonde: string | null
  notes: string | null
  formeAPrivilegier: IFormeAPrivilegier | null
  formesDisponibles: IFormeGalenique[] | null
  posologies: IPosologie[] | null
  ajustementPosologique: string | null
}

/** Un point de surveillance clinique spécifique à surveiller par l'infirmier. */
export interface ISurveillance {
  titre: string
  detail: string
}

/** Grossesse et allaitement, contenu fixe (pas une liste dépliable comme
 * surveillanceSpecifique/interactionsMedicamenteuses). */
export interface IGrossesseAllaitement {
  grossesse: string
  allaitement: string
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
  injectable: IFormeInjectable | null
  perOsSonde: IFormePerOs | null
  surveillanceSpecifique: ISurveillance[]
  interactionsMedicamenteuses: ISurveillance[] | null
  grossesseAllaitement: IGrossesseAllaitement | null
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
