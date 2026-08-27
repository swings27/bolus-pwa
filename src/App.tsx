import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DisclaimerModal from './components/layout/DisclaimerModal'
import ErrorBoundary from './components/layout/ErrorBoundary'
import CalculateurModal from './components/calculateurs/CalculateurModal'
import { CalculateurModalProvider } from './contexts/CalculateurModalContext'
import { useFichesLoader } from './hooks/useFichesLoader'
import { demanderPersistance } from './utils/persistance'
import { db } from './db'
import Accueil from './pages/Accueil'
import Recherche from './pages/Recherche'
import FicheMedicament from './pages/FicheMedicament'
import Categories from './pages/Categories'
import ListeCategorie from './pages/ListeCategorie'
import Favoris from './pages/Favoris'
import Menu from './pages/Menu'
import Parametres from './pages/Parametres'
import APropos from './pages/APropos'
import Contact from './pages/Contact'
import MentionsLegales from './pages/MentionsLegales'
import Confidentialite from './pages/Confidentialite'
import CGU from './pages/CGU'
import Introuvable from './pages/Introuvable'
import { Analytics } from '@vercel/analytics/react'

// Écran plein écran affiché pendant la toute première synchronisation des
// fiches (CDN → Dexie). Ne s'affiche qu'au premier lancement de l'app,
// ou tant que la version locale n'est pas à jour (voir useFichesLoader).
function EcranChargement() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-fond">
      <span className="font-display text-4xl font-semibold lowercase text-texte">
        bolus
      </span>
      <span
        className="h-8 w-8 animate-spin rounded-full border-4 border-accent-clair border-t-interactif"
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-fond px-6 text-center">
      <span className="font-display text-3xl font-semibold lowercase text-texte">
        bolus
      </span>
      <p className="max-w-xs text-sm text-texte/70">
        Impossible de charger les fiches médicaments. Vérifiez votre connexion
        puis réessayez.
      </p>
      <p className="max-w-xs text-xs text-texte/40">{message}</p>
      <button
        type="button"
        onClick={onReessayer}
        className="rounded-lg bg-interactif px-5 py-3 text-sm font-medium text-surface"
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

  // Demande la persistance du stockage une seule fois, une fois les fiches
  // chargées avec succès (pas avant : pas la peine d'ajouter de latence
  // perçue au tout premier écran pour une requête qui peut attendre).
  // L'effet ne se redéclenche que si loading/error changent, ce qui ne se
  // reproduit pas une fois le chargement terminé — voir persistance.ts.
  useEffect(() => {
    if (loading || error) return
    demanderPersistance()
      .then((accorde) => db.parametres.put({ cle: 'stockage_persistant', valeur: accorde ? 'true' : 'false' }))
      .catch(() => {
        // Échec silencieux (quota de stockage, navigation privée...) : ce
        // n'est qu'une préférence de confort, pas une fonctionnalité
        // bloquante — inutile d'alerter l'utilisatrice pour ça.
      })
  }, [loading, error])

  return (
    <ErrorBoundary>
      <Analytics />
      <BrowserRouter>
        <CalculateurModalProvider>
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
                <Route path="/favoris" element={<Favoris />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/menu/parametres" element={<Parametres />} />
                <Route path="/menu/a-propos" element={<APropos />} />
                <Route path="/menu/contact" element={<Contact />} />
                <Route path="/menu/mentions-legales" element={<MentionsLegales />} />
                <Route path="/menu/confidentialite" element={<Confidentialite />} />
                <Route path="/menu/cgu" element={<CGU />} />
                {/* Catch-all, toujours en dernier : React Router évalue les
                    routes dans l'ordre et ne retient que la première
                    correspondance. */}
                <Route path="*" element={<Introuvable />} />
              </Route>
            </Routes>
          )}

          {/* Rendue hors des <Routes> : le calculateur reste disponible en
              modale quelle que soit la page affichée dessous. */}
          <CalculateurModal />
        </CalculateurModalProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
