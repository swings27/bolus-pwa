import { useState } from 'react'
import type { ReactNode } from 'react'
import BlocAvertissement from '../layout/BlocAvertissement'
import TitreSectionFiche from './TitreSectionFiche'
import ChevronBascule from './ChevronBascule'
import {
  dedupliquerPosologies,
  formaterDose,
  formaterDoseAbsolue,
  formaterDoseParKg,
  formaterIntervalle,
  formaterMax,
  formaterPopulationDetail,
  libelleCategoriePosologie,
  libelleIntervalle,
} from '../../utils/posologie'
import type { IPosologieRcp } from '../../types'

interface ISectionPosologiesProps {
  titre: string
  posologies: IPosologieRcp[]
  /** Change le libellé des groupes de voie (voir libelleCategoriePosologie)
   * — "generale" ne veut pas dire la même chose en IV et en oral. */
  contexte: 'iv' | 'oral'
  ajustement?: string | null
  /** Même information que `ajustement`, pour une molécule à préparation
   * critique — rendue en rouge plein à texte blanc juste en dessous. */
  ajustementAbsolu?: string | null
}

function Puce({ children, couleur }: { children: ReactNode; couleur: string }) {
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-[0.59375rem] font-semibold"
      style={{ backgroundColor: `color-mix(in srgb, ${couleur} 20%, transparent)`, color: couleur }}
    >
      {children}
    </span>
  )
}

function ChampPosologie({ libelle, valeur, accent }: { libelle: string; valeur: ReactNode; accent?: boolean }) {
  return (
    <div>
      <div className="text-[0.5625rem] font-semibold uppercase tracking-wide text-texte-doux/70">{libelle}</div>
      <div className="text-sm font-semibold text-texte" style={accent ? { color: 'var(--interactif)' } : undefined}>
        {valeur}
      </div>
    </div>
  )
}

function CartePosologie({ p }: { p: IPosologieRcp }) {
  const detailPopulation = formaterPopulationDetail(p)
  const max = formaterMax(p)

  // Une ligne peut exprimer la dose de deux façons à la fois (ex. atropine
  // pédiatrie : "0,01-0,02 mg/kg" ET un plafond absolu "0,6 mg") — les deux
  // sont des informations de sécurité distinctes, on les affiche toutes les
  // deux plutôt que d'en masquer une par ordre de priorité comme le fait
  // formaterDose() pour le cas simple (une seule représentation). Prudence
  // délibérée, surtout pour la pédiatrie où l'écart entre les deux peut
  // compter.
  const doseParKg = formaterDoseParKg(p)
  const doseAbsolue = formaterDoseAbsolue(p)
  const champsDose: { libelle: string; valeur: ReactNode }[] =
    doseParKg && doseAbsolue
      ? [
          {
            libelle: 'Dose (au poids)',
            // Le suffixe "/ jour" ressort en gras : une dose journalière
            // affichée à côté d'une dose absolue par prise ne doit jamais
            // pouvoir être confondue avec elle, l'écart entre les deux
            // pouvant compter (voir formaterDoseParKg).
            valeur: doseParKg.suffixe ? (
              <>
                {doseParKg.valeur} <b className="font-bold">{doseParKg.suffixe}</b>
              </>
            ) : (
              doseParKg.valeur
            ),
          },
          { libelle: 'Dose (absolue)', valeur: doseAbsolue },
        ]
      : [{ libelle: 'Dose', valeur: formaterDose(p) }]

  const champs: { libelle: string; valeur: ReactNode; accent?: boolean }[] = [
    ...champsDose,
    { libelle: libelleIntervalle(p), valeur: formaterIntervalle(p) },
    ...(max ? [{ libelle: 'Max / 24 h', valeur: max, accent: true }] : []),
  ]

  return (
    <div className="rounded-xl border border-texte/10 px-3.5 py-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-snug text-texte">{p.population}</div>
          {detailPopulation && <div className="mt-0.5 text-[0.6875rem] text-texte-doux">{detailPopulation}</div>}
        </div>
        {p.tdm_requis && (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Puce couleur="var(--interactif)">Surveillance sanguine</Puce>
          </div>
        )}
      </div>
      {/* grid (pas flex + justify-between) : chaque colonne occupe toujours
          la même largeur, donc démarre au même x quelle que soit la longueur
          du texte de la carte précédente ou suivante — avec
          justify-between, la position de "Intervalle" dépendait de la
          largeur du texte de "Dose" et sautait d'une carte à l'autre.
          2 colonnes (grille 2x2) quand les 4 champs sont présents (dose au
          poids + dose absolue + intervalle + max), 3 colonnes sinon. */}
      <div className={`grid gap-3.5 pr-1 ${champs.length > 3 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {champs.map((champ) => (
          <ChampPosologie key={champ.libelle} libelle={champ.libelle} valeur={champ.valeur} accent={champ.accent} />
        ))}
      </div>
    </div>
  )
}

// Groupe "Protocole particulier" / "Indication particulière" (categorie
// "speciale") : replié par défaut pour gagner de la place, ces protocoles
// étant consultés moins souvent que la posologie standard — les autres
// groupes (voie IV, IM, SC...) restent toujours visibles.
function BlocGroupe({ titre, repliable, children }: { titre: string | null; repliable: boolean; children: ReactNode }) {
  const [ouvert, setOuvert] = useState(!repliable)

  if (!titre) return <>{children}</>

  if (!repliable) {
    return (
      <>
        <div className="mb-1.5 text-[0.65625rem] font-semibold uppercase tracking-wide text-texte-doux">{titre}</div>
        {children}
      </>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        className="tactile mb-1.5 flex items-center gap-1 text-left"
      >
        <span className="text-[0.65625rem] font-semibold uppercase tracking-wide text-texte-doux">{titre}</span>
        <ChevronBascule ouvert={ouvert} className="h-3 w-3 text-texte-doux" />
      </button>
      {ouvert && children}
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
export default function SectionPosologies({
  titre,
  posologies,
  contexte,
  ajustement,
  ajustementAbsolu,
}: ISectionPosologiesProps) {
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
          {/* Le libellé de groupe s'affiche aussi quand c'est le seul groupe,
              dès lors qu'il s'agit d'un protocole "speciale" : le signaler
              reste utile même seul, et c'est ce même libellé qui porte le
              bouton de repli (BlocGroupe ignore `repliable` sans titre). */}
          <BlocGroupe
            titre={groupes.size > 1 || cle === 'speciale' ? libelleCategoriePosologie(cle, contexte) : null}
            repliable={cle === 'speciale'}
          >
            <div className="flex flex-col gap-2.5">
              {items.map((p, index) => (
                <CartePosologie key={`${cle}-${index}`} p={p} />
              ))}
            </div>
          </BlocGroupe>
        </div>
      ))}

      <p className="pt-2.5 text-[0.65625rem] italic leading-relaxed text-texte-doux">
        Posologies indicatives — ne remplacent pas la prescription médicale.
      </p>

      {ajustement && (
        <div className="mt-3">
          <BlocAvertissement couleur="var(--ajustement)" titre="Ajustement posologique">
            <p className="text-[0.6875rem] leading-relaxed text-texte">{ajustement}</p>
          </BlocAvertissement>
        </div>
      )}

      {/* Même emplacement que l'ajustement ci-dessus, mais en rouge plein à
          texte blanc : réservé aux molécules dont la préparation ne souffre
          aucune approximation (stupéfiants, marge thérapeutique étroite). Les
          deux blocs s'affichent si les deux champs sont renseignés — aucun
          n'écrase l'autre. */}
      {ajustementAbsolu && (
        <div className="mt-3">
          <BlocAvertissement couleur="var(--alerte-pleine)" variante="pleine" titre="Ajustement posologique">
            <p className="text-[0.6875rem] font-medium leading-relaxed text-white">{ajustementAbsolu}</p>
          </BlocAvertissement>
        </div>
      )}
    </div>
  )
}
