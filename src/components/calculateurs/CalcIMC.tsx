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
import TableReferenceIMC from './TableReferenceIMC'

// Le résultat reste un chiffre neutre : aucun seuil, aucune catégorie
// déduite de la valeur saisie, aucune couleur (voir ResultatCalcul). La
// grille de repères affichée en dessous n'y change rien — elle est
// entièrement statique et n'est reliée d'aucune façon à l'IMC calculé, pas
// même par une surbrillance ; voir l'en-tête de TableReferenceIMC, qui
// détaille pourquoi ce cloisonnement doit le rester.
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

      {/* Aucune prop : la table ne sait rien de `imc`, et ne doit rien en
          savoir. Elle s'affiche à l'identique champ vide comme champ
          rempli. */}
      <TableReferenceIMC />
    </div>
  )
}
