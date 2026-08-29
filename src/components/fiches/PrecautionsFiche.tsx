import { Activity, Blend, Baby } from 'lucide-react'
import type { ISurveillance, IGrossesseAllaitement } from '../../types'
import GroupePrecaution from './GroupePrecaution'
import AccordeonImbrique from './AccordeonImbrique'
import SourcesRcp from './SourcesRcp'

interface IPrecautionsFicheProps {
  surveillanceSpecifique: ISurveillance[]
  interactionsMedicamenteuses: ISurveillance[] | null
  grossesseAllaitement: IGrossesseAllaitement | null
  sourcesRcp: string[]
  dateRevision: string
}

// Zone "Précautions" en bas de fiche : regroupe surveillance spécifique,
// interactions médicamenteuses et grossesse/allaitement, chacun dans son
// propre groupe dépliable (voir GroupePrecaution), plus l'accès aux
// sources RCP. Remplace l'ancien SurveillanceAccordeon, qui n'affichait que
// la surveillance seule sans les deux autres catégories.
export default function PrecautionsFiche({
  surveillanceSpecifique,
  interactionsMedicamenteuses,
  grossesseAllaitement,
  sourcesRcp,
  dateRevision,
}: IPrecautionsFicheProps) {
  const aSurveillance = surveillanceSpecifique.length > 0
  const aInteractions = (interactionsMedicamenteuses?.length ?? 0) > 0

  // Rien à montrer dans cette zone : ni précaution, ni sources — n'arrive
  // pas en pratique (sourcesRcp existe toujours), mais reste correct si un
  // jour une fiche minimale en est dépourvue.
  if (!aSurveillance && !aInteractions && !grossesseAllaitement && sourcesRcp.length === 0) return null

  // Espace réservé par <main> pour la BottomNavBar/les bandeaux flottants
  // (voir Layout.tsx) : flex-1 suffit à remplir la hauteur DISPONIBLE de
  // <main>, mais ce padding réservé, lui, reste en dehors de cette hauteur
  // — sans compensation, il resterait un filet de --fond visible juste
  // avant la barre. margin-bottom négatif de la même valeur fait déborder
  // le fond teinté dans cette réserve (invisible de toute façon sous la
  // nav) ; padding-bottom repousse d'autant le contenu réel (ex. le lien
  // Sources RCP) pour qu'il ne se retrouve jamais cité sous la barre.
  const reserve = 'calc(var(--hauteur-nav) + 8px + var(--hauteur-bandeaux, 0px))'

  return (
    // flex-1 : dernier bloc de la page (voir FicheMedicament.tsx, lui-même
    // flex-1), son fond teinté doit toujours rejoindre le bas de l'écran,
    // même sur une fiche courte. relative + pastille en absolute -top-3 :
    // même motif que BlocInfo, la pastille chevauche la bordure supérieure
    // plutôt que de s'aligner dans le flux, sous elle.
    <div
      className="relative flex flex-1 flex-col border-t-[1.5px] px-6 pt-5"
      style={{
        backgroundColor: 'var(--zone-surveillance)',
        borderColor: 'var(--accent)',
        marginBottom: `calc(-1 * ${reserve})`,
        paddingBottom: `calc(${reserve} + 24px)`,
      }}
    >
      <span
        className="absolute -top-3 left-6 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--fond)' }}
      >
        Précautions
      </span>

      <div className="mt-2">
        {aSurveillance && (
          <GroupePrecaution icone={Activity} titre="Surveillance spécifique">
            <AccordeonImbrique items={surveillanceSpecifique} />
          </GroupePrecaution>
        )}

        {aInteractions && (
          <GroupePrecaution icone={Blend} titre="Interactions médicamenteuses">
            <AccordeonImbrique items={interactionsMedicamenteuses!} />
          </GroupePrecaution>
        )}

        {grossesseAllaitement && (
          <GroupePrecaution icone={Baby} titre="Grossesse / Allaitement">
            <div className="flex flex-col gap-2 pb-1.5">
              <div className="flex items-baseline gap-2.5">
                <span className="w-[72px] shrink-0 text-[11px] font-semibold uppercase text-texte-doux">
                  Grossesse
                </span>
                <span className="text-xs leading-relaxed text-texte">{grossesseAllaitement.grossesse}</span>
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="w-[72px] shrink-0 text-[11px] font-semibold uppercase text-texte-doux">
                  Allaitement
                </span>
                <span className="text-xs leading-relaxed text-texte">{grossesseAllaitement.allaitement}</span>
              </div>
            </div>
          </GroupePrecaution>
        )}
      </div>

      {sourcesRcp.length > 0 && <SourcesRcp sources={sourcesRcp} dateRevision={dateRevision} />}
    </div>
  )
}
