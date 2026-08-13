import { Outlet, useLocation, matchPath } from 'react-router-dom'
import BottomNavBar from './BottomNavBar'

// Routes qui ne doivent PAS afficher la BottomNavBar : la fiche médicament
// (plein écran, focus sur le contenu) et les sous-pages du menu (mentions
// légales, contact...). Le menu principal (/menu) garde sa barre, seules
// ses sous-routes /menu/xxx sont concernées.
function doitCacherBottomNav(pathname: string): boolean {
  if (matchPath('/fiche/:id', pathname)) return true
  if (pathname !== '/menu' && pathname.startsWith('/menu/')) return true
  return false
}

// Layout principal : wrapper commun à toute l'app (fond crème, hauteur
// pleine du viewport). <Outlet /> est l'emplacement où React Router
// injecte le composant de la route active (mécanisme de "routes imbriquées").
export default function Layout() {
  const { pathname } = useLocation()
  const afficherBottomNav = !doitCacherBottomNav(pathname)

  return (
    <div className="min-h-screen bg-creme text-encre flex flex-col">
      {/* padding-bottom réservé à la BottomNavBar pour que le contenu ne
          soit jamais masqué derrière la barre fixe en bas d'écran. */}
      <main className={afficherBottomNav ? 'flex-1 pb-20' : 'flex-1'}>
        <Outlet />
      </main>
      {afficherBottomNav && <BottomNavBar />}
    </div>
  )
}
