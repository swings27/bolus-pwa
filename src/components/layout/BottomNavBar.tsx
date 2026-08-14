import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Calculator, Grid3x3, Menu as MenuIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface IOnglet {
  to: string
  label: string
  icon: LucideIcon
}

// Ordre d'affichage des 5 onglets. Le Calculateur (3ème position) est
// l'onglet central mis en avant visuellement dans le rendu ci-dessous.
const onglets: IOnglet[] = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/recherche', label: 'Recherche', icon: Search },
  { to: '/calculateurs', label: 'Calculateur', icon: Calculator },
  { to: '/categories', label: 'Catégories', icon: Grid3x3 },
  { to: '/menu', label: 'Menu', icon: MenuIcon },
]

export default function BottomNavBar() {
  // useLocation() de React Router expose l'URL courante — on s'en sert
  // pour déterminer quel onglet est "actif" et le colorer en conséquence.
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-around
                 border-t border-texte/10 bg-surface px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2"
    >
      {onglets.map(({ to, label, icon: Icon }) => {
        const actif = to === '/' ? pathname === '/' : pathname.startsWith(to)
        const central = to === '/calculateurs'

        if (central) {
          // Onglet Calculateur : surélevé, cerclé plein, comme un bouton
          // d'action mis en avant plutôt qu'un simple lien.
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 -translate-y-3"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-interactif shadow-md">
                <Icon className="h-6 w-6 text-surface" strokeWidth={2} />
              </span>
              <span className="text-xs font-medium text-interactif">
                {label}
              </span>
            </Link>
          )
        }

        return (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 px-2 py-1"
          >
            <Icon
              className={actif ? 'h-6 w-6 text-interactif' : 'h-6 w-6 text-texte/50'}
              strokeWidth={2}
            />
            <span
              className={
                actif
                  ? 'text-xs font-medium text-interactif'
                  : 'text-xs font-medium text-texte/50'
              }
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
