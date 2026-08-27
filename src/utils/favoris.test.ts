import { describe, it, expect, vi, beforeEach } from 'vitest'

// db.parametres réduit à sa plus simple expression (une Map en mémoire) :
// pour de la logique métier pure (ajouter/retirer/plafonner), un vrai Dexie
// (ou fake-indexeddb) serait un poids inutile — on le réserve pour plus
// tard, si des tests de composants/hooks en ont vraiment besoin.
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

import { lireFavoris, basculerFavori, TAILLE_MAX_FAVORIS } from './favoris'

beforeEach(() => {
  store.clear()
})

describe('lireFavoris', () => {
  it('renvoie un tableau vide tant que rien n’a été enregistré', async () => {
    expect(await lireFavoris()).toEqual([])
  })
})

describe('basculerFavori', () => {
  it('ajoute un id absent des favoris', async () => {
    const resultat = await basculerFavori('a')
    expect(resultat).toEqual({ favoris: ['a'], bloque: false })
  })

  it('retire un id déjà présent plutôt que de le dupliquer', async () => {
    await basculerFavori('a')
    const resultat = await basculerFavori('a')
    expect(resultat).toEqual({ favoris: [], bloque: false })
  })

  it(`bloque l’ajout au-delà de ${TAILLE_MAX_FAVORIS} favoris, sans évincer le plus ancien`, async () => {
    await basculerFavori('a')
    await basculerFavori('b')
    await basculerFavori('c')

    const resultat = await basculerFavori('d')

    expect(resultat.bloque).toBe(true)
    expect(resultat.favoris).toEqual(['a', 'b', 'c'])
  })

  it('retirer un favori reste possible même une fois la limite atteinte', async () => {
    await basculerFavori('a')
    await basculerFavori('b')
    await basculerFavori('c')

    const resultat = await basculerFavori('b')

    expect(resultat).toEqual({ favoris: ['a', 'c'], bloque: false })
  })

  it('la place libérée par un retrait peut être immédiatement réutilisée', async () => {
    await basculerFavori('a')
    await basculerFavori('b')
    await basculerFavori('c')
    await basculerFavori('b') // retrait

    const resultat = await basculerFavori('d')

    expect(resultat).toEqual({ favoris: ['a', 'c', 'd'], bloque: false })
  })
})
