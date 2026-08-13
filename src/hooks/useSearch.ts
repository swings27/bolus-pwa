import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { IFiche } from '../types'

const MAX_RESULTATS = 6

interface IResultatRecherche {
  resultats: IFiche[]
  loading: boolean
}

// useLiveQuery (dexie-react-hooks) vs useEffect + await db.fiches...() :
// avec un useEffect classique, la requête ne s'exécute qu'au montage ou
// quand ses dépendances changent — si les données de Dexie changent
// ailleurs dans l'app (ex. resynchronisation via useFichesLoader), le
// composant ne le sait pas et affiche des résultats périmés tant qu'il
// n'est pas remonté. useLiveQuery s'abonne aux tables IndexedDB qu'elle lit
// et ré-exécute automatiquement la requête (et re-render le composant) dès
// que ces tables sont modifiées, sans code de synchronisation manuel.
export function useSearch(query: string): IResultatRecherche {
  const terme = query.trim()

  // Le tableau de dépendances ([terme]) dit à useLiveQuery de ré-exécuter
  // la requête quand le texte recherché change (comme le tableau de deps
  // d'un useEffect).
  const resultats = useLiveQuery(
    async () => {
      if (terme.length < 2) return []

      // Recherche par préfixe insensible à la casse sur deux index :
      // - "dci" (index simple)
      // - "nomsCommerciaux" (index multi-entrées, déclaré avec "*" dans
      //   db/index.ts) : chaque nom commercial du tableau est indexé
      //   individuellement, donc startsWithIgnoreCase matche si N'IMPORTE
      //   LEQUEL des noms commence par le terme recherché.
      // .or() combine les deux WhereClause en un OU logique.
      const correspondances = await db.fiches
        .where('dci')
        .startsWithIgnoreCase(terme)
        .or('nomsCommerciaux')
        .startsWithIgnoreCase(terme)
        // distinct() : une fiche multi-matchée (ex. deux noms commerciaux
        // qui commencent tous les deux par le terme) ne doit apparaître
        // qu'une seule fois dans le résultat.
        .distinct()
        .toArray()

      return correspondances.slice(0, MAX_RESULTATS)
    },
    [terme],
  )

  // Pendant le tout premier calcul, useLiveQuery renvoie `undefined` (pas
  // encore de résultat disponible) — c'est notre signal de chargement.
  return {
    resultats: resultats ?? [],
    loading: resultats === undefined,
  }
}
