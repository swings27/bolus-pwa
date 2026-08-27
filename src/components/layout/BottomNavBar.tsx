import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Calculator, LayoutGrid, Menu as MenuIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useCalculateurModal } from '../../contexts/CalculateurModalContext'

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
  { to: '/categories', label: 'Catégories', icon: LayoutGrid },
  { to: '/menu', label: 'Menu', icon: MenuIcon },
]

// Détermine quel onglet correspond au chemin courant. Une route de détail
// garde son onglet parent actif (ex. /categories/antalgiques → Catégories),
// mais /fiche/:id n'active délibérément aucun onglet : on y arrive depuis
// plusieurs endroits différents (recherche, catégorie...), aucun ne serait
// plus légitime qu'un autre à s'allumer. Le Calculateur n'a pas de route (il
// s'ouvre en modale par-dessus la page courante) : son état actif dépend de
// l'ouverture de la modale, pas du chemin — voir le rendu ci-dessous.
function ongletActifPour(pathname: string): string | null {
  if (pathname === '/') return '/'
  if (pathname === '/recherche') return '/recherche'
  if (pathname === '/categories' || pathname.startsWith('/categories/')) return '/categories'
  if (pathname === '/menu' || pathname.startsWith('/menu/')) return '/menu'
  return null
}

export default function BottomNavBar() {
  const { pathname } = useLocation()
  const ongletActif = ongletActifPour(pathname)
  const { estOuvert: calculateurOuvert, ouvrir: ouvrirCalculateur } = useCalculateurModal()

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 flex"
      style={{
        // overflow visible : le cercle du Calculateur dépasse au-dessus du
        // bord supérieur de la barre, il ne doit pas être rogné.
        overflow: 'visible',
        zIndex: 50,
        height: 'var(--hauteur-nav)',
        // padding-bottom (pas margin) : avec box-sizing: border-box, la
        // safe area vient grignoter le bas de la boîte plutôt que
        // s'ajouter par-dessus — les 5 onglets restent alignés sur les
        // 68px "visuels" de la barre, la safe area n'est que de l'espace
        // vide sous eux (indispensable sur iPhone à encoche).
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: 'var(--nav-fond)',
        borderTop: '1px solid var(--nav-bordure)',
      }}
    >
      {onglets.map(({ to, label, icon: Icon }) => {
        const central = to === '/calculateurs'
        const actif = central ? calculateurOuvert : ongletActif === to
        const couleur = actif ? 'var(--nav-actif)' : 'var(--nav-inactif)'

        if (central) {
          return (
            <button
              key={to}
              type="button"
              onClick={ouvrirCalculateur}
              // position: relative → le cercle absolu ci-dessous se
              // positionne par rapport au coin haut-gauche de CETTE
              // colonne, qui occupe toute la hauteur de la barre (stretch,
              // comportement flex par défaut) — donc par rapport au bord
              // supérieur de la barre elle-même.
              className="relative flex flex-1 flex-col items-center justify-center gap-1"
              aria-label={label}
              // aria-pressed (pas aria-current) : ce bouton ouvre une
              // modale, il ne navigue pas vers une page — c'est un bouton
              // à bascule, pas un lien de navigation "page courante".
              aria-pressed={calculateurOuvert}
            >
              {/* Espace réservé invisible, de la même hauteur que les
                  icônes des autres onglets (22px) : ça garde le label
                  "Calculateur" exactement sur la même ligne de base que les
                  4 autres labels, sans calcul de marge à la main — le
                  cercle visible, lui, est positionné en absolute par
                  dessus, indépendant du flux. */}
              <span className="block h-[22px] w-[22px]" aria-hidden="true" />
              <span
                className="absolute flex items-center justify-center rounded-full"
                style={{
                  top: '-22px',
                  height: '56px',
                  width: '56px',
                  backgroundColor: 'var(--calc-fond)',
                  border: '3px solid var(--calc-contour)',
                  boxShadow: '0 3px 8px var(--calc-ombre)',
                }}
              >
                <Calculator size={24} color="var(--calc-icone)" aria-hidden="true" />
              </span>
              <span
                className={`text-[13px] ${actif ? 'font-semibold' : 'font-medium'}`}
                style={{ color: couleur }}
              >
                {label}
              </span>
            </button>
          )
        }

        return (
          <Link
            key={to}
            to={to}
            aria-current={actif ? 'page' : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-1"
          >
            <Icon size={22} color={couleur} strokeWidth={actif ? 2.5 : 2} aria-hidden="true" />
            <span
              className={`text-[12px] ${actif ? 'font-semibold' : 'font-medium'}`}
              style={{ color: couleur }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
