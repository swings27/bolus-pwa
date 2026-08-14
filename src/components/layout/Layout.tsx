import { Outlet, useLocation } from 'react-router-dom'
import BottomNavBar from './BottomNavBar'

// Routes qui ne doivent PAS afficher la BottomNavBar : uniquement les
// sous-pages du menu (mentions légales, contact...). Le menu principal
// (/menu) garde sa barre, seules ses sous-routes /menu/xxx sont concernées.
// La fiche médicament, elle, GARDE la BottomNavBar : consulter une fiche ne
// doit pas couper l'accès aux autres onglets (recherche, catégories...).
function doitCacherBottomNav(pathname: string): boolean {
  if (pathname !== '/menu' && pathname.startsWith('/menu/')) return true
  return false
}

// Layout principal : wrapper commun à toute l'app (fond du thème actif,
// hauteur pleine du viewport). <Outlet /> est l'emplacement où React Router
// injecte le composant de la route active (mécanisme de "routes imbriquées").
export default function Layout() {
  const { pathname } = useLocation()
  const afficherBottomNav = !doitCacherBottomNav(pathname)

  return (
    <div className="min-h-screen bg-fond text-texte flex flex-col">
      {/* padding-bottom réservé à la BottomNavBar pour que le contenu ne
          soit jamais masqué derrière la barre fixe en bas d'écran. */}
      <main className={afficherBottomNav ? 'flex-1 pb-20' : 'flex-1'}>
        <Outlet />
      </main>
      {afficherBottomNav && <BottomNavBar />}
    </div>
  )
}
