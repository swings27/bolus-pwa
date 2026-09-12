import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { CLE_DISCLAIMER_ACCEPTE, CLE_ONBOARDING_VU } from '../../db/cles'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useSwipe } from '../../hooks/useSwipe'
import BoutonPrimaire from '../layout/BoutonPrimaire'
import Wordmark from '../layout/Wordmark'
import LogoO from './LogoO'

interface IEcranOnboarding {
  titre: string
  texte: string
}

const ECRANS: IEcranOnboarding[] = [
  {
    titre: 'Basé sur les RCP officiels',
    texte:
      "Bolus s'appuie sur les RCP (Résumé des Caractéristiques du Produit) publiés par l'ANSM, des guides et protocoles de l'OMéDIT ou des HUG (Hôpitaux Universitaires de Genève) ainsi que les recommandations de la SFAR (Société Française d'Anesthésie Réanimation). Vos pratiques de service peuvent différer sur certaines molécules, vérifiez toujours vos protocoles locaux ou solliciter les référents disponibles.",
  },
  {
    titre: 'Tous les médicaments, sans exception',
    texte:
      "Toutes les molécules du catalogue sont accessibles gratuitement. Recherchez par DCI (Dénomination Commune Internationale) ou nom commercial, chaque fiche vous permettra de préparer, administrer et surveiller la molécule. Les posologies des fiches sont indicatives, toujours se référer à la prescription et au médecin prescripteur. Utilisez les calculateurs indépendants pour vos débits et dilutions.",
  },
  {
    titre: "C'est parti !",
    texte:
      "La date de dernière révision est indiquée sur chaque fiche, pour que vous sachiez toujours ce que vous consultez. Bolus reste disponible pour répondre à vos questions via l'onglet Contact du menu.",
  },
]

// Position horizontale du "o" pour chacun des 3 écrans — glisse doucement
// de la gauche vers la droite au fil de la progression (voir .onboarding-o-piste).
const POSITIONS_O = ['18%', '50%', '82%']

// Onboarding affiché une seule fois, au tout premier lancement, une fois le
// disclaimer accepté (les deux sont des portes plein écran successives :
// pas de sens à empiler les deux). Composant autonome, monté
// inconditionnellement dans App.tsx : c'est sa propre lecture Dexie qui
// décide s'il a quelque chose à afficher, sur le même principe que
// DisclaimerModal.
export default function Onboarding() {
  // useLiveQuery renvoie `undefined` tant que la requête n'a pas résolu une
  // première fois — mais les deux clés lues peuvent *elles-mêmes* être
  // absentes (valeur "normale", pas un chargement). On enveloppe donc le
  // résultat dans un objet, comme dans useFiche.ts : c'est cet objet
  // englobant qui vaut `undefined` pendant la lecture, jamais son contenu.
  // La réactivité de useLiveQuery a un effet voulu : dès que
  // DisclaimerModal écrit CLE_DISCLAIMER_ACCEPTE dans Dexie, ce composant
  // se re-rend automatiquement et peut s'afficher, sans code de liaison
  // entre les deux.
  const etat = useLiveQuery(async () => ({
    disclaimerAccepte: (await db.parametres.get(CLE_DISCLAIMER_ACCEPTE)) !== undefined,
    onboardingVu: (await db.parametres.get(CLE_ONBOARDING_VU)) !== undefined,
  }))

  const [etape, setEtape] = useState(0)
  const conteneurRef = useRef<HTMLDivElement>(null)
  const dernierEcran = etape === ECRANS.length - 1

  const visible = etat !== undefined && etat.disclaimerAccepte && !etat.onboardingVu

  // `visible` passe à true aussi bien au tout premier lancement qu'à chaque
  // "Revoir la présentation" depuis Paramètres (qui se contente de
  // supprimer la clé Dexie) — le composant, lui, reste monté en permanence
  // (il ne fait que retourner `null`), donc `etape` ne se réinitialise pas
  // tout seul entre deux affichages sans cet effet.
  useEffect(() => {
    if (visible) setEtape(0)
  }, [visible])

  useFocusTrap(visible, conteneurRef)

  const swipe = useSwipe({
    onSwipeGauche: () => setEtape((e) => Math.min(e + 1, ECRANS.length - 1)),
    onSwipeDroite: () => setEtape((e) => Math.max(e - 1, 0)),
  })

  async function terminer() {
    await db.parametres.put({ cle: CLE_ONBOARDING_VU, valeur: new Date().toISOString() })
  }

  // Rien à afficher : lecture Dexie en cours, disclaimer pas encore
  // accepté, ou onboarding déjà vu lors d'un lancement précédent.
  if (!visible) return null

  return (
    // z-[60] : même plan que DisclaimerModal (monté juste avant dans
    // App.tsx, donc peint par-dessus si les deux se chevauchaient un
    // instant) — une porte plein écran de premier lancement reste toujours
    // au-dessus du reste de l'app.
    <div
      ref={conteneurRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-titre"
      className="fixed inset-0 z-[60] flex flex-col bg-fond"
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      <button
        type="button"
        onClick={terminer}
        className="tactile absolute right-3 z-10 rounded-lg px-3 py-2 text-sm font-medium text-texte-doux"
        style={{ top: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        Passer
      </button>

      <div className="relative mt-24 h-24 w-full shrink-0 sm:mt-28">
        <div className="onboarding-o-piste absolute top-0 -translate-x-1/2" style={{ left: POSITIONS_O[etape] }}>
          <div className="onboarding-o-rotation">
            <LogoO taille={88} />
          </div>
        </div>
      </div>

      <div key={etape} className="onboarding-contenu flex flex-1 flex-col items-center px-8 text-center">
        {etape === 0 && (
          // Sorti du groupe centré ci-dessous plutôt que d'y ajouter une
          // marge : avec justify-center, une marge en haut du groupe ne
          // "remonte" pas le message pour autant, elle grossit juste le
          // groupe que le centrage répartit ensuite pour moitié en haut
          // pour moitié en bas — le message de bienvenue reste ancré près
          // du "o" en haut, et le titre/texte se centrent dans l'espace
          // restant en dessous, sans être poussés vers le bas.
          // "Bienvenue sur" porte le poids visuel (texte large, comme un
          // vrai titre) ; le wordmark en dessous reste plus modeste — pas
          // besoin du plein-bleed (marges négatives) d'avant pour une
          // taille aussi contenue, une simple largeur en % du conteneur
          // suffit. height: 'auto' pour que le ratio intrinsèque du
          // wordmark reste toujours respecté (voir Wordmark.tsx).
          <div className="mt-6 flex w-full flex-col items-center gap-2">
            <span className="font-display text-3xl font-semibold text-texte">Bienvenue sur</span>
            <Wordmark style={{ width: '55%', height: 'auto' }} />
          </div>
        )}
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 id="onboarding-titre" className="font-display text-2xl font-semibold text-texte">
            {ECRANS[etape].titre}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-texte/80">{ECRANS[etape].texte}</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2" role="presentation">
        {ECRANS.map((_, index) => (
          <span
            key={index}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: index === etape ? '20px' : '8px',
              backgroundColor: index === etape ? 'var(--interactif)' : 'var(--onglet-inactif)',
            }}
          />
        ))}
      </div>

      <div
        className="flex items-center justify-between gap-3 px-6 pb-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
      >
        <button
          type="button"
          onClick={() => setEtape((e) => Math.max(e - 1, 0))}
          className="rounded-lg px-5 py-3 text-sm font-medium text-texte-doux"
          style={{ visibility: etape === 0 ? 'hidden' : 'visible' }}
        >
          Précédent
        </button>

        <BoutonPrimaire onClick={dernierEcran ? terminer : () => setEtape((e) => Math.min(e + 1, ECRANS.length - 1))}>
          {dernierEcran ? 'Commencer' : 'Suivant'}
        </BoutonPrimaire>
      </div>
    </div>
  )
}
