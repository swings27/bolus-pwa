import { Outlet } from 'react-router-dom'
import BottomNavBar from './BottomNavBar'

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
  return (
    <div className="min-h-screen bg-fond text-texte flex flex-col">
      {/* padding-bottom réservé à la BottomNavBar (hauteur de la barre +
          safe area, via --hauteur-nav défini dans index.css) + 8px de
          marge, pour que le contenu ne soit jamais masqué derrière la
          barre fixe en bas d'écran. */}
      {/* flex flex-col (pas juste flex-1) : donne à <main> lui-même un
          contexte flex, pour que la page rendue par <Outlet/> puisse
          s'étirer sur toute la hauteur restante via flex-1 (utile pour
          centrer un état vide dans l'espace disponible, ex. Recherche). */}
      <main
        className="flex flex-1 flex-col"
        style={{ paddingBottom: 'calc(var(--hauteur-nav) + 8px)' }}
      >
        <Outlet />
      </main>
      <BottomNavBar />
    </div>
  )
}
