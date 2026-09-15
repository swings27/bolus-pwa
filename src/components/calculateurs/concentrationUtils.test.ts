import { describe, it, expect } from 'vitest'
import { concentrationDeLaDilution, concentrationSaisie, debitEquivalent } from './concentrationUtils'

describe('concentrationDeLaDilution', () => {
  it('divise la quantité par le volume', () => {
    expect(concentrationDeLaDilution(4, 48)).toBeCloseTo(0.0833, 4)
    expect(concentrationDeLaDilution(50, 50)).toBe(1)
  })

  // Un volume à zéro donnerait Infinity, affiché tel quel ce serait pire
  // qu'un champ vide : on le traite comme une saisie incomplète.
  it('renvoie null plutôt que de diviser par un volume nul ou absent', () => {
    expect(concentrationDeLaDilution(4, 0)).toBeNull()
    expect(concentrationDeLaDilution(4, null)).toBeNull()
  })

  it('renvoie null sans quantité', () => {
    expect(concentrationDeLaDilution(null, 48)).toBeNull()
    expect(concentrationDeLaDilution(0, 48)).toBeNull()
  })
})

describe('concentrationSaisie', () => {
  const directe = { concentration: '0.02' }
  const calculee = { quantite: '4', volume: '48' }

  it('lit la valeur saisie directement en mode direct', () => {
    expect(concentrationSaisie('directe', directe, calculee)).toBe(0.02)
  })

  it('déduit la concentration de la dilution en mode calculé', () => {
    expect(concentrationSaisie('calculee', directe, calculee)).toBeCloseTo(0.0833, 4)
  })

  // Les deux formes cohabitent en mémoire pour survivre à un aller-retour de
  // mode : seule celle désignée par `mode` doit être lue.
  it('ignore la forme qui ne correspond pas au mode courant', () => {
    expect(concentrationSaisie('directe', { concentration: '' }, calculee)).toBeNull()
    expect(concentrationSaisie('calculee', directe, { quantite: '', volume: '' })).toBeNull()
  })
})

describe('debitEquivalent', () => {
  // Cas de référence : passer d'une seringue à 0,02 mg/mL à une seringue 25
  // fois plus concentrée divise le débit d'autant.
  it('applique le produit en croix', () => {
    expect(debitEquivalent(0.02, 10, 0.5)).toBeCloseTo(0.4, 10)
  })

  it('laisse le débit inchangé quand les deux concentrations sont égales', () => {
    expect(debitEquivalent(4, 5, 4)).toBe(5)
  })

  // La propriété que garantit l'unité unique du calculateur : le rapport se
  // simplifie, donc les mêmes concentrations exprimées en µg/mL (×1000 des
  // deux côtés) donnent exactement le même débit — sans passer par un pivot
  // qui, lui, introduirait une erreur d'arrondi.
  it('donne le même résultat quelle que soit l\'unité commune aux deux concentrations', () => {
    expect(debitEquivalent(20, 10, 500)).toBe(debitEquivalent(0.02, 10, 0.5))
  })

  it('renvoie null dès qu\'un des trois champs manque', () => {
    expect(debitEquivalent(null, 10, 0.5)).toBeNull()
    expect(debitEquivalent(0.02, null, 0.5)).toBeNull()
    expect(debitEquivalent(0.02, 10, null)).toBeNull()
  })

  // Une concentration cible à zéro n'a pas de débit correspondant : sans ce
  // garde-fou le calcul renverrait Infinity.
  it('renvoie null pour une concentration cible nulle', () => {
    expect(debitEquivalent(0.02, 10, 0)).toBeNull()
  })
})
