import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { CATEGORIES } from '../data/categories'
import type { ICategorie } from '../types'

export interface ICategorieAvecFiches extends ICategorie {
  nombreFiches: number
  /** Sous-familles de la catégorie qui contiennent au moins une fiche,
   * dans l'ordre défini par categories.ts (pas alphabétique). */
  sousFamillesPresentes: string[]
}

// Enrichit la liste statique CATEGORIES avec le nombre de fiches présentes
// en base pour chacune (via l'index "categorie" de la table fiches) et la
// liste de leurs sous-familles non vides, puis ne garde que les catégories
// qui ne sont pas vides. useLiveQuery refait le calcul automatiquement si
// la table fiches change (ex. resynchronisation CDN).
export function useCategoriesAvecFiches(): ICategorieAvecFiches[] | undefined {
  return useLiveQuery(async () => {
    const fichesParCategorie = await Promise.all(
      CATEGORIES.map((categorie) => db.fiches.where('categorie').equals(categorie.slug).toArray()),
    )

    return CATEGORIES.map((categorie, index) => {
      const fiches = fichesParCategorie[index]
      const sousFamillesAvecFiche = new Set(fiches.map((fiche) => fiche.sousFamille))

      return {
        ...categorie,
        nombreFiches: fiches.length,
        sousFamillesPresentes: categorie.sousFamilles.filter((sousFamille) =>
          sousFamillesAvecFiche.has(sousFamille),
        ),
      }
    }).filter((categorie) => categorie.nombreFiches > 0)
  }, [])
}
