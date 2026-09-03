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
        const idPanneau = `accordeon-imbrique-panneau-${index}`
        return (
          <div key={`${item.titre}-${index}`} className="border-b border-accent/25 last:border-b-0">
            <button
              type="button"
              onClick={() => setIndexOuvert(ouvert ? null : index)}
              aria-expanded={ouvert}
              aria-controls={idPanneau}
              className="tactile flex w-full items-center justify-between gap-3 py-2 text-left"
            >
              {/* Titre légèrement plus grand que le corps (13px vs 12px) pour
                  qu'il se détache nettement au premier coup d'œil, avant même
                  de déplier — la hiérarchie ne doit pas reposer sur le seul
                  gras. */}
              <span className="text-[13px] font-semibold text-texte">{item.titre}</span>
              <ChevronRight
                className={`h-3.5 w-3.5 shrink-0 text-accent transition-transform duration-200 ${
                  ouvert ? 'rotate-90' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            {ouvert && (
              // pl-0.5 : léger alinéa qui rattache visuellement le corps au
              // titre juste au-dessus, sans l'indentation plus marquée du
              // bloc "Conduite à tenir" ci-dessous.
              <div id={idPanneau} className="pb-2.5 pl-0.5">
                <p className="text-xs leading-relaxed text-texte-doux">{item.detail}</p>
                {item.conduite && (
                  // Fond mélangé à --zone-surveillance (le fond réel de cette
                  // zone, voir PrecautionsFiche.tsx), pas --fond : en thème
                  // sombre, --zone-surveillance EST déjà color-mix(15%
                  // accent, fond) — s'y mélanger à nouveau à un pourcentage
                  // proche (comme avec --fond ci-avant, 14% ≈ 15%) donnait un
                  // encadré quasi invisible sur son propre arrière-plan.
                  <div
                    className="mt-2 rounded-lg py-2 pl-2.5 pr-3"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--accent) 16%, var(--zone-surveillance))',
                      borderLeft: '3px solid var(--accent)',
                    }}
                  >
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--interactif)' }}>
                      Conduite à tenir
                    </p>
                    <p className="text-xs leading-relaxed text-texte">{item.conduite}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
