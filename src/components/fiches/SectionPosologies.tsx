import BlocAvertissement from '../layout/BlocAvertissement'
import TitreSectionFiche from './TitreSectionFiche'
import type { IPosologie } from '../../types'

interface ISectionPosologiesProps {
  /** "Posologies" (injectable, plusieurs populations) ou "Posologie orale"
   * (per os, une seule population) — le libellé varie selon le contexte
   * d'appel, voir DetailInjectable/DetailPerOs. */
  titre: string
  posologies: IPosologie[]
  ajustementPosologique: string | null
}

// Cartes de posologie + rappel + ajustement éventuel, partagés entre
// DetailInjectable et DetailPerOs — même structure visuelle dans les deux
// formes d'administration, seul le nombre de populations affichées diffère.
export default function SectionPosologies({ titre, posologies, ajustementPosologique }: ISectionPosologiesProps) {
  return (
    <div className="mt-6">
      <TitreSectionFiche>{titre}</TitreSectionFiche>

      <div className="flex flex-col gap-2.5">
        {posologies.map((posologie) => (
          <div key={posologie.population} className="rounded-xl border border-texte/10 px-3.5 py-3">
            <div className="mb-2 text-sm font-semibold text-texte">{posologie.population}</div>
            <div className="flex justify-between gap-3.5 pr-1">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wide text-texte-doux/70">Dose</div>
                <div className="text-sm font-semibold text-texte">{posologie.dose}</div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wide text-texte-doux/70">Intervalle</div>
                <div className="text-sm font-semibold text-texte">{posologie.intervalle}</div>
              </div>
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-wide text-texte-doux/70">Max / 24 h</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--interactif)' }}>
                  {posologie.maxParJour}
                  {posologie.maxParJourDetail && (
                    <span className="ml-1 text-[10px] font-medium text-texte-doux">
                      {posologie.maxParJourDetail}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="pt-2.5 text-[10.5px] italic leading-relaxed text-texte-doux">
        Posologies indicatives — ne remplacent pas la prescription médicale.
      </p>

      {ajustementPosologique && (
        <div className="mt-3">
          <BlocAvertissement couleur="var(--ajustement)">
            <div>
              <p
                className="mb-1 text-[9.5px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--ajustement)' }}
              >
                Ajustement posologique
              </p>
              <p className="text-[11px] leading-relaxed text-texte">{ajustementPosologique}</p>
            </div>
          </BlocAvertissement>
        </div>
      )}
    </div>
  )
}
