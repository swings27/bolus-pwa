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
import { parseNombre, formaterFR, nombrePositif } from './nombreUtils'

// Pas de seuil ni de catégorie (maigreur/normal/surpoids...) affichée ici :
// même principe que les autres calculateurs (voir ResultatCalcul), un
// chiffre neutre, pas un avis clinique.
export default function CalcIMC() {
  const [poids, setPoids] = useState('')
  const [taille, setTaille] = useState('')

  const poidsN = nombrePositif(parseNombre(poids))
  const tailleN = nombrePositif(parseNombre(taille))
  const tailleM = tailleN !== null ? tailleN / 100 : null
  const imc = poidsN !== null && tailleM !== null ? nombrePositif(poidsN / (tailleM * tailleM)) : null

  function reinitialiser() {
    setPoids('')
    setTaille('')
  }

  return (
    <div className="flex flex-col gap-5">
      <ChampNumerique label="Poids" valeur={poids} onChange={setPoids} unite="kg" placeholder="0" />
      <ChampNumerique label="Taille" valeur={taille} onChange={setTaille} unite="cm" placeholder="0" />

      <div className="pt-2">
        <ResultatCalcul label="IMC" valeur={imc !== null ? formaterFR(imc, 1) : null} unite="kg/m²" />
      </div>

      {imc !== null && <BoutonReinitialiser onClick={reinitialiser} />}
    </div>
  )
}
