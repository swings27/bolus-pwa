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
// unité/calibre... Le même motif visuel (fond var(--onglet-actif) /
// var(--onglet-inactif), texte var(--interactif) quand actif) était
// recopié dans 4 composants différents avant cette extraction, avec déjà
// un début de dérive entre les copies (couleur du texte inactif tantôt
// fixée, tantôt laissée par défaut).
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
                ? { backgroundColor: 'var(--onglet-actif)', color: 'var(--interactif)', fontWeight: 600 }
                : { backgroundColor: 'var(--onglet-inactif)', color: 'var(--texte)' }
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
