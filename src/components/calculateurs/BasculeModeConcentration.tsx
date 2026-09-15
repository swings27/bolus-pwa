// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

import type { ModeConcentration } from './concentrationUtils'

interface IBasculeModeConcentrationProps {
  mode: ModeConcentration
  onChange: (mode: ModeConcentration) => void
}

const LABELS: Record<ModeConcentration, string> = {
  directe: 'Je connais ma concentration',
  calculee: 'Je dois la calculer',
}

// Pilules pleines/creuses reprises de SelecteurForme (onglets Injectable /
// Per os d'une fiche) plutôt que le SegmentedControl employé juste en
// dessous pour les unités : cette bascule ne choisit pas une valeur, elle
// change la forme de tout le formulaire. Lui donner la même apparence qu'un
// sélecteur d'unité la ferait passer pour un réglage de détail. Composant
// distinct plutôt qu'un import de SelecteurForme, qui vit dans
// src/components/fiches et dont le type d'option décrit des voies
// d'administration — un calculateur ne doit rien importer de ce dossier.
export default function BasculeModeConcentration({ mode, onChange }: IBasculeModeConcentrationProps) {
  return (
    <div className="flex gap-2">
      {(Object.keys(LABELS) as ModeConcentration[]).map((valeur) => {
        const actif = valeur === mode
        return (
          <button
            key={valeur}
            type="button"
            onClick={() => onChange(valeur)}
            aria-pressed={actif}
            className="tactile flex-1 rounded-full px-3 py-2.5 text-center text-[12.5px] font-semibold leading-snug"
            style={{
              backgroundColor: actif ? 'var(--segment-actif-fond)' : 'var(--fond)',
              color: actif ? 'var(--segment-actif-texte)' : 'var(--interactif)',
              boxShadow: actif
                ? '0 3px 9px color-mix(in srgb, var(--segment-actif-fond) 38%, transparent)'
                : '0 1px 3px color-mix(in srgb, var(--texte) 13%, transparent)',
            }}
          >
            {LABELS[valeur]}
          </button>
        )
      })}
    </div>
  )
}
