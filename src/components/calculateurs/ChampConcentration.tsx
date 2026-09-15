// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

import ChampNumerique from './ChampNumerique'
import ResultatCalcul from './ResultatCalcul'
import { parseNombre, formaterFR } from './nombreUtils'
import { concentrationDeLaDilution } from './concentrationUtils'
import type { IValeurCalculee, IValeurDirecte, UniteBase } from './concentrationUtils'

// Trois décimales, et non la seule décimale du débit : une dilution courante
// (4 mg dans 48 mL) donne 0,083 mg/mL, qu'un arrondi à 0,1 réduirait à "0,1"
// — un écart de 20 % sur la valeur qui sert ensuite au produit en croix.
const DECIMALES_CONCENTRATION = 3

// Un seul composant pour les deux concentrations (actuelle et cible) : elles
// se saisissent exactement de la même façon, et la seconde n'existe que pour
// être comparée à la première — une divergence de traitement entre les deux
// se lirait directement comme une erreur de conversion.
//
// L'unité est reçue, jamais choisie ici : elle est fixée une fois pour tout
// le calculateur (voir CalcConversion), pour qu'il soit impossible d'avoir
// une concentration en mg/mL face à une autre en µg/mL. Elle est donc
// affichée en suffixe de chaque champ, comme "mL/h" l'est pour le débit.
type IChampConcentrationProps =
  | {
      label: string
      mode: 'directe'
      unite: UniteBase
      valeur: IValeurDirecte
      onChange: (valeur: IValeurDirecte) => void
    }
  | {
      label: string
      mode: 'calculee'
      unite: UniteBase
      valeur: IValeurCalculee
      onChange: (valeur: IValeurCalculee) => void
    }

export default function ChampConcentration(props: IChampConcentrationProps) {
  const uniteConcentration = `${props.unite}/mL`

  if (props.mode === 'directe') {
    const { label, valeur, onChange } = props
    return (
      <ChampNumerique
        label={label}
        valeur={valeur.concentration}
        onChange={(concentration) => onChange({ concentration })}
        unite={uniteConcentration}
        placeholder="0"
      />
    )
  }

  const { label, valeur, onChange, unite } = props
  const concentration = concentrationDeLaDilution(parseNombre(valeur.quantite), parseNombre(valeur.volume))

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-texte">{label}</span>

      {/* Les deux champs côte à côte : ils forment une seule phrase — tant de
          milligrammes DANS tant de millilitres — et les lire sur une ligne
          évite d'avoir à faire défiler la modale entre la quantité et son
          volume. Aucun risque de confusion, les unités affichées diffèrent
          (mg ou µg d'un côté, mL de l'autre). */}
      <div className="flex gap-2">
        <ChampNumerique
          label="Quantité diluée"
          valeur={valeur.quantite}
          onChange={(quantite) => onChange({ ...valeur, quantite })}
          unite={unite}
          placeholder="0"
        />
        <ChampNumerique
          label="Volume total"
          valeur={valeur.volume}
          onChange={(volume) => onChange({ ...valeur, volume })}
          unite="mL"
          placeholder="0"
        />
      </div>

      {/* Le résultat intermédiaire est montré, pas seulement consommé : c'est
          la valeur que l'infirmier peut recouper avec l'étiquette de la
          seringue avant de faire confiance au débit calculé plus bas. Sur une
          seule ligne et en variante discrète, pour qu'il ne se lise pas comme
          une deuxième réponse à côté du débit équivalent. */}
      <ResultatCalcul
        label="Concentration obtenue"
        valeur={concentration !== null ? formaterFR(concentration, DECIMALES_CONCENTRATION) : null}
        unite={uniteConcentration}
        variante="discret"
        disposition="ligne"
      />
    </div>
  )
}
