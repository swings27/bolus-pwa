// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

import { useState } from 'react'
import ChampNumerique from './ChampNumerique'
import ChampConcentration from './ChampConcentration'
import BasculeModeConcentration from './BasculeModeConcentration'
import ResultatCalcul from './ResultatCalcul'
import BoutonReinitialiser from './BoutonReinitialiser'
import SegmentedControl from '../layout/SegmentedControl'
import { parseNombre, formaterFR } from './nombreUtils'
import { concentrationSaisie, debitEquivalent } from './concentrationUtils'
import type { IValeurCalculee, IValeurDirecte, ModeConcentration, UniteBase } from './concentrationUtils'

const UNITES: UniteBase[] = ['mg', 'µg']

const DIRECTE_VIDE: IValeurDirecte = { concentration: '' }
const CALCULEE_VIDE: IValeurCalculee = { quantite: '', volume: '' }

// Les deux formes de saisie d'une même concentration cohabitent en mémoire
// plutôt que de partager un seul champ : la bascule de mode s'applique aux
// deux concentrations à la fois (voir plus bas), et sans cette conservation,
// aller calculer une concentration effacerait celle déjà lue sur l'autre
// seringue. Seule celle désignée par le mode courant est affichée et
// utilisée dans le calcul.
interface IConcentration {
  directe: IValeurDirecte
  calculee: IValeurCalculee
}

const CONCENTRATION_VIDE: IConcentration = { directe: DIRECTE_VIDE, calculee: CALCULEE_VIDE }

// Conversion de concentration : à quelle vitesse régler une seringue
// préparée à une concentration donnée pour délivrer autant de substance par
// heure qu'une autre, préparée différemment. Aucun seuil, aucune valeur de
// référence — uniquement le produit en croix entre ce que l'utilisateur
// saisit.
export default function CalcConversion() {
  const [mode, setMode] = useState<ModeConcentration>('directe')
  const [unite, setUnite] = useState<UniteBase>('mg')
  const [actuelle, setActuelle] = useState<IConcentration>(CONCENTRATION_VIDE)
  const [debitActuel, setDebitActuel] = useState('')
  const [cible, setCible] = useState<IConcentration>(CONCENTRATION_VIDE)

  // Les deux concentrations sont dans la même unité par construction : le
  // rapport se simplifie, aucune conversion n'a lieu entre la saisie et le
  // résultat (voir debitEquivalent).
  const debitCible = debitEquivalent(
    concentrationSaisie(mode, actuelle.directe, actuelle.calculee),
    parseNombre(debitActuel),
    concentrationSaisie(mode, cible.directe, cible.calculee),
  )

  // Proposé dès qu'il y a quelque chose à effacer, et pas seulement quand le
  // résultat aboutit : le mode et l'unité font partie de ce que le bouton
  // remet à zéro, et c'est justement après une saisie restée incomplète
  // qu'on veut pouvoir repartir de la feuille blanche.
  const aQuelqueChoseAEffacer =
    mode !== 'directe' ||
    unite !== 'mg' ||
    debitActuel !== '' ||
    [actuelle, cible].some(
      (c) => c.directe.concentration !== '' || c.calculee.quantite !== '' || c.calculee.volume !== '',
    )

  function reinitialiser() {
    setMode('directe')
    setUnite('mg')
    setActuelle(CONCENTRATION_VIDE)
    setDebitActuel('')
    setCible(CONCENTRATION_VIDE)
  }

  // Un seul mode et une seule unité pour les deux concentrations : elles se
  // comparent l'une à l'autre, et un réglage par champ laisserait comparer
  // des milligrammes à des microgrammes sans que rien ne le signale — un
  // facteur 1000 invisible sur un débit de pousse-seringue.
  function champ(label: string, valeur: IConcentration, onChange: (valeur: IConcentration) => void) {
    return mode === 'directe' ? (
      <ChampConcentration
        label={label}
        mode="directe"
        unite={unite}
        valeur={valeur.directe}
        onChange={(directe) => onChange({ ...valeur, directe })}
      />
    ) : (
      <ChampConcentration
        label={label}
        mode="calculee"
        unite={unite}
        valeur={valeur.calculee}
        onChange={(calculee) => onChange({ ...valeur, calculee })}
      />
    )
  }

  return (
    // gap-4 plutôt que le gap-5 des autres calculateurs : celui-ci a deux
    // réglages en plus (mode et unité), et c'est le seul dont le contenu
    // dépasse franchement la hauteur d'écran d'un téléphone.
    <div className="flex flex-col gap-4">
      {/* Pas de libellé au-dessus de la bascule : les deux boutons sont des
          phrases complètes, un intitulé « Saisie des concentrations » ne
          ferait que répéter ce qu'ils disent déjà. */}
      <BasculeModeConcentration mode={mode} onChange={setMode} />

      <div className="flex flex-col gap-1.5">
        {/* Le libellé suit le mode : en saisie directe l'unité qualifie les
            concentrations elles-mêmes, en mode calculé la quantité qu'on
            dilue — c'est la même unité de base dans les deux cas. */}
        <span className="text-xs text-texte-doux">
          {mode === 'directe' ? 'Unité des concentrations' : 'Unité des quantités diluées'}
        </span>
        <SegmentedControl
          options={UNITES.map((valeurUnite) => ({
            valeur: valeurUnite,
            label: mode === 'directe' ? `${valeurUnite}/mL` : valeurUnite,
          }))}
          valeur={unite}
          onChange={setUnite}
          classeBouton="px-2 py-2"
        />
      </div>

      {/* En saisie directe, la concentration actuelle et le débit actuel
          décrivent la même seringue, celle qui tourne : ils tiennent sur une
          ligne, ce qui les groupe autant que ça raccourcit la modale.
          items-end aligne les deux champs par le bas : sous 340 px de large
          (iPhone SE), « Concentration actuelle » passe sur deux lignes de
          libellé quand « Débit actuel » en garde une, et sans cet alignement
          les deux cadres de saisie se décaleraient d'une hauteur de ligne.
          En mode calculé, la concentration actuelle est un bloc de deux
          champs plus son résultat : rien à appairer, le débit reprend toute
          la largeur en dessous. */}
      {mode === 'directe' ? (
        <div className="flex items-end gap-2">
          {champ('Concentration actuelle', actuelle, setActuelle)}
          <ChampNumerique
            label="Débit actuel"
            valeur={debitActuel}
            onChange={setDebitActuel}
            unite="mL/h"
            placeholder="0"
          />
        </div>
      ) : (
        <>
          {champ('Concentration actuelle', actuelle, setActuelle)}
          <ChampNumerique
            label="Débit actuel"
            valeur={debitActuel}
            onChange={setDebitActuel}
            unite="mL/h"
            placeholder="0"
          />
        </>
      )}

      {champ('Concentration cible', cible, setCible)}

      <div className="pt-2">
        <ResultatCalcul
          label="Débit équivalent"
          valeur={debitCible !== null ? formaterFR(debitCible, 1) : null}
          unite="mL/h"
        />
        <p className="mt-2 text-xs italic" style={{ color: 'var(--texte-doux)' }}>
          Vérifiez toujours le résultat avant de régler le pousse-seringue.
        </p>
      </div>

      {aQuelqueChoseAEffacer && <BoutonReinitialiser onClick={reinitialiser} />}
    </div>
  )
}
