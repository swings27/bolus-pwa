// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { useCalculateurModal } from '../../contexts/CalculateurModalContext'
import CalcDebit from './CalcDebit'
import CalcDosePoids from './CalcDosePoids'

type Onglet = 'debit' | 'dosePoids'

const ONGLETS: { valeur: Onglet; label: string }[] = [
  { valeur: 'debit', label: 'Débit' },
  { valeur: 'dosePoids', label: 'Dose / poids' },
]

// Affiché en modale (par-dessus la page courante) plutôt que sur sa propre
// route : quelle que soit la page depuis laquelle on l'ouvre, on veut
// pouvoir revérifier un calcul sans la quitter ni relancer une recherche.
export default function CalculateurModal() {
  const { estOuvert, fermer } = useCalculateurModal()
  const [onglet, setOnglet] = useState<Onglet>('debit')

  if (!estOuvert) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-texte/60 sm:items-center sm:p-4"
      onClick={fermer}
    >
      <div
        className="flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-fond p-6 shadow-xl sm:max-w-md sm:rounded-2xl"
        onClick={(evenement) => evenement.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-texte">Calculateurs</h2>
          <button
            type="button"
            onClick={fermer}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ color: 'var(--texte-doux)' }}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {ONGLETS.map(({ valeur, label }) => {
            const actif = onglet === valeur
            return (
              <button
                key={valeur}
                type="button"
                onClick={() => setOnglet(valeur)}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm transition-colors duration-150"
                style={
                  actif
                    ? { backgroundColor: 'var(--onglet-actif)', color: 'var(--interactif)', fontWeight: 600 }
                    : { backgroundColor: 'var(--onglet-inactif)' }
                }
              >
                <span className={actif ? '' : 'text-texte/70'}>{label}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: 'var(--surface)' }}>
          {onglet === 'debit' ? <CalcDebit /> : <CalcDosePoids />}
        </div>

        <div
          className="mt-4 flex items-start gap-2 rounded-lg px-4 py-3"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent) 10%, var(--fond))',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} aria-hidden="true" />
          <p className="text-xs leading-relaxed text-texte/80">
            Ces calculateurs effectuent une opération arithmétique à partir des valeurs que vous saisissez. Ils ne
            sont liés à aucune base de médicaments. La vérification du calcul et de la prescription reste sous votre
            responsabilité.
          </p>
        </div>
      </div>
    </div>
  )
}
