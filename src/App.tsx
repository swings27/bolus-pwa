import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DisclaimerModal from './components/layout/DisclaimerModal'
import { useFichesLoader } from './hooks/useFichesLoader'
import Accueil from './pages/Accueil'
import Recherche from './pages/Recherche'
import FicheMedicament from './pages/FicheMedicament'
import Categories from './pages/Categories'
import ListeCategorie from './pages/ListeCategorie'
import Calculateurs from './pages/Calculateurs'
import Menu from './pages/Menu'
import APropos from './pages/APropos'
import Contact from './pages/Contact'
import MentionsLegales from './pages/MentionsLegales'
import Confidentialite from './pages/Confidentialite'
import CGU from './pages/CGU'

// Écran plein écran affiché pendant la toute première synchronisation des
// fiches (CDN → Dexie). Ne s'affiche qu'au premier lancement de l'app,
// ou tant que la version locale n'est pas à jour (voir useFichesLoader).
function EcranChargement() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-creme">
      <span className="font-logo text-4xl font-bold lowercase text-encre">
        bolus
      </span>
      <span
        className="h-8 w-8 animate-spin rounded-full border-4 border-terracotta-clair border-t-terracotta-profond"
        role="status"
        aria-label="Chargement"
      />
    </div>
  )
}

function EcranErreur({
  message,
  onReessayer,
}: {
  message: string
  onReessayer: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-creme px-6 text-center">
      <span className="font-logo text-3xl font-bold lowercase text-encre">
        bolus
      </span>
      <p className="max-w-xs text-sm text-encre/70">
        Impossible de charger les fiches médicaments. Vérifiez votre connexion
        puis réessayez.
      </p>
      <p className="max-w-xs text-xs text-encre/40">{message}</p>
      <button
        type="button"
        onClick={onReessayer}
        className="rounded-lg bg-terracotta-profond px-5 py-2.5 text-sm font-medium text-surface"
      >
        Réessayer
      </button>
    </div>
  )
}

// React Router v6 : les routes sont déclarées comme des composants <Route>,
// imbriqués sous un <Route> parent qui porte le Layout. Le Layout affiche
// <Outlet /> à l'endroit où la route enfant active doit s'afficher — ça
// évite de répéter le wrapper (fond, BottomNavBar) sur chaque page.
export default function App() {
  // Synchronise les fiches CDN → Dexie au montage de l'app (une seule fois
  // ici, à la racine, plutôt que dans chaque page qui en a besoin).
  const { loading, error, reessayer } = useFichesLoader()

  return (
    <BrowserRouter>
      {/* Modal bloquante affichée par-dessus tout le reste tant que
          l'utilisateur n'a pas accepté le disclaimer. */}
      <DisclaimerModal />

      {loading ? (
        <EcranChargement />
      ) : error ? (
        <EcranErreur message={error} onReessayer={reessayer} />
      ) : (
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Accueil />} />
            <Route path="/recherche" element={<Recherche />} />
            <Route path="/fiche/:id" element={<FicheMedicament />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<ListeCategorie />} />
            <Route path="/calculateurs" element={<Calculateurs />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/a-propos" element={<APropos />} />
            <Route path="/menu/contact" element={<Contact />} />
            <Route path="/menu/mentions-legales" element={<MentionsLegales />} />
            <Route path="/menu/confidentialite" element={<Confidentialite />} />
            <Route path="/menu/cgu" element={<CGU />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  )
}
