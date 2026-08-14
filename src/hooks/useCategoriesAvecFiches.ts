import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { CATEGORIES } from '../data/categories'
import type { ICategorie } from '../types'

export interface ICategorieAvecFiches extends ICategorie {
  nombreFiches: number
}

// Enrichit la liste statique CATEGORIES avec le nombre de fiches présentes
// en base pour chacune (via l'index "categorie" de la table fiches), et ne
// garde que celles qui ne sont pas vides. useLiveQuery refait le calcul
// automatiquement si la table fiches change (ex. resynchronisation CDN).
export function useCategoriesAvecFiches(): ICategorieAvecFiches[] | undefined {
  return useLiveQuery(async () => {
    const comptes = await Promise.all(
      CATEGORIES.map((categorie) =>
        db.fiches.where('categorie').equals(categorie.slug).count(),
      ),
    )

    return CATEGORIES.map((categorie, index) => ({
      ...categorie,
      nombreFiches: comptes[index],
    })).filter((categorie) => categorie.nombreFiches > 0)
  }, [])
}
