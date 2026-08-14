import { useEffect } from 'react'
import type { RefObject } from 'react'

// Pattern React classique pour fermer un menu/dropdown au clic extérieur :
// on ne peut pas détecter "un clic hors de cet élément" avec les événements
// React seuls (onClick ne se déclenche que sur l'élément cliqué et ses
// enfants). Il faut donc écouter les clics sur `document` tout entier, et
// vérifier nous-mêmes si la cible du clic est contenue dans notre élément
// (ref.current.contains(...)) — si non, c'est un clic "extérieur".
//
// On écoute "mousedown" plutôt que "click" : mousedown se déclenche avant
// qu'un éventuel autre gestionnaire onClick (ex. un bouton à l'intérieur du
// dropdown) n'ait fini son cycle, ce qui évite des races où le dropdown se
// refermerait puis se rouvrirait sur le même clic.
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClickOutside: () => void,
) {
  useEffect(() => {
    function gererClic(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside()
      }
    }

    document.addEventListener('mousedown', gererClic)
    return () => document.removeEventListener('mousedown', gererClic)
  }, [ref, onClickOutside])
}
