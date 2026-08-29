import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { ISurveillance } from '../../types'

interface IAccordeonImbriqueProps {
  items: ISurveillance[]
}

// Liste de sous-items dépliables, imbriquée dans un GroupePrecaution (voir
// PrecautionsFiche.tsx) — partagée par les groupes "Surveillance
// spécifique" et "Interactions médicamenteuses", qui suivent tous deux le
// même motif "titre court + détail". Un seul item ouvert à la fois
// (indexOuvert plutôt qu'un Set/tableau d'index) : sur un écran de
// téléphone, garder plusieurs détails dépliés en même temps ferait défiler
// inutilement loin pour retrouver les autres titres.
export default function AccordeonImbrique({ items }: IAccordeonImbriqueProps) {
  const [indexOuvert, setIndexOuvert] = useState<number | null>(null)

  return (
    <div className="flex flex-col">
      {items.map((item, index) => {
        const ouvert = indexOuvert === index
        const idPanneau = `accordeon-imbrique-panneau-${item.titre}`
        return (
          <div key={item.titre} className="border-b border-accent/25 last:border-b-0">
            <button
              type="button"
              onClick={() => setIndexOuvert(ouvert ? null : index)}
              aria-expanded={ouvert}
              aria-controls={idPanneau}
              className="tactile flex w-full items-center justify-between gap-3 py-2 text-left"
            >
              <span className="text-xs font-semibold text-texte">{item.titre}</span>
              <ChevronRight
                className={`h-3.5 w-3.5 shrink-0 text-accent transition-transform duration-200 ${
                  ouvert ? 'rotate-90' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {ouvert && (
              <p id={idPanneau} className="pb-2 text-xs leading-relaxed text-texte">
                {item.detail}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
