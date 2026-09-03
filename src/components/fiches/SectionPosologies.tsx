import type { ReactNode } from 'react'
import BlocAvertissement from '../layout/BlocAvertissement'
import TitreSectionFiche from './TitreSectionFiche'
import {
  dedupliquerPosologies,
  formaterDose,
  formaterIntervalle,
  formaterMax,
  formaterPopulationDetail,
  libelleCategoriePosologie,
} from '../../utils/posologie'
import type { IPosologieRcp } from '../../types'

interface ISectionPosologiesProps {
  titre: string
  posologies: IPosologieRcp[]
  /** Change le libellé des groupes de voie (voir libelleCategoriePosologie)
   * — "generale" ne veut pas dire la même chose en IV et en oral. */
  contexte: 'iv' | 'oral'
  ajustement?: string | null
}

function Puce({ children, couleur }: { children: ReactNode; couleur: string }) {
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold"
      style={{ backgroundColor: `color-mix(in srgb, ${couleur} 20%, transparent)`, color: couleur }}
    >
      {children}
    </span>
  )
}

function CartePosologie({ p }: { p: IPosologieRcp }) {
  const detailPopulation = formaterPopulationDetail(p)
  const max = formaterMax(p)

  return (
    <div className="rounded-xl border border-texte/10 px-3.5 py-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-snug text-texte">{p.population}</div>
          {detailPopulation && <div className="mt-0.5 text-[11px] text-texte-doux">{detailPopulation}</div>}
        </div>
        {p.tdm_requis && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Puce couleur="var(--interactif)">Surveillance sanguine</Puce>
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-between gap-3.5 pr-1">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wide text-texte-doux/70">Dose</div>
          <div className="text-sm font-semibold text-texte">{formaterDose(p)}</div>
        </div>
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-wide text-texte-doux/70">Intervalle</div>
          <div className="text-sm font-semibold text-texte">{formaterIntervalle(p)}</div>
        </div>
        {max && (
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-texte-doux/70">Max / 24 h</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--interactif)' }}>
              {max}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Regroupe et affiche les lignes de posologie adulte d'un bloc iv ou de
// l'ensemble des formes orales d'un médicament, groupées par voie/protocole
// (categorie). Le périmètre pédiatrie existe dans les données
// (population_type: "pediatrie") mais n'est pas encore affiché — seul le
// filtrage ci-dessous en décide, pas les fichiers JSON eux-mêmes, qui
// restent complets. Còté oral, plusieurs formes galéniques partagent souvent
// la même indication à l'identique (ex. "Douleur légère à modérée / fièvre"
// sur un comprimé et une gélule) : dedupliquerPosologies() ne garde alors
// que la ligne la plus englobante plutôt que d'afficher le même conseil
// plusieurs fois — voir ce helper pour la règle exacte.
export default function SectionPosologies({ titre, posologies, contexte, ajustement }: ISectionPosologiesProps) {
  const adultes = dedupliquerPosologies(posologies.filter((p) => p.population_type !== 'pediatrie'))
  if (adultes.length === 0) return null

  const groupes = new Map<string, IPosologieRcp[]>()
  for (const p of adultes) {
    const cle = p.categorie ?? 'generale'
    const groupe = groupes.get(cle)
    if (groupe) groupe.push(p)
    else groupes.set(cle, [p])
  }

  return (
    <div className="mt-6">
      <TitreSectionFiche>{titre}</TitreSectionFiche>

      {[...groupes.entries()].map(([cle, items]) => (
        <div key={cle} className="mb-3.5 last:mb-0">
          {groupes.size > 1 && (
            <div className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-texte-doux">
              {libelleCategoriePosologie(cle, contexte)}
            </div>
          )}
          <div className="flex flex-col gap-2.5">
            {items.map((p, index) => (
              <CartePosologie key={`${cle}-${index}`} p={p} />
            ))}
          </div>
        </div>
      ))}

      <p className="pt-2.5 text-[10.5px] italic leading-relaxed text-texte-doux">
        Posologies indicatives — ne remplacent pas la prescription médicale.
      </p>

      {ajustement && (
        <div className="mt-3">
          <BlocAvertissement couleur="var(--ajustement)">
            <div>
              <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ajustement)' }}>
                Ajustement posologique
              </p>
              <p className="text-[11px] leading-relaxed text-texte">{ajustement}</p>
            </div>
          </BlocAvertissement>
        </div>
      )}
    </div>
  )
}
