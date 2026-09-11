import type { IFormeIv, IReconstitution } from '../../types'
import BlocAvertissement from '../layout/BlocAvertissement'
import SectionPosologies from './SectionPosologies'
import TitreSectionFiche from './TitreSectionFiche'

interface IDetailInjectableProps {
  donnees: IFormeIv
  /** Ajustement posologique de la molécule (fiche.noteAjustement) : passé en
   * prop plutôt que lu dans `donnees`, parce qu'il ne dépend pas de la voie
   * et que DetailPerOs affiche exactement le même. */
  noteAjustement: string | null
  /** Variante rouge plein, molécule à préparation critique — voir
   * IFiche.noteAjustementAbsolue. */
  noteAjustementAbsolue: string | null
}

// mg (ex. amoxicilline) ou UI (ex. spiramycine, dosée en unités
// internationales plutôt qu'en poids) — la casse de l'unité est capturée
// telle quelle plutôt que fixée en dur, voir IReconstitution.
const MOTIF_VOLUME_RECONSTITUTION = /^volume_par_(\d+)(mg|UI)_mL$/

/** Extrait et trie les paliers `volume_par_<dose><unité>_mL` présents dans
 * la reconstitution — la liste des paliers (et l'unité) varie d'une
 * molécule à l'autre (voir le commentaire sur IReconstitution), donc on les
 * découvre plutôt que d'en supposer un jeu fixe. */
function volumesReconstitution(reconstitution: IReconstitution): { dose: number; unite: string; volumeMl: number }[] {
  return Object.entries(reconstitution)
    .map(([cle, valeur]) => {
      const correspondance = MOTIF_VOLUME_RECONSTITUTION.exec(cle)
      return correspondance && typeof valeur === 'number'
        ? { dose: Number(correspondance[1]), unite: correspondance[2], volumeMl: valeur }
        : null
    })
    .filter((v): v is { dose: number; unite: string; volumeMl: number } => v !== null)
    .sort((a, b) => a.dose - b.dose)
}

const LABELS_VOIE: Record<string, string> = {
  IVD: 'IVD',
  IVL: 'IVL',
  IM: 'IM',
  SC: 'SC',
  PSE: 'PSE',
  PERF: 'Perfusion',
}

const CARTE_STYLE = { backgroundColor: 'color-mix(in srgb, var(--texte) 5%, var(--fond))' }

// Les champs absents (ex. pas de reconstitution pour une solution déjà
// prête à l'emploi) n'existent tout simplement pas pour cette fiche — on ne
// les affiche pas du tout, plutôt qu'un "Non renseigné" qui suggérerait une
// donnée manquante à compléter.
export default function DetailInjectable({ donnees, noteAjustement, noteAjustementAbsolue }: IDetailInjectableProps) {
  // Même filtre que SectionPosologies pour les posologies : le périmètre V1
  // est adulte uniquement, une préparation marquée `population_type:
  // "pediatrie"` (ex. dilution néonatologie) ne doit donc pas apparaître ici.
  const preparationsAdultes = donnees.preparation.filter((prep) => prep.population_type !== 'pediatrie')
  const volumes = donnees.reconstitution ? volumesReconstitution(donnees.reconstitution) : []

  return (
    <div className="flex flex-col">
      {donnees.reconstitution && (
        <div>
          <TitreSectionFiche>Reconstitution</TitreSectionFiche>
          <div className="rounded-xl p-3.5" style={CARTE_STYLE}>
            {donnees.reconstitution.solvant && <p className="text-xs text-texte">{donnees.reconstitution.solvant}</p>}
            {volumes.length > 0 && (
              <ul className="mt-1.5 flex flex-col gap-0.5 text-[11.5px] text-texte-doux">
                {volumes.map(({ dose, unite, volumeMl }) => (
                  <li key={`${dose}-${unite}`}>
                    {dose} {unite} → {volumeMl} mL
                  </li>
                ))}
              </ul>
            )}
            {donnees.reconstitution.stabilite_avant_dilution && (
              <p className="mt-2.5 border-t border-texte/10 pt-2 text-[11px] leading-relaxed text-texte-doux">
                <b className="font-semibold">Stabilité</b> · {donnees.reconstitution.stabilite_avant_dilution}
              </p>
            )}
          </div>
        </div>
      )}

      {preparationsAdultes.length > 0 && (
        <div className={donnees.reconstitution ? 'mt-5' : ''}>
          <TitreSectionFiche>Préparation</TitreSectionFiche>
          <div className="flex flex-col gap-2.5">
            {preparationsAdultes.map((prep, index) => (
              <div key={index} className="rounded-xl p-3.5" style={CARTE_STYLE}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-md px-2 py-1 text-[10px] font-semibold"
                    style={{ backgroundColor: 'var(--texte)', color: 'var(--fond)' }}
                  >
                    {LABELS_VOIE[prep.voie] ?? prep.voie}
                  </span>
                  {prep.duree && <span className="text-[11.5px] font-semibold text-texte">{prep.duree}</span>}
                  {prep.contexte && <span className="text-[10.5px] italic text-texte-doux">{prep.contexte}</span>}
                </div>
                <p className="text-xs leading-relaxed text-texte">{prep.detail}</p>
                {prep.stabilite && (
                  <p className="mt-2.5 border-t border-texte/10 pt-2 text-[11px] leading-relaxed text-texte-doux">
                    <b className="font-semibold">Stabilité</b> · {prep.stabilite}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {donnees.incompatibilites.length > 0 && (
        <div className="mt-5">
          <BlocAvertissement couleur="var(--alerte)">
            <div>
              <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: 'var(--alerte)' }}>
                Incompatible en Y
              </p>
              <p className="text-[12.5px] leading-relaxed text-texte">
                {donnees.incompatibilites
                  .map((incompatibilite) =>
                    incompatibilite.niveau && incompatibilite.niveau !== 'absolu'
                      ? `${incompatibilite.substance} (${incompatibilite.niveau})`
                      : incompatibilite.substance,
                  )
                  .join(' · ')}
              </p>
            </div>
          </BlocAvertissement>
        </div>
      )}

      <SectionPosologies
        titre="Posologies"
        posologies={donnees.administration.posologie}
        contexte="iv"
        ajustement={noteAjustement}
        ajustementAbsolu={noteAjustementAbsolue}
      />
    </div>
  )
}
