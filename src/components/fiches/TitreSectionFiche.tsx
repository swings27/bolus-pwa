import type { ReactNode } from 'react'

interface ITitreSectionFicheProps {
  children: ReactNode
}

// Titre de sous-section à l'intérieur de la carte de forme d'administration
// (Préparation, Posologies, Formes disponibles, Posologie orale) : plus
// voyant qu'un simple label discret pour qu'on identifie tout de suite à
// quelle section on a affaire en parcourant la carte, même en diagonale.
// Couleur --interactif (pas --texte) + soulignement fin : le même
// traitement qu'un intertitre, pas un simple libellé de champ.
export default function TitreSectionFiche({ children }: ITitreSectionFicheProps) {
  return (
    <div
      className="mb-2.5 border-b pb-1.5 text-[13px] font-bold uppercase tracking-wide"
      style={{ color: 'var(--interactif)', borderColor: 'color-mix(in srgb, var(--interactif) 25%, transparent)' }}
    >
      {children}
    </div>
  )
}
