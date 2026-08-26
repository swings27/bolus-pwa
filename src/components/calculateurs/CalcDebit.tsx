// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

import { useState } from 'react'
import ChampNumerique from './ChampNumerique'
import ResultatCalcul from './ResultatCalcul'
import { parseNombre, formaterFR } from './nombreUtils'

// Calibres courants d'une tubulure de perfusion (gouttes/mL), avec leur
// usage type — plus parlant que le seul chiffre pour choisir vite.
const CALIBRES_USUELS: { valeur: number; usage: string }[] = [
  { valeur: 15, usage: 'Sang' },
  { valeur: 20, usage: 'Standard' },
  { valeur: 60, usage: 'Pédiatrie' },
]

type SelectionCalibre = number | 'autre'

export default function CalcDebit() {
  const [volume, setVolume] = useState('')
  const [heures, setHeures] = useState('')
  const [minutes, setMinutes] = useState('')
  const [calibreSelectionne, setCalibreSelectionne] = useState<SelectionCalibre>(20)
  const [calibreAutre, setCalibreAutre] = useState('')

  const volumeN = parseNombre(volume)
  const dureeMinutes = (parseNombre(heures) ?? 0) * 60 + (parseNombre(minutes) ?? 0)
  const calibreN = calibreSelectionne === 'autre' ? parseNombre(calibreAutre) : calibreSelectionne

  const debitMlH = volumeN !== null && dureeMinutes > 0 ? volumeN / (dureeMinutes / 60) : null
  const debitGouttesMin =
    volumeN !== null && calibreN !== null && dureeMinutes > 0 ? (volumeN * calibreN) / dureeMinutes : null

  const afficheReinitialiser = debitMlH !== null || debitGouttesMin !== null

  function reinitialiser() {
    setVolume('')
    setHeures('')
    setMinutes('')
    setCalibreSelectionne(20)
    setCalibreAutre('')
  }

  return (
    <div className="flex flex-col gap-5">
      <ChampNumerique label="Volume à perfuser" valeur={volume} onChange={setVolume} unite="mL" placeholder="0" />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-texte-doux">Durée</span>
        <div className="flex gap-2">
          <ChampNumerique label="Heures" valeur={heures} onChange={setHeures} unite="h" placeholder="0" />
          <ChampNumerique label="Minutes" valeur={minutes} onChange={setMinutes} unite="min" placeholder="0" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-texte-doux">Calibre de la tubulure (gouttes/mL)</span>
        <div className="flex gap-2">
          {CALIBRES_USUELS.map(({ valeur, usage }) => {
            const actif = calibreSelectionne === valeur
            return (
              <button
                key={valeur}
                type="button"
                onClick={() => setCalibreSelectionne(valeur)}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-2 transition-colors duration-150"
                style={
                  actif
                    ? { backgroundColor: 'var(--onglet-actif)', color: 'var(--interactif)' }
                    : { backgroundColor: 'var(--onglet-inactif)', color: 'var(--texte)' }
                }
              >
                <span className="text-sm font-semibold">{valeur}</span>
                <span className="text-[11px]" style={{ opacity: 0.75 }}>
                  {usage}
                </span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setCalibreSelectionne('autre')}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 transition-colors duration-150"
            style={
              calibreSelectionne === 'autre'
                ? { backgroundColor: 'var(--onglet-actif)', color: 'var(--interactif)' }
                : { backgroundColor: 'var(--onglet-inactif)', color: 'var(--texte)' }
            }
          >
            <span className="text-sm font-semibold">Autre</span>
          </button>
        </div>

        {calibreSelectionne === 'autre' && (
          <ChampNumerique
            label="Calibre personnalisé"
            valeur={calibreAutre}
            onChange={setCalibreAutre}
            unite="gttes/mL"
            placeholder="0"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <ResultatCalcul label="Débit" valeur={debitMlH !== null ? formaterFR(debitMlH, 1) : null} unite="mL/h" />
        <ResultatCalcul
          label="Débit"
          valeur={debitGouttesMin !== null ? formaterFR(Math.round(debitGouttesMin), 0) : null}
          unite="gttes/min"
        />
      </div>

      {afficheReinitialiser && (
        <button
          type="button"
          onClick={reinitialiser}
          // -my-3 compense le py-3 : zone tactile de 44px sans repousser le
          // reste de la mise en page (le lien n'avait aucun padding avant).
          className="-my-3 self-start py-3 text-sm"
          style={{ color: 'var(--interactif)' }}
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}
