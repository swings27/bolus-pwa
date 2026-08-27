// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce fichier ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

import { describe, it, expect } from 'vitest'
import { parseNombre, formaterFR, nombrePositif } from './nombreUtils'

describe('parseNombre', () => {
  it('convertit une saisie numérique valide', () => {
    expect(parseNombre('12.5')).toBe(12.5)
    expect(parseNombre('0')).toBe(0)
  })

  it('renvoie null pour une saisie vide ou uniquement des espaces', () => {
    expect(parseNombre('')).toBeNull()
    expect(parseNombre('   ')).toBeNull()
  })

  it('renvoie null pour une saisie non numérique', () => {
    expect(parseNombre('abc')).toBeNull()
    expect(parseNombre('12.5.3')).toBeNull()
  })
})

describe('formaterFR', () => {
  it('utilise la virgule comme séparateur décimal', () => {
    expect(formaterFR(62.5, 1)).toBe('62,5')
  })

  it('ne fait apparaître aucun zéro inutile', () => {
    expect(formaterFR(125, 1)).toBe('125')
    expect(formaterFR(125, 2)).toBe('125')
  })

  it('respecte le nombre maximal de décimales demandé', () => {
    expect(formaterFR(33.333333, 0)).toBe('33')
    expect(formaterFR(33.336, 1)).toBe('33,3')
  })
})

describe('nombrePositif', () => {
  it('laisse passer une valeur strictement positive et finie', () => {
    expect(nombrePositif(42)).toBe(42)
    expect(nombrePositif(0.001)).toBe(0.001)
  })

  it('rejette zéro (une grandeur physique nulle n’a pas de sens ici)', () => {
    expect(nombrePositif(0)).toBeNull()
  })

  it('rejette les valeurs négatives', () => {
    expect(nombrePositif(-1)).toBeNull()
  })

  it('rejette l’infini, y compris produit par un calcul en amont', () => {
    expect(nombrePositif(Infinity)).toBeNull()
    expect(nombrePositif(1e308 * 10)).toBeNull()
  })

  it('propage null tel quel', () => {
    expect(nombrePositif(null)).toBeNull()
  })
})
