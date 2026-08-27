import type { ReactNode } from 'react'

interface IOption<T extends string> {
  valeur: T
  label: ReactNode
}

interface ISegmentedControlProps<T extends string> {
  options: IOption<T>[]
  valeur: T
  onChange: (valeur: T) => void
  /** Par défaut adapté à 2-3 options avec un libellé sur une ligne ; réduire
   * pour une rangée plus dense (ex. 4 calibres avec légende sur deux lignes
   * dans CalcDebit). */
  classeBouton?: string
}

// Rangée de boutons à bascule (un seul actif à la fois) : forme/onglet/
// unité/calibre... Le même motif visuel était recopié dans 4 composants
// différents avant cette extraction, avec déjà un début de dérive entre
// les copies (couleur du texte inactif tantôt fixée, tantôt laissée par
// défaut).
//
// Couleurs pilotées par --segment-actif-*/--segment-inactif-* (index.css),
// pas des couleurs directes ici : en clair l'actif est le bleu pétrole
// plein et l'inactif un terracotta dilué, tandis qu'en sombre c'est
// l'inverse (actif = terracotta plein) — toute la logique "qui change
// entre les thèmes" reste en CSS, jamais une condition de thème en JS ici.
export default function SegmentedControl<T extends string>({
  options,
  valeur,
  onChange,
  classeBouton = 'px-4 py-3',
}: ISegmentedControlProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const actif = option.valeur === valeur
        return (
          <button
            key={option.valeur}
            type="button"
            onClick={() => onChange(option.valeur)}
            className={`flex flex-1 flex-col items-center justify-center rounded-lg text-sm transition-colors duration-150 ${classeBouton}`}
            style={
              actif
                ? { backgroundColor: 'var(--segment-actif-fond)', color: 'var(--segment-actif-texte)', fontWeight: 600 }
                : { backgroundColor: 'var(--segment-inactif-fond)', color: 'var(--segment-inactif-texte)' }
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
