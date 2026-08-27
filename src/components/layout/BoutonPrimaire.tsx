import type { ReactNode } from 'react'

interface IBoutonPrimaireProps {
  onClick: () => void
  children: ReactNode
}

// Bouton d'action primaire générique (retour à l'accueil, réessayer,
// recharger l'app...) : fond --interactif plein, texte --fond pour un
// contraste garanti dans les deux thèmes (même principe que BlocInfo.tsx).
// Centralisé ici après avoir été recopié à la main dans 5 endroits, avec
// deux variantes de texte qui avaient fini par diverger sans que rien ne le
// signale (--fond à un endroit, --surface — un token différent — à un autre).
export default function BoutonPrimaire({ onClick, children }: IBoutonPrimaireProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-5 py-3 text-sm font-medium"
      style={{ backgroundColor: 'var(--interactif)', color: 'var(--fond)' }}
    >
      {children}
    </button>
  )
}
