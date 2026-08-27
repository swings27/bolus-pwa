import { useRegisterSW } from 'virtual:pwa-register/react'
import { X } from 'lucide-react'

// Problème résolu : le Service Worker télécharge une nouvelle version en
// arrière-plan dès qu'elle est déployée, mais le navigateur continue de
// servir l'ancienne tant que l'onglet n'a pas été complètement fermé — sur
// mobile, cela peut durer des semaines. Ce bandeau rend la mise à jour
// visible et actionnable, sans jamais recharger l'app sans prévenir (voir
// registerType: "prompt" dans vite.config.ts).
export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  // Le positionnement (fixed, au-dessus de la BottomNavBar) est géré par le
  // conteneur commun dans Layout.tsx, avec InstallBanner — pas ici : les
  // deux doivent s'empiler l'un sur l'autre plutôt que se superposer.
  return (
    <div
      className="flex items-center gap-3 rounded-t-2xl px-4 py-3"
      style={{
        backgroundColor: 'var(--interactif)',
        boxShadow: '0 -4px 16px var(--ombre-carte)',
      }}
    >
      {/* var(--fond) plutôt qu'un blanc/crème codé en dur : --fond est
          clair (crème) en thème clair et sombre en thème sombre, où
          --interactif devient lui-même une teinte claire — ce même
          principe (voir BlocInfo.tsx) garde le texte lisible sur ce fond
          saturé dans les deux thèmes. */}
      <p className="flex-1 text-sm" style={{ color: 'var(--fond)' }}>
        Une nouvelle version est disponible.
      </p>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium"
        style={{ backgroundColor: 'var(--fond)', color: 'var(--interactif)' }}
      >
        Actualiser
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        aria-label="Reporter la mise à jour"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ color: 'var(--fond)' }}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
