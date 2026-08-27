import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

// Anime l'entrée de chaque page (fondu + léger glissement vertical, voir la
// classe .transition-page dans index.css). Le remontage est déclenché par
// key={location.key} : cette clé change à chaque navigation (y compris
// entre deux fiches différentes réutilisant le même composant), ce qui
// retrigger l'animation CSS à chaque fois, exactement comme voulu. La
// classe elle-même ne définit d'animation que sous
// @media (prefers-reduced-motion: no-preference) — un utilisateur ayant
// désactivé les animations système n'en voit donc strictement aucune ici.
export default function TransitionPage({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    // flex flex-1 flex-col : ce wrapper prend la place qu'occupait
    // <Outlet/> directement comme enfant flex de <main> (voir Layout.tsx) —
    // sans ces classes, une page qui compte sur flex-1 pour s'étirer sur la
    // hauteur restante (ex. l'état vide de Recherche) se retrouverait dans
    // une boîte non extensible.
    <div key={location.key} className="transition-page flex flex-1 flex-col">
      {children}
    </div>
  )
}
