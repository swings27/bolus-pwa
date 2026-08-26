import { useEffect, useState } from 'react'
import { Share, PlusSquare, X } from 'lucide-react'
import { db } from '../../db'
import { estIOS, estSafari, estInstallee } from '../../utils/plateforme'

const CLE_SESSIONS = 'nombre_sessions'
const CLE_MASQUE = 'install_banner_masque'

// "beforeinstallprompt" n'est pas encore dans le lib DOM standard de
// TypeScript (API non normalisée, seulement supportée par les navigateurs
// basés sur Chromium) — on type nous-mêmes le strict nécessaire.
interface IEvenementInstallation extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

// Sans ce bandeau, un utilisateur iOS reste dans Safari avec la barre
// d'adresse et n'a aucun moyen de deviner qu'il peut installer
// l'application (iOS n'a pas d'invite native comme Android/Chrome) — c'est
// le composant le plus important de la série PWA.
export default function InstallBanner() {
  const [evenementInstallation, setEvenementInstallation] = useState<IEvenementInstallation | null>(
    null,
  )
  const [installeeMaintenant, setInstalleeMaintenant] = useState(false)
  const [nombreSessions, setNombreSessions] = useState(0)
  const [masque, setMasque] = useState(false)
  const [pret, setPret] = useState(false)

  // Ne s'affiche jamais au tout premier lancement (l'utilisatrice découvre
  // l'app, pas la peine de la harceler) : le compteur de sessions vit dans
  // Dexie pour survivre à la fermeture complète de l'app, contrairement à
  // un simple state React.
  useEffect(() => {
    async function initialiser() {
      const [paramSessions, paramMasque] = await Promise.all([
        db.parametres.get(CLE_SESSIONS),
        db.parametres.get(CLE_MASQUE),
      ])
      const compteurPrecedent = paramSessions ? Number(paramSessions.valeur) : 0
      const nouveauCompteur = compteurPrecedent + 1
      await db.parametres.put({ cle: CLE_SESSIONS, valeur: String(nouveauCompteur) })
      setNombreSessions(nouveauCompteur)
      setMasque(paramMasque?.valeur === '1')
      setPret(true)
    }
    initialiser()
  }, [])

  useEffect(() => {
    function gererInvite(event: Event) {
      // Empêche la mini-infobar automatique de Chrome : c'est notre bandeau
      // (cohérent avec le reste de l'UI) qui décide quand proposer
      // l'installation, pas le navigateur.
      event.preventDefault()
      setEvenementInstallation(event as IEvenementInstallation)
    }
    function gererInstallee() {
      setInstalleeMaintenant(true)
      setEvenementInstallation(null)
    }
    window.addEventListener('beforeinstallprompt', gererInvite)
    window.addEventListener('appinstalled', gererInstallee)
    return () => {
      window.removeEventListener('beforeinstallprompt', gererInvite)
      window.removeEventListener('appinstalled', gererInstallee)
    }
  }, [])

  async function masquer() {
    await db.parametres.put({ cle: CLE_MASQUE, valeur: '1' })
    setMasque(true)
  }

  async function installer() {
    if (!evenementInstallation) return
    await evenementInstallation.prompt()
    // L'événement n'est utilisable qu'une seule fois, qu'il soit accepté ou
    // refusé : le navigateur n'en redéclenchera pas un autre avant un
    // nouveau contexte de navigation.
    await evenementInstallation.userChoice
    setEvenementInstallation(null)
  }

  const iOSInstallable = estIOS() && estSafari()

  if (!pret || masque || installeeMaintenant || estInstallee() || nombreSessions < 2) return null
  if (!evenementInstallation && !iOSInstallable) return null

  const BoutonFermer = (
    <button
      type="button"
      onClick={masquer}
      aria-label="Fermer"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
      style={{ color: 'var(--texte-doux)' }}
    >
      <X className="h-4 w-4" aria-hidden="true" />
    </button>
  )

  // Le positionnement (fixed, au-dessus de la BottomNavBar) est géré par le
  // conteneur commun dans Layout.tsx, avec UpdateBanner — pas ici : les
  // deux doivent s'empiler l'un sur l'autre plutôt que se superposer.

  // Cas 1 — Android / Chrome desktop : l'API native d'installation existe.
  if (evenementInstallation) {
    return (
      <div
        className="flex items-center gap-3 rounded-t-2xl px-4 py-3"
        style={{
          backgroundColor: 'var(--surface)',
          boxShadow: '0 -4px 16px var(--ombre-carte)',
        }}
      >
        <p className="flex-1 text-sm text-texte">
          Installez Bolus pour un accès plus rapide, même hors connexion.
        </p>
        <button
          type="button"
          onClick={installer}
          className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium"
          style={{ backgroundColor: 'var(--interactif)', color: 'var(--fond)' }}
        >
          Installer
        </button>
        {BoutonFermer}
      </div>
    )
  }

  // Cas 2 — iOS / Safari : aucune API d'installation, il faut expliquer le
  // geste manuel (Partager → Sur l'écran d'accueil).
  return (
    <div
      className="rounded-t-2xl px-4 py-4"
      style={{
        backgroundColor: 'var(--surface)',
        boxShadow: '0 -4px 16px var(--ombre-carte)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-texte">
          Installez Bolus sur votre écran d'accueil
        </p>
        {BoutonFermer}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-texte">
          <Share className="h-4 w-4 shrink-0" style={{ color: 'var(--interactif)' }} aria-hidden="true" />
          <span>1. Touchez Partager</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-texte">
          <PlusSquare
            className="h-4 w-4 shrink-0"
            style={{ color: 'var(--interactif)' }}
            aria-hidden="true"
          />
          <span>2. puis Sur l'écran d'accueil</span>
        </div>
      </div>
    </div>
  )
}
