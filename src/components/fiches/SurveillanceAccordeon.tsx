import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { ISurveillance } from '../../types'

interface ISurveillanceAccordeonProps {
  items: ISurveillance[]
}

// Accordéon de surveillance infirmière. Un seul item ouvert à la fois
// (indexOuvert plutôt qu'un Set/tableau d'index) : sur un écran de
// téléphone, garder plusieurs détails dépliés en même temps ferait défiler
// inutilement loin pour retrouver les autres titres.
export default function SurveillanceAccordeon({ items }: ISurveillanceAccordeonProps) {
  const [indexOuvert, setIndexOuvert] = useState<number | null>(null)

  // Rien à surveiller de spécifique pour cette fiche → pas de section du
  // tout, plutôt qu'un bloc vide.
  if (items.length === 0) return null

  return (
    <div className="w-full py-6" style={{ backgroundColor: 'var(--zone-surveillance)' }}>
      <div className="px-6">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--fond)' }}
        >
          Surveillance spécifique
        </span>

        <div className="mt-3 h-px w-full" style={{ backgroundColor: 'var(--accent)' }} />

        <div className="mt-1 flex flex-col">
          {items.map((item, index) => {
            const ouvert = indexOuvert === index
            const idPanneau = `surveillance-panneau-${index}`
            return (
              <div key={item.titre} className="border-b border-texte/10 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setIndexOuvert(ouvert ? null : index)}
                  aria-expanded={ouvert}
                  aria-controls={idPanneau}
                  className="tactile flex w-full items-center justify-between gap-3 py-3 text-left"
                >
                  <span className="text-sm font-semibold text-texte">{item.titre}</span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-texte/60 transition-transform duration-200 ${
                      ouvert ? 'rotate-90' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {ouvert && (
                  <p id={idPanneau} className="pb-3 text-sm text-texte-doux">
                    {item.detail}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
