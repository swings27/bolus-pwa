// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce fichier ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

import { nombrePositif, parseNombre } from './nombreUtils'

export type ModeConcentration = 'directe' | 'calculee'

/** Unité choisie une seule fois pour tout le calculateur : elle vaut pour la
 * concentration actuelle ET pour la cible. Deux unités différentes à l'écran
 * en même temps, c'est un facteur 1000 qui ne se voit pas — on ne les mélange
 * donc jamais, on convertit ses valeurs avant de les saisir. */
export type UniteBase = 'mg' | 'µg'

/** Unité affichée pour une concentration (mg → mg/mL). */
export type UniteConcentration = `${UniteBase}/mL`

/** Concentration lue directement sur l'étiquette de la seringue. */
export interface IValeurDirecte {
  concentration: string
}

/** Concentration à déduire d'une quantité diluée dans un volume total. */
export interface IValeurCalculee {
  quantite: string
  volume: string
}

/** Concentration d'une quantité diluée dans un volume, dans l'unité courante
 * (la division ne change pas l'unité du numérateur : des mg dans des mL font
 * des mg/mL). Renvoie null dès qu'un des deux champs est vide ou nul : un
 * volume à zéro ne donne pas une concentration infinie, il signale une saisie
 * incomplète. */
export function concentrationDeLaDilution(quantite: number | null, volume: number | null): number | null {
  const quantiteN = nombrePositif(quantite)
  const volumeN = nombrePositif(volume)
  if (quantiteN === null || volumeN === null) return null
  return nombrePositif(quantiteN / volumeN)
}

/** Concentration d'un champ, quelle que soit la façon dont elle a été saisie
 * — le produit en croix n'a ainsi pas à savoir si la valeur vient de
 * l'étiquette ou d'une dilution. Les deux formes de saisie sont conservées
 * côte à côte par l'appelant (voir CalcConversion), d'où les deux arguments :
 * `mode` dit laquelle fait foi à cet instant. */
export function concentrationSaisie(
  mode: ModeConcentration,
  directe: IValeurDirecte,
  calculee: IValeurCalculee,
): number | null {
  if (mode === 'directe') return nombrePositif(parseNombre(directe.concentration))
  return concentrationDeLaDilution(parseNombre(calculee.quantite), parseNombre(calculee.volume))
}

/** Produit en croix : à quantité de substance délivrée identique, une
 * seringue deux fois plus concentrée se règle à un débit deux fois plus
 * faible.
 *
 *   concentrationActuelle × débitActuel = concentrationCible × débitCible
 *
 * Aucune conversion d'unité ici, et ce n'est pas un oubli : les deux
 * concentrations partagent forcément la même unité (voir UniteBase), qui se
 * simplifie donc dans le rapport. Le résultat est le même en mg/mL ou en
 * µg/mL, sans le détour par un pivot qui ferait passer 20 µg/mL par 0,02 et
 * introduirait une erreur d'arrondi là où il n'y en avait aucune.
 *
 * Renvoie null si l'un des trois champs manque ou est nul — notamment une
 * concentration cible à zéro, qui n'a pas de débit correspondant. */
export function debitEquivalent(
  concentrationActuelle: number | null,
  debitActuel: number | null,
  concentrationCible: number | null,
): number | null {
  const actuelle = nombrePositif(concentrationActuelle)
  const debit = nombrePositif(debitActuel)
  const cible = nombrePositif(concentrationCible)
  if (actuelle === null || debit === null || cible === null) return null
  return nombrePositif((actuelle * debit) / cible)
}
