import { Heart } from 'lucide-react'

interface IBoutonFavoriProps {
  actif: boolean
  onClick: () => void
}

// Cœur vide = pas favori, cœur plein = favori. La couleur reste
// var(--interactif) dans les deux états : seul le remplissage change, pour
// que le statut soit lisible sans dépendre de la couleur seule.
export default function BoutonFavori({ actif, onClick }: IBoutonFavoriProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={actif ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={actif}
      // 44x44px : zone tactile minimale (WCAG 2.5.5 / Apple HIG).
      className="flex h-11 w-11 shrink-0 items-center justify-center"
    >
      <Heart
        className="h-5 w-5"
        style={{ color: 'var(--interactif)' }}
        fill={actif ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
    </button>
  )
}
