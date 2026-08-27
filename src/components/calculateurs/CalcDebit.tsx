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
import BoutonReinitialiser from './BoutonReinitialiser'
import SegmentedControl from '../layout/SegmentedControl'
import { parseNombre, formaterFR, nombrePositif } from './nombreUtils'

// Calibres courants d'une tubulure de perfusion (gouttes/mL), avec leur
// usage type — plus parlant que le seul chiffre pour choisir vite.
const CALIBRES_USUELS: { valeur: number; usage: string }[] = [
  { valeur: 15, usage: 'Sang' },
  { valeur: 20, usage: 'Standard' },
  { valeur: 60, usage: 'Pédiatrie' },
]

// SegmentedControl attribue une valeur `string` à chaque option (partagée
// avec les autres sélecteurs de l'app) : les calibres numériques sont donc
// convertis en chaîne pour cet usage, et reconvertis dans onChange.
const OPTIONS_CALIBRE = [
  ...CALIBRES_USUELS.map(({ valeur, usage }) => ({
    valeur: String(valeur),
    label: (
      <span className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-semibold">{valeur}</span>
        <span className="text-[11px]" style={{ opacity: 0.75 }}>
          {usage}
        </span>
      </span>
    ),
  })),
  { valeur: 'autre', label: <span className="text-sm font-semibold">Autre</span> },
]

type SelectionCalibre = number | 'autre'

export default function CalcDebit() {
  const [volume, setVolume] = useState('')
  const [heures, setHeures] = useState('')
  const [minutes, setMinutes] = useState('')
  const [calibreSelectionne, setCalibreSelectionne] = useState<SelectionCalibre>(20)
  const [calibreAutre, setCalibreAutre] = useState('')

  const volumeN = nombrePositif(parseNombre(volume))
  const dureeMinutes = nombrePositif(
    (parseNombre(heures) ?? 0) * 60 + (parseNombre(minutes) ?? 0),
  )
  const calibreN = calibreSelectionne === 'autre' ? nombrePositif(parseNombre(calibreAutre)) : calibreSelectionne

  const debitMlH =
    volumeN !== null && dureeMinutes !== null ? nombrePositif(volumeN / (dureeMinutes / 60)) : null
  const debitGouttesMin =
    volumeN !== null && calibreN !== null && dureeMinutes !== null
      ? nombrePositif((volumeN * calibreN) / dureeMinutes)
      : null

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
        <SegmentedControl
          options={OPTIONS_CALIBRE}
          valeur={String(calibreSelectionne)}
          onChange={(v) => setCalibreSelectionne(v === 'autre' ? 'autre' : Number(v))}
          classeBouton="px-2 py-2"
        />

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

      {afficheReinitialiser && <BoutonReinitialiser onClick={reinitialiser} />}
    </div>
  )
}
