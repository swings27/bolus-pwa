import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface IBlocAvertissementProps {
  /** Omise pour un bloc purement textuel (ex. fiche médicament : ajustement
   * posologique, incompatibilité en Y) — aucune icône n'est alors rendue,
   * plutôt que d'en imposer une qui ne correspond à rien. */
  icone?: LucideIcon
  couleur: string
  children: ReactNode
}

// Bloc d'avertissement générique : icône + texte sur fond teinté, bordure
// gauche saturée de la même couleur. Partagé par CalculateurModal (rappel
// arithmétique), Contact (signalement d'erreur) et la fiche médicament —
// même structure, seuls la couleur, l'icône (le cas échéant) et le texte
// changent d'un usage à l'autre (chacun garde son propre <p>, donc sa
// propre taille/couleur de texte).
export default function BlocAvertissement({ icone: Icone, couleur, children }: IBlocAvertissementProps) {
  return (
    <div
      className="flex items-start gap-2 rounded-lg px-4 py-3"
      style={{
        backgroundColor: `color-mix(in srgb, ${couleur} 10%, var(--fond))`,
        borderLeft: `3px solid ${couleur}`,
      }}
    >
      {Icone && <Icone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: couleur }} aria-hidden="true" />}
      {children}
    </div>
  )
}
