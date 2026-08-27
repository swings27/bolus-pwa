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

type UniteDose = 'mg/kg' | 'µg/kg' | 'UI/kg'

const UNITES: UniteDose[] = ['mg/kg', 'µg/kg', 'UI/kg']

function uniteResultat(unite: UniteDose): string {
  return unite.replace('/kg', '')
}

export default function CalcDosePoids() {
  const [poids, setPoids] = useState('')
  const [dosePoids, setDosePoids] = useState('')
  const [unite, setUnite] = useState<UniteDose>('mg/kg')

  const poidsN = nombrePositif(parseNombre(poids))
  const doseN = nombrePositif(parseNombre(dosePoids))
  const doseTotale = poidsN !== null && doseN !== null ? nombrePositif(poidsN * doseN) : null

  function reinitialiser() {
    setPoids('')
    setDosePoids('')
    setUnite('mg/kg')
  }

  return (
    <div className="flex flex-col gap-5">
      <ChampNumerique label="Poids" valeur={poids} onChange={setPoids} unite="kg" placeholder="0" />
      <ChampNumerique label="Dose prescrite par kilo" valeur={dosePoids} onChange={setDosePoids} placeholder="0" />

      <div className="flex flex-col gap-2">
        <span className="text-xs text-texte-doux">Unité de la dose</span>
        <SegmentedControl
          options={UNITES.map((valeurUnite) => ({ valeur: valeurUnite, label: valeurUnite }))}
          valeur={unite}
          onChange={setUnite}
        />
      </div>

      <div className="pt-2">
        <ResultatCalcul
          label="Dose totale"
          valeur={doseTotale !== null ? formaterFR(doseTotale, 2) : null}
          unite={uniteResultat(unite)}
        />
        <p className="mt-2 text-xs italic text-texte-doux">
          Le calcul reprend la prescription médicale. Il ne la remplace pas et ne la vérifie pas.
        </p>
      </div>

      {doseTotale !== null && <BoutonReinitialiser onClick={reinitialiser} />}
    </div>
  )
}
