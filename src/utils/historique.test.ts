import { describe, it, expect, vi, beforeEach } from 'vitest'

// Même principe que favoris.test.ts : db.parametres réduit à une Map en
// mémoire, suffisant pour vérifier la règle métier (dédoublonnage, ordre,
// plafond) sans dépendre d'un vrai Dexie/IndexedDB.
const { store } = vi.hoisted(() => ({ store: new Map<string, string>() }))

vi.mock('../db', () => ({
  db: {
    parametres: {
      get: async (cle: string) => {
        const valeur = store.get(cle)
        return valeur === undefined ? undefined : { cle, valeur }
      },
      put: async (param: { cle: string; valeur: string }) => {
        store.set(param.cle, param.valeur)
      },
    },
  },
}))

import { enregistrerConsultation, lireHistorique } from './historique'

beforeEach(() => {
  store.clear()
})

describe('lireHistorique', () => {
  it('renvoie un tableau vide tant que rien n’a été consulté', async () => {
    expect(await lireHistorique()).toEqual([])
  })
})

describe('enregistrerConsultation', () => {
  it('ajoute un id en tête de l’historique', async () => {
    await enregistrerConsultation('a')
    expect(await lireHistorique()).toEqual(['a'])
  })

  it('place la consultation la plus récente en tête', async () => {
    await enregistrerConsultation('a')
    await enregistrerConsultation('b')
    expect(await lireHistorique()).toEqual(['b', 'a'])
  })

  it('fait remonter en tête un id déjà présent plutôt que de le dupliquer', async () => {
    await enregistrerConsultation('a')
    await enregistrerConsultation('b')
    await enregistrerConsultation('a')
    expect(await lireHistorique()).toEqual(['a', 'b'])
  })

  it('plafonne à 3 entrées en évinçant automatiquement la plus ancienne', async () => {
    await enregistrerConsultation('a')
    await enregistrerConsultation('b')
    await enregistrerConsultation('c')
    await enregistrerConsultation('d')

    expect(await lireHistorique()).toEqual(['d', 'c', 'b'])
  })
})
