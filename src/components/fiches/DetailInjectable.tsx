import type { IFormeIv } from '../../types'
import BlocAvertissement from '../layout/BlocAvertissement'
import SectionPosologies from './SectionPosologies'
import TitreSectionFiche from './TitreSectionFiche'

interface IDetailInjectableProps {
  donnees: IFormeIv
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
export default function DetailInjectable({ donnees }: IDetailInjectableProps) {
  return (
    <div className="flex flex-col">
      {donnees.reconstitution && (
        <div>
          <TitreSectionFiche>Reconstitution</TitreSectionFiche>
          <div className="rounded-xl p-3.5" style={CARTE_STYLE}>
            {donnees.reconstitution.solvant && <p className="text-xs text-texte">{donnees.reconstitution.solvant}</p>}
            {(donnees.reconstitution.volume_par_500mg_mL !== undefined ||
              donnees.reconstitution.volume_par_1000mg_mL !== undefined ||
              donnees.reconstitution.volume_par_2000mg_mL !== undefined) && (
              <ul className="mt-1.5 flex flex-col gap-0.5 text-[11.5px] text-texte-doux">
                {donnees.reconstitution.volume_par_500mg_mL !== undefined && (
                  <li>500 mg → {donnees.reconstitution.volume_par_500mg_mL} mL</li>
                )}
                {donnees.reconstitution.volume_par_1000mg_mL !== undefined && (
                  <li>1000 mg → {donnees.reconstitution.volume_par_1000mg_mL} mL</li>
                )}
                {donnees.reconstitution.volume_par_2000mg_mL !== undefined && (
                  <li>2000 mg → {donnees.reconstitution.volume_par_2000mg_mL} mL</li>
                )}
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

      {donnees.preparation.length > 0 && (
        <div className={donnees.reconstitution ? 'mt-5' : ''}>
          <TitreSectionFiche>Préparation</TitreSectionFiche>
          <div className="flex flex-col gap-2.5">
            {donnees.preparation.map((prep, index) => (
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

      {donnees.pictogrammes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {donnees.pictogrammes.map((pictogramme) => (
            <span
              key={pictogramme}
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-texte"
              style={{ backgroundColor: 'var(--fiche-forme-fond)' }}
            >
              {pictogramme}
            </span>
          ))}
        </div>
      )}

      <SectionPosologies
        titre="Posologies"
        posologies={donnees.administration.posologie}
        contexte="iv"
        ajustement={donnees.administration.note_ajustement}
      />
    </div>
  )
}
