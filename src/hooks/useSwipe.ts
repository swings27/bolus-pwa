import { useRef } from 'react'
import type { TouchEvent } from 'react'

interface IOptionsSwipe {
  onSwipeGauche?: () => void
  onSwipeDroite?: () => void
  /** Distance minimale en pixels avant de considérer le geste comme un
   * swipe plutôt qu'un tap ou un scroll accidentel. */
  seuil?: number
}

const SEUIL_PAR_DEFAUT = 50

// Aucune librairie de gestes n'est installée dans le projet (voir
// package.json) : un geste horizontal simple ne justifie pas d'en ajouter
// une, un couple de handlers touch suffit — même esprit que useFocusTrap,
// écrit à la main plutôt qu'importé pour un besoin ponctuel et restreint.
export function useSwipe({ onSwipeGauche, onSwipeDroite, seuil = SEUIL_PAR_DEFAUT }: IOptionsSwipe) {
  const depart = useRef<number | null>(null)

  function onTouchStart(e: TouchEvent) {
    depart.current = e.touches[0].clientX
  }

  function onTouchEnd(e: TouchEvent) {
    if (depart.current === null) return
    const delta = e.changedTouches[0].clientX - depart.current
    depart.current = null
    if (delta <= -seuil) onSwipeGauche?.()
    else if (delta >= seuil) onSwipeDroite?.()
  }

  return { onTouchStart, onTouchEnd }
}
