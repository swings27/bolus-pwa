import { useEffect, useState } from 'react'
import { lireFavoris, basculerFavori } from '../utils/favoris'

interface IUseFavoris {
  favoris: string[]
  /** Retourne true si l'ajout a été refusé (3 favoris déjà présents). */
  basculer: (id: string) => Promise<boolean>
}

// Chargé une seule fois au montage, comme useHistorique : les pages qui
// l'utilisent sont remontées à chaque navigation vers elles, donc toujours
// à jour sans requête réactive. basculer() met à jour l'état local
// immédiatement après écriture, pour que le cœur cliqué change tout de
// suite sans attendre un remount.
export function useFavoris(): IUseFavoris {
  const [favoris, setFavoris] = useState<string[]>([])

  useEffect(() => {
    let annule = false
    lireFavoris().then((ids) => {
      if (!annule) setFavoris(ids)
    })
    return () => {
      annule = true
    }
  }, [])

  async function basculer(id: string): Promise<boolean> {
    const resultat = await basculerFavori(id)
    setFavoris(resultat.favoris)
    return resultat.bloque
  }

  return { favoris, basculer }
}
