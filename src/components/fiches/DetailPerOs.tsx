import type { ReactNode } from 'react'
import type { IFormeOraleBloc } from '../../types'
import SectionPosologies from './SectionPosologies'
import TitreSectionFiche from './TitreSectionFiche'

interface IDetailPerOsProps {
  donnees: IFormeOraleBloc
}

type Tonalite = 'oui' | 'non' | 'neutre'

// Dosé depuis --fiche-forme-fond (le fond réel de cette carte) plutôt qu'un
// token indépendant : voir la même remarque historique dans
// SelecteurForme/DetailInjectable, un token isolé s'est déjà retrouvé
// confondu avec le fond de carte en thème sombre.
//
// Largeur fixe (pas shrink-to-content) : sans elle, chaque jeton prend juste
// la largeur de son propre texte ("Sécable" vs "Non sécable"), et comme les
// deux jetons restent plaqués à droite de la ligne, leur bord gauche saute
// d'une forme à l'autre selon la longueur du texte — un alignement en
// colonnes qui n'en est pas un.
function Badge({ tonalite, children }: { tonalite: Tonalite; children: ReactNode }) {
  const style =
    tonalite === 'oui'
      ? { backgroundColor: 'color-mix(in srgb, var(--validation-pastille) 28%, var(--fiche-forme-fond))', color: 'var(--validation)' }
      : tonalite === 'non'
        ? { backgroundColor: 'color-mix(in srgb, var(--alerte) 20%, var(--fiche-forme-fond))', color: 'var(--alerte)' }
        : { backgroundColor: 'color-mix(in srgb, var(--texte) 15%, var(--fiche-forme-fond))', color: 'var(--texte-doux)' }

  return (
    <span className="box-border w-[92px] shrink-0 rounded-full px-1.5 py-1 text-center text-[10.5px] font-semibold" style={style}>
      {children}
    </span>
  )
}

// Une forme déjà sous forme liquide (sirop, solution, suspension...) n'a ni
// sécabilité ni ouverture de gélule à proprement parler — "Non sécable" /
// "Non ouvrable" y suggéraient à tort une contrainte, alors que la question
// ne se pose simplement pas pour ce type de forme.
function estDejaLiquide(type: string): boolean {
  return type.toLowerCase().includes('buvable')
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
              {estDejaLiquide(forme.type) ? (
                <Badge tonalite="neutre">Déjà liquide</Badge>
              ) : (
                <>
                  <Badge tonalite={forme.secable ? 'oui' : 'non'}>{forme.secable ? 'Écrasable' : 'Non écrasable'}</Badge>
                  {/* ouverture_gelule à null (forme qui n'est pas une gélule)
                      est traité comme "non ouvrable", conformément à la
                      consigne d'afficher systématiquement les deux jetons sur
                      chaque forme, sans état neutre. */}
                  <Badge tonalite={forme.ouverture_gelule ? 'oui' : 'non'}>
                    {forme.ouverture_gelule ? 'Ouvrable' : 'Non ouvrable'}
                  </Badge>
                </>
              )}
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
