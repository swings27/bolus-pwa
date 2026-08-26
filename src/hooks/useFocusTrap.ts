import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

const SELECTEUR_FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

// Piège le focus clavier à l'intérieur d'une modale tant qu'elle est
// ouverte (Tab/Shift+Tab bouclent sur ses éléments focusables plutôt que
// de s'échapper vers la page en dessous — requis par le pattern ARIA
// "dialog"), et restitue le focus à l'élément qui avait déclenché
// l'ouverture une fois la modale refermée. Partagé par DisclaimerModal et
// CalculateurModal plutôt que dupliqué : la logique de piégeage est la
// même, seul le contenu de la modale change.
export function useFocusTrap(actif: boolean, conteneurRef: RefObject<HTMLElement | null>) {
  const declencheurRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!actif) return

    declencheurRef.current = document.activeElement as HTMLElement | null

    const conteneur = conteneurRef.current
    const premier = conteneur?.querySelector<HTMLElement>(SELECTEUR_FOCUSABLE)
    premier?.focus()

    function gererTab(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !conteneur) return

      const focusables = Array.from(conteneur.querySelectorAll<HTMLElement>(SELECTEUR_FOCUSABLE))
      if (focusables.length === 0) return

      const premierEl = focusables[0]
      const dernierEl = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === premierEl) {
        event.preventDefault()
        dernierEl.focus()
      } else if (!event.shiftKey && document.activeElement === dernierEl) {
        event.preventDefault()
        premierEl.focus()
      }
    }

    document.addEventListener('keydown', gererTab)
    return () => {
      document.removeEventListener('keydown', gererTab)
      declencheurRef.current?.focus()
    }
  }, [actif, conteneurRef])
}
