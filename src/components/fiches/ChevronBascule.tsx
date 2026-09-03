import { ChevronRight } from 'lucide-react'

interface IChevronBasculeProps {
  ouvert: boolean
  /** Taille et couleur, propres à chaque contexte d'usage (GroupePrecaution,
   * AccordeonImbrique, SectionPosologies...) — seule la rotation/transition
   * est partagée, voir plus bas. */
  className: string
}

// Chevron de bascule partagé par les accordéons de la fiche
// (GroupePrecaution, AccordeonImbrique, SectionPosologies) : même rotation
// de 90° et même transition pour les trois, qui ne divergent que par la
// taille/couleur de l'icône selon leur contexte visuel.
export default function ChevronBascule({ ouvert, className }: IChevronBasculeProps) {
  return (
    <ChevronRight
      className={`shrink-0 transition-transform duration-200 ${className} ${ouvert ? 'rotate-90' : ''}`}
      aria-hidden="true"
    />
  )
}
