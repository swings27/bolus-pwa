import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const DELAI_MIN_MS = 400

// Protection anti-double-tap : un doigt imprécis ou une latence tactile
// perçue peut déclencher deux taps rapprochés sur le même résultat/la même
// carte, empilant deux navigations (donc deux entrées d'historique) pour un
// seul geste voulu. Un ref plutôt qu'un state : cette vérification n'a besoin
// de rien re-render, seulement de lire/écrire un horodatage entre deux appels.
export function useNavigationSure() {
  const navigate = useNavigate()
  const derniereNavigation = useRef(0)

  function naviguer(chemin: string) {
    const maintenant = Date.now()
    if (maintenant - derniereNavigation.current < DELAI_MIN_MS) return
    derniereNavigation.current = maintenant
    navigate(chemin)
  }

  return naviguer
}
