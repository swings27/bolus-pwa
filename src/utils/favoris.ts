import { db } from '../db'

const CLE_FAVORIS = 'favoris'
export const TAILLE_MAX_FAVORIS = 3

export async function lireFavoris(): Promise<string[]> {
  const param = await db.parametres.get(CLE_FAVORIS)
  if (!param) return []
  try {
    const ids: unknown = JSON.parse(param.valeur)
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

interface IResultatBascule {
  favoris: string[]
  /** true si l'ajout a été refusé faute de place (3 favoris déjà présents). */
  bloque: boolean
}

// Ajoute ou retire un favori. Retirer est toujours possible ; ajouter est
// bloqué au-delà de TAILLE_MAX_FAVORIS plutôt que d'évincer automatiquement
// le plus ancien (contrairement à l'historique) — les 3 favoris sont un
// choix délibéré de l'utilisatrice, jamais une éviction silencieuse dans
// son dos.
export async function basculerFavori(id: string): Promise<IResultatBascule> {
  const actuels = await lireFavoris()

  if (actuels.includes(id)) {
    const favoris = actuels.filter((existant) => existant !== id)
    await db.parametres.put({ cle: CLE_FAVORIS, valeur: JSON.stringify(favoris) })
    return { favoris, bloque: false }
  }

  if (actuels.length >= TAILLE_MAX_FAVORIS) {
    return { favoris: actuels, bloque: true }
  }

  const favoris = [...actuels, id]
  await db.parametres.put({ cle: CLE_FAVORIS, valeur: JSON.stringify(favoris) })
  return { favoris, bloque: false }
}
