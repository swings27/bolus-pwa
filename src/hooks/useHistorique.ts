import { useEffect, useState } from 'react'
import { db } from '../db'
import { lireHistorique } from '../utils/historique'
import type { IFiche } from '../types'

// Fiches correspondant à l'historique de consultation (voir
// src/utils/historique.ts), chargées une seule fois au montage. Les deux
// usages (Recherche, SearchDropdown de l'Accueil) vivent sur des pages
// remontées à chaque navigation vers elles : pas besoin d'une requête
// réactive (useLiveQuery), un chargement au montage suffit à rester à jour.
export function useHistorique(): IFiche[] {
  const [historique, setHistorique] = useState<IFiche[]>([])

  useEffect(() => {
    let annule = false
    lireHistorique().then(async (ids) => {
      const fiches = await Promise.all(ids.map((id) => db.fiches.get(id)))
      // Une fiche de l'historique a pu disparaître du catalogue depuis
      // (voir la réconciliation dans useFichesLoader) : on l'omet plutôt
      // que d'afficher un trou.
      if (!annule) setHistorique(fiches.filter((fiche): fiche is IFiche => fiche !== undefined))
    })
    return () => {
      annule = true
    }
  }, [])

  return historique
}
