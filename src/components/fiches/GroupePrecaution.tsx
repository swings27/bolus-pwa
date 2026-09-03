import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import ChevronBascule from './ChevronBascule'

interface IGroupePrecautionProps {
  icone: LucideIcon
  titre: string
  children: ReactNode
}

// Une rangée dépliable de la zone Précautions (voir PrecautionsFiche.tsx) :
// icône dans un badge rond, titre, chevron. Son état d'ouverture est
// indépendant des autres groupes (contrairement aux sous-items
// d'AccordeonImbrique, où un seul reste ouvert à la fois) — rien
// n'indique dans la maquette qu'ouvrir "Interactions médicamenteuses"
// doive refermer "Surveillance spécifique".
export default function GroupePrecaution({ icone: Icone, titre, children }: IGroupePrecautionProps) {
  const [ouvert, setOuvert] = useState(false)
  const idPanneau = `groupe-precaution-panneau-${titre}`

  return (
    <div className="border-b border-accent/25 last:border-b-0">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-controls={idPanneau}
        className="tactile flex w-full items-center justify-between gap-2 py-2.5"
      >
        <span className="flex items-center gap-2.5 text-[13px] font-semibold text-texte">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 28%, transparent)' }}
          >
            <Icone className="h-4 w-4" style={{ color: 'var(--interactif)' }} aria-hidden="true" />
          </span>
          {titre}
        </span>
        <ChevronBascule ouvert={ouvert} className="h-4 w-4 text-accent" />
      </button>
      {ouvert && (
        <div id={idPanneau} className="pb-1.5 pl-[39px]">
          {children}
        </div>
      )}
    </div>
  )
}
