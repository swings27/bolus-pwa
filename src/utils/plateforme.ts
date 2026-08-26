// Détection de plateforme pour InstallBanner.tsx — uniquement pour adapter
// l'affichage du bandeau d'installation (aucune API d'installation
// standard n'existe sur iOS, contrairement à Android/Chrome). Ne sert à
// rien d'autre dans l'app : à ne pas réutiliser comme substitut à une
// vraie détection de fonctionnalité (feature detection) ailleurs.

export function estIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function estSafari(): boolean {
  const ua = navigator.userAgent
  // Chrome et Firefox sur iOS embarquent quand même "Safari" dans leur
  // user-agent (le moteur WebKit est imposé par Apple à tous les
  // navigateurs iOS), mais se signalent par "CriOS"/"FxiOS" au lieu de
  // "Chrome"/"Firefox" — sans cette exclusion, ils seraient pris pour
  // Safari alors qu'ils ne supportent pas l'ajout à l'écran d'accueil en
  // PWA installable.
  return /Safari/.test(ua) && !/Chrome|CriOS|Firefox|FxiOS/.test(ua)
}

export function estInstallee(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Forme spécifique à iOS : Safari n'expose pas display-mode de la même
    // façon que les navigateurs basés sur Chromium.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}
