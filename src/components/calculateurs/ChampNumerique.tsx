// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

import { useId } from 'react'
import type { FocusEvent } from 'react'

interface IChampNumeriqueProps {
  label: string
  valeur: string
  onChange: (v: string) => void
  unite?: string
  placeholder?: string
}

// Ne garde que des chiffres et un unique séparateur décimal, normalisé en
// point (un clavier français produit une virgule). Filtrer à la frappe
// plutôt que valider après coup : impossible de saisir un caractère invalide.
function nettoyerSaisie(brut: string): string {
  let valeur = brut.replace(/,/g, '.').replace(/[^0-9.]/g, '')
  const premierPoint = valeur.indexOf('.')
  if (premierPoint !== -1) {
    valeur = valeur.slice(0, premierPoint + 1) + valeur.slice(premierPoint + 1).replace(/\./g, '')
  }
  return valeur
}

// 300ms : laisse le temps à l'animation d'apparition du clavier mobile de
// se terminer avant de recentrer le champ — le faire immédiatement au focus
// viserait une position que le clavier va ensuite recouvrir.
function gererFocus(evenement: FocusEvent<HTMLInputElement>) {
  const champ = evenement.currentTarget
  setTimeout(() => champ.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
}

export default function ChampNumerique({ label, valeur, onChange, unite, placeholder }: IChampNumeriqueProps) {
  const id = useId()
  const idUnite = `${id}-unite`

  return (
    <div className="flex flex-1 flex-col gap-1">
      <label htmlFor={id} className="text-xs text-texte-doux">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={valeur}
          onChange={(e) => onChange(nettoyerSaisie(e.target.value))}
          onFocus={gererFocus}
          placeholder={placeholder}
          // aria-describedby vers l'unité : un lecteur d'écran annonce le
          // label PUIS l'unité à chaque focus sur le champ ("Volume à
          // perfuser, mL"), indispensable ici puisque l'unité n'est jamais
          // dans le label lui-même (elle est affichée séparément, en
          // superposition dans le champ).
          aria-describedby={unite ? idUnite : undefined}
          // text-lg = 18px : en dessous, iOS zoome automatiquement au focus
          // et casse la mise en page.
          className="h-12 w-full min-w-0 rounded-lg border px-3 text-lg text-texte"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--nav-bordure)',
            paddingRight: unite ? '3.5rem' : undefined,
          }}
        />
        {unite && (
          <span
            id={idUnite}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: 'var(--texte-doux)' }}
          >
            {unite}
          </span>
        )}
      </div>
    </div>
  )
}
