import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { IFiche } from '../types'

interface IResultatFiche {
  fiche: IFiche | undefined
  loading: boolean
}

// Même principe que useSearch : useLiveQuery s'abonne à la table "fiches"
// et re-render automatiquement si cette fiche précise est mise à jour
// (ex. resynchronisation d'une nouvelle version des données) pendant que
// l'utilisateur est sur la page.
export function useFiche(id: string): IResultatFiche {
  // useLiveQuery renvoie `undefined` tant que la requête n'a pas encore
  // résolu une première fois — mais db.fiches.get(id) renvoie *aussi*
  // `undefined` si l'id n'existe simplement pas. Pour distinguer "chargement
  // en cours" de "fiche introuvable", on enveloppe le résultat dans un objet
  // : c'est cet objet englobant qui vaut `undefined` pendant le chargement,
  // jamais son contenu.
  const resultat = useLiveQuery(
    async () => ({ fiche: await db.fiches.get(id) }),
    [id],
  )

  return {
    fiche: resultat?.fiche,
    loading: resultat === undefined,
  }
}
