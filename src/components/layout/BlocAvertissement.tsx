import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface IBlocAvertissementProps {
  /** Omise pour un bloc purement textuel (ex. fiche médicament : ajustement
   * posologique, incompatibilité en Y) — aucune icône n'est alors rendue,
   * plutôt que d'en imposer une qui ne correspond à rien. */
  icone?: LucideIcon
  couleur: string
  /** "teinte" (défaut) : fond très pâle + filet gauche saturé, pour un
   * avertissement qui accompagne le contenu. "pleine" : fond entièrement
   * saturé, réservé au signal qu'on ne doit pas pouvoir survoler sans le
   * voir — c'est alors à l'appelant de mettre son texte en blanc. */
  variante?: 'teinte' | 'pleine'
  children: ReactNode
}

// Bloc d'avertissement générique : icône + texte sur fond teinté, bordure
// gauche saturée de la même couleur. Partagé par CalculateurModal (rappel
// arithmétique), Contact (signalement d'erreur) et la fiche médicament —
// même structure, seuls la couleur, l'icône (le cas échéant) et le texte
// changent d'un usage à l'autre (chacun garde son propre <p>, donc sa
// propre taille/couleur de texte).
export default function BlocAvertissement({ icone: Icone, couleur, variante = 'teinte', children }: IBlocAvertissementProps) {
  const pleine = variante === 'pleine'
  return (
    <div
      className="flex items-start gap-2 rounded-lg px-4 py-3"
      style={
        pleine
          ? { backgroundColor: couleur }
          : {
              backgroundColor: `color-mix(in srgb, ${couleur} 10%, var(--fond))`,
              borderLeft: `3px solid ${couleur}`,
            }
      }
    >
      {/* Sur fond plein, l'icône reprend la couleur du texte de l'appelant
          (blanc) plutôt que celle du fond, où elle disparaîtrait. */}
      {Icone && (
        <Icone className="mt-0.5 h-4 w-4 shrink-0" style={pleine ? undefined : { color: couleur }} aria-hidden="true" />
      )}
      {children}
    </div>
  )
}
