import { db } from '../db'
import { CLE_HISTORIQUE_RECHERCHE } from '../db/cles'

const TAILLE_HISTORIQUE = 3

// Historique des dernières fiches consultées, affiché sur la page Recherche
// dès l'arrivée (avant toute saisie). Stocké dans Dexie comme les autres
// préférences locales (thème, session...) plutôt qu'en mémoire : une PWA
// ouverte irrégulièrement doit retrouver son historique même après un
// redémarrage complet, pas repartir de zéro à chaque lancement.
export async function enregistrerConsultation(id: string): Promise<void> {
  const ids = await lireHistorique()
  // Une fiche déjà présente remonte en tête plutôt que d'être dupliquée.
  const nouveaux = [id, ...ids.filter((existant) => existant !== id)].slice(0, TAILLE_HISTORIQUE)
  await db.parametres.put({ cle: CLE_HISTORIQUE_RECHERCHE, valeur: JSON.stringify(nouveaux) })
}

export async function lireHistorique(): Promise<string[]> {
  const param = await db.parametres.get(CLE_HISTORIQUE_RECHERCHE)
  if (!param) return []
  try {
    const ids: unknown = JSON.parse(param.valeur)
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}
