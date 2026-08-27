// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

import { useEffect, useRef, useState } from 'react'
import { Info, X } from 'lucide-react'
import { useCalculateurModal } from '../../contexts/CalculateurModalContext'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import SegmentedControl from '../layout/SegmentedControl'
import BlocAvertissement from '../layout/BlocAvertissement'
import CalcDebit from './CalcDebit'
import CalcDosePoids from './CalcDosePoids'
import CalcIMC from './CalcIMC'

type Onglet = 'debit' | 'dosePoids' | 'imc'

const ONGLETS: { valeur: Onglet; label: string }[] = [
  { valeur: 'debit', label: 'Débit' },
  { valeur: 'dosePoids', label: 'Dose / poids' },
  { valeur: 'imc', label: 'IMC' },
]

// Affiché en modale (par-dessus la page courante) plutôt que sur sa propre
// route : quelle que soit la page depuis laquelle on l'ouvre, on veut
// pouvoir revérifier un calcul sans la quitter ni relancer une recherche.
export default function CalculateurModal() {
  const { estOuvert, fermer } = useCalculateurModal()
  const [onglet, setOnglet] = useState<Onglet>('debit')
  const conteneurRef = useRef<HTMLDivElement>(null)

  useFocusTrap(estOuvert, conteneurRef)

  // Échap referme la modale : le piège de focus (useFocusTrap) empêche déjà
  // Tab de s'échapper vers la page en dessous, mais un utilisateur clavier
  // doit pouvoir sortir sans avoir à atteindre le bouton Fermer à la main.
  useEffect(() => {
    if (!estOuvert) return
    function gererEchap(event: KeyboardEvent) {
      if (event.key === 'Escape') fermer()
    }
    document.addEventListener('keydown', gererEchap)
    return () => document.removeEventListener('keydown', gererEchap)
  }, [estOuvert, fermer])

  if (!estOuvert) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-texte/60 sm:items-center sm:p-4"
      onClick={fermer}
    >
      <div
        ref={conteneurRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="calculateur-titre"
        className="flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-fond p-6 shadow-xl sm:max-w-md sm:rounded-2xl"
        onClick={(evenement) => evenement.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="calculateur-titre" className="font-display text-xl font-semibold text-texte">
            Calculateurs
          </h2>
          <button
            type="button"
            onClick={fermer}
            aria-label="Fermer"
            className="-m-1.5 flex h-11 w-11 items-center justify-center rounded-full"
            style={{ color: 'var(--texte-doux)' }}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">
          <SegmentedControl options={ONGLETS} valeur={onglet} onChange={setOnglet} />
        </div>

        <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: 'var(--surface)' }}>
          {onglet === 'debit' && <CalcDebit />}
          {onglet === 'dosePoids' && <CalcDosePoids />}
          {onglet === 'imc' && <CalcIMC />}
        </div>

        <div className="mt-4">
          <BlocAvertissement icone={Info} couleur="var(--accent)">
            <p className="text-xs leading-relaxed text-texte/80">
              Ces calculateurs effectuent une opération arithmétique à partir des valeurs que vous saisissez. Ils ne
              sont liés à aucune base de médicaments. La vérification du calcul et de la prescription reste sous
              votre responsabilité.
            </p>
          </BlocAvertissement>
        </div>
      </div>
    </div>
  )
}
