import type { IFormePerOs, IEtatFormeGalenique } from '../../types'
import Ligne from './LigneDetail'
import SectionPosologies from './SectionPosologies'
import TitreSectionFiche from './TitreSectionFiche'

interface IDetailPerOsProps {
  donnees: IFormePerOs
}

function BadgeOuiNon({ valeur }: { valeur: boolean }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-semibold"
      // var(--fond) comme texte : toujours contrasté sur validation/alerte
      // saturés, dans les deux thèmes (voir BlocInfo pour le même principe).
      style={{ backgroundColor: valeur ? 'var(--validation)' : 'var(--alerte)', color: 'var(--fond)' }}
    >
      {valeur ? 'Oui' : 'Non'}
    </span>
  )
}

const LABELS_SECABLE: Record<IEtatFormeGalenique, string> = {
  oui: 'Sécable',
  non: 'Non sécable',
  'a-verifier': 'À vérifier',
  'deja-liquide': 'Déjà liquide',
  'non-ouvrable': 'Non ouvrable',
}

const LABELS_ECRASABLE: Record<IEtatFormeGalenique, string> = {
  oui: 'Écrasable',
  non: 'Non écrasable',
  'a-verifier': 'À vérifier',
  'deja-liquide': 'Déjà liquide',
  'non-ouvrable': 'Non ouvrable',
}

// "À vérifier" est la seule valeur qui mérite d'attirer l'œil (une
// incertitude à lever avant le geste) ; "oui" (sécable/écrasable) est au
// contraire une bonne nouvelle pour le geste envisagé, d'où le vert —
// les autres états (non/déjà liquide/non ouvrable) restent neutres, ce
// sont des faits, pas des alertes.
//
// Fond dosé par color-mix() à partir de --fiche-forme-fond (le fond réel de
// la carte qui contient ces vignettes, voir FicheMedicament.tsx) plutôt
// qu'un token indépendant type --onglet-inactif : cette carte a changé de
// couleur plusieurs fois au fil des retours, et --onglet-inactif s'est
// retrouvée un jour strictement IDENTIQUE au nouveau fond de carte en
// sombre — vignette et carte confondues, seul le texte restait visible.
// Se baser sur --fiche-forme-fond garantit un contraste quelle que soit sa
// valeur future, sans avoir à re-synchroniser deux tokens à la main.
//
// Largeur fixe (pas shrink-to-content) : sans elle, chaque vignette prend
// juste la largeur de son propre texte ("Sécable" vs "Non écrasable"), et
// comme le groupe des deux vignettes reste plaqué à droite de la ligne,
// leur bord gauche saute d'une ligne à l'autre selon la longueur du texte
// — un alignement en colonnes qui n'en est pas un. Largeur commune aux
// deux champs (sécable/écrasable) : ils partagent le même espace de
// valeurs possibles ("À vérifier" notamment), pas la peine de deux largeurs.
function BadgeEtat({ etat, texte }: { etat: IEtatFormeGalenique; texte: string }) {
  const style =
    etat === 'a-verifier'
      ? { backgroundColor: 'color-mix(in srgb, var(--accent) 28%, var(--fiche-forme-fond))', color: 'var(--interactif)' }
      : etat === 'oui'
        ? {
            backgroundColor: 'color-mix(in srgb, var(--validation-pastille) 28%, var(--fiche-forme-fond))',
            color: 'var(--validation)',
          }
        : { backgroundColor: 'color-mix(in srgb, var(--texte) 15%, var(--fiche-forme-fond))', color: 'var(--texte-doux)' }

  return (
    <span
      className="box-border w-[84px] shrink-0 rounded-md px-1.5 py-1 text-center text-[9.5px] font-semibold leading-tight"
      style={style}
    >
      {texte}
    </span>
  )
}

// null = information non applicable/inconnue pour cette fiche → la ligne
// correspondante ne s'affiche pas du tout (pas de "Non renseigné").
export default function DetailPerOs({ donnees }: IDetailPerOsProps) {
  const aFormesStructurees = donnees.formesDisponibles !== null && donnees.formesDisponibles.length > 0

  return (
    <div className="flex flex-col">
      {donnees.formeAPrivilegier && (
        <div
          className="rounded-xl p-3.5"
          // Couleur exacte du prototype (#B9CCA6 à 30%) plutôt que
          // --validation-pastille : ce token vaut #3F5D38 en clair (un vert
          // bien plus soutenu), pas la teinte sauge voulue ici.
          style={{ backgroundColor: 'color-mix(in srgb, #B9CCA6 30%, var(--fond))' }}
        >
          <div
            className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-wide"
            style={{ color: 'var(--validation)' }}
          >
            Par sonde — forme à privilégier
          </div>
          <div className="text-[13px] font-semibold leading-snug text-texte">
            {donnees.formeAPrivilegier.nom}
            {donnees.formeAPrivilegier.marque && (
              <span className="font-medium text-texte-doux"> ({donnees.formeAPrivilegier.marque})</span>
            )}
          </div>
          {donnees.formeAPrivilegier.note && (
            <div className="mt-1.5 text-[11.5px] leading-snug text-texte-doux">{donnees.formeAPrivilegier.note}</div>
          )}
          {donnees.formeAPrivilegier.alternative && (
            <div className="mt-1.5 text-[11.5px] text-texte-doux/80">
              Alternative : {donnees.formeAPrivilegier.alternative}
            </div>
          )}
        </div>
      )}

      {aFormesStructurees ? (
        <div className={donnees.formeAPrivilegier ? 'mt-5' : ''}>
          <TitreSectionFiche>Formes disponibles</TitreSectionFiche>
          <div className="flex flex-col gap-1.5">
            {donnees.formesDisponibles!.map((forme) => (
              <div
                key={forme.nom}
                className="flex min-h-12 items-center justify-between gap-2 rounded-[10px] border border-texte/10 px-3 py-2"
              >
                <span className="flex-1 text-[11.5px] font-semibold leading-snug text-texte">{forme.nom}</span>
                <span className="flex shrink-0 gap-1.5">
                  <BadgeEtat etat={forme.secable} texte={LABELS_SECABLE[forme.secable]} />
                  <BadgeEtat etat={forme.ecrasable} texte={LABELS_ECRASABLE[forme.ecrasable]} />
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Repli pour les fiches qui n'ont pas encore la liste détaillée des
        // formes galéniques : les trois booléens génériques existants
        // restent affichés tels quels.
        <>
          {donnees.ecrasable !== null && (
            <Ligne label="Écrasable" disposition="ligne">
              <BadgeOuiNon valeur={donnees.ecrasable} />
            </Ligne>
          )}
          {donnees.divisible !== null && (
            <Ligne label="Divisible" disposition="ligne">
              <BadgeOuiNon valeur={donnees.divisible} />
            </Ligne>
          )}
          {donnees.passageEnSonde !== null && (
            <Ligne label="Passage en sonde" disposition="ligne">
              <BadgeOuiNon valeur={donnees.passageEnSonde} />
            </Ligne>
          )}
          {donnees.modalitesSonde && (
            <Ligne label="Modalités sonde" disposition="ligne">
              <span className="text-right text-sm font-semibold text-texte">{donnees.modalitesSonde}</span>
            </Ligne>
          )}
          {donnees.notes && (
            <Ligne label="Notes" disposition="ligne">
              <span className="text-right text-sm font-normal italic text-texte-doux">{donnees.notes}</span>
            </Ligne>
          )}
        </>
      )}

      {donnees.posologies && donnees.posologies.length > 0 && (
        <SectionPosologies
          titre="Posologie orale"
          posologies={donnees.posologies}
          ajustementPosologique={donnees.ajustementPosologique}
        />
      )}
    </div>
  )
}
