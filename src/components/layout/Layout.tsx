import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNavBar from './BottomNavBar'
import InstallBanner from './InstallBanner'
import UpdateBanner from './UpdateBanner'
import DisclaimerBanner from './DisclaimerBanner'
import BoutonRetourBeta from './BoutonRetourBeta'
import TransitionPage from './TransitionPage'
import { useScrollRestoration } from '../../hooks/useScrollRestoration'

// Layout principal : wrapper commun à toute l'app (fond du thème actif,
// hauteur pleine du viewport). <Outlet /> est l'emplacement où React Router
// injecte le composant de la route active (mécanisme de "routes imbriquées").
//
// La BottomNavBar reste visible sur TOUTES les routes, y compris la fiche
// médicament et les sous-pages du menu (mentions légales, contact...) :
// consulter une page secondaire ne doit jamais couper l'accès aux autres
// onglets (recherche, catégories...) — d'où la règle de correspondance
// "/menu et /menu/*" dans BottomNavBar.tsx, qui n'aurait pas de sens si la
// barre disparaissait justement sur ces routes-là.
export default function Layout() {
  useScrollRestoration()
  const { pathname } = useLocation()

  const bandeauxRef = useRef<HTMLDivElement>(null)
  // Hauteur réellement occupée par InstallBanner/UpdateBanner (0 quand ni
  // l'un ni l'autre ne s'affiche). Mesurée plutôt que devinée : leur
  // contenu varie (iOS a deux lignes d'instructions, Android une seule),
  // et les deux peuvent apparaître en même temps. Sans cette réserve
  // dynamique, un bouton en bas de page (ex. Introuvable.tsx) se
  // retrouverait caché derrière un bandeau flottant qui, lui, ne participe
  // pas au flux normal du document.
  const [hauteurBandeaux, setHauteurBandeaux] = useState(0)

  useEffect(() => {
    const element = bandeauxRef.current
    if (!element) return
    const observateur = new ResizeObserver(([entree]) => {
      setHauteurBandeaux(entree.contentRect.height)
    })
    observateur.observe(element)
    return () => observateur.disconnect()
  }, [])

  return (
    <div className="min-h-dvh bg-fond text-texte flex flex-col">
      {/* padding-bottom réservé à la BottomNavBar (hauteur de la barre +
          safe area, via --hauteur-nav défini dans index.css) + 8px de
          marge + la hauteur courante des bandeaux flottants ci-dessous,
          pour que le contenu ne soit jamais masqué derrière l'un ou
          l'autre. */}
      {/* flex flex-col (pas juste flex-1) : donne à <main> lui-même un
          contexte flex, pour que la page rendue par <Outlet/> puisse
          s'étirer sur toute la hauteur restante via flex-1 (utile pour
          centrer un état vide dans l'espace disponible, ex. Recherche). */}
      <main
        className="flex flex-1 flex-col"
        style={{ paddingBottom: `calc(var(--hauteur-nav) + 8px + ${hauteurBandeaux}px)` }}
      >
        <TransitionPage>
          <Outlet />
        </TransitionPage>
      </main>
      {/* Empilés dans un unique conteneur fixe, en flux normal l'un par
          rapport à l'autre (pas des positions "fixed" indépendantes qui se
          superposeraient) : UpdateBanner (une version obsolète peut fausser
          les données affichées) prime visuellement sur InstallBanner en
          s'empilant au-dessus, plus loin de la nav — l'ordre du DOM suffit,
          plus besoin de jongler avec le z-index entre eux. DisclaimerBanner
          (Accueil uniquement) ferme la pile, au plus près de la nav : rendu
          ici plutôt que positionné indépendamment par Accueil.tsx, il
          participe à la même mesure ResizeObserver que les deux autres —
          sans ça, le bouton de retour bêta (voir BoutonRetourBeta,
          positionné via cette même hauteur mesurée) le chevaucherait
          exactement comme il chevauchait InstallBanner avant ce correctif. */}
      <div ref={bandeauxRef} className="fixed inset-x-0 z-30" style={{ bottom: 'var(--hauteur-nav)' }}>
        <UpdateBanner />
        <InstallBanner />
        {pathname === '/' && <DisclaimerBanner />}
      </div>
      <BoutonRetourBeta decalageBas={hauteurBandeaux} />
      <BottomNavBar />
    </div>
  )
}
