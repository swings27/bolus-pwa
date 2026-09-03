import type { ReactNode } from 'react'
import type { IFormeOraleBloc } from '../../types'
import SectionPosologies from './SectionPosologies'
import TitreSectionFiche from './TitreSectionFiche'

interface IDetailPerOsProps {
  donnees: IFormeOraleBloc
}

type Tonalite = 'oui' | 'non'

// Dosé depuis --fiche-forme-fond (le fond réel de cette carte) plutôt qu'un
// token indépendant : voir la même remarque historique dans
// SelecteurForme/DetailInjectable, un token isolé s'est déjà retrouvé
// confondu avec le fond de carte en thème sombre.
function Badge({ tonalite, children }: { tonalite: Tonalite; children: ReactNode }) {
  const style =
    tonalite === 'oui'
      ? { backgroundColor: 'color-mix(in srgb, var(--validation-pastille) 28%, var(--fiche-forme-fond))', color: 'var(--validation)' }
      : { backgroundColor: 'color-mix(in srgb, var(--alerte) 20%, var(--fiche-forme-fond))', color: 'var(--alerte)' }

  return (
    <span className="shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={style}>
      {children}
    </span>
  )
}

// Les formes orales (comprimé, gélule, suspension...) sont affichées en deux
// temps, comme la voie injectable (Préparation puis Posologies) : d'abord un
// tableau compact des formes disponibles avec leurs jetons de contrainte
// (sécable, ouvrable), puis les posologies de chaque forme regroupées
// dans une seule section — plutôt qu'une grosse carte par forme mélangeant
// les deux, plus lourde à parcourir pour repérer une seule information.
export default function DetailPerOs({ donnees }: IDetailPerOsProps) {
  return (
    <div className="flex flex-col">
      {donnees.recommandation_sonde && (
        <div
          className="mb-5 rounded-xl p-3.5"
          // Couleur exacte du prototype (#B9CCA6 à 30%) plutôt que
          // --validation-pastille : ce token vaut #3F5D38 en clair (un vert
          // bien plus soutenu), pas la teinte sauge voulue ici.
          style={{ backgroundColor: 'color-mix(in srgb, #B9CCA6 30%, var(--fond))' }}
        >
          <div className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-wide" style={{ color: 'var(--validation)' }}>
            Par sonde — forme à privilégier
          </div>
          <div className="text-[13px] font-semibold leading-snug text-texte">{donnees.recommandation_sonde.forme_preferee}</div>
          {donnees.recommandation_sonde.alternative && (
            <div className="mt-1.5 text-[11.5px] text-texte-doux/80">Alternative : {donnees.recommandation_sonde.alternative}</div>
          )}
        </div>
      )}

      <TitreSectionFiche>Formes disponibles</TitreSectionFiche>
      <div className="flex flex-col gap-1.5">
        {donnees.formes.map((forme) => (
          <div
            key={forme.type}
            className="flex items-center justify-between gap-2 rounded-[10px] border border-texte/10 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-semibold leading-snug text-texte">{forme.type}</div>
              {forme.dosage && <div className="text-[10.5px] text-texte-doux">{forme.dosage}</div>}
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
              <Badge tonalite={forme.secable ? 'oui' : 'non'}>{forme.secable ? 'Sécable' : 'Non sécable'}</Badge>
              {/* ouverture_gelule à null (forme qui n'est pas une gélule) est
                  traité comme "non ouvrable", conformément à la consigne
                  d'afficher systématiquement les deux jetons sur chaque
                  forme, sans état neutre. */}
              <Badge tonalite={forme.ouverture_gelule ? 'oui' : 'non'}>
                {forme.ouverture_gelule ? 'Ouvrable' : 'Non ouvrable'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Une seule section, posologies de toutes les formes combinées :
          SectionPosologies dédoublonne les lignes qui partagent le même
          `population` (ex. la même indication répétée à l'identique sur
          plusieurs formes), voir dedupliquerPosologies(). */}
      <SectionPosologies
        titre="Posologies"
        posologies={donnees.formes.flatMap((forme) => forme.posologie_adulte)}
        contexte="oral"
      />
    </div>
  )
}
