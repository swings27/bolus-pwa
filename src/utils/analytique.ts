import { track } from '@vercel/analytics'
import type { BeforeSendEvent } from '@vercel/analytics/react'

/** Les seuls événements que l'application a le droit d'émettre.
 *
 * Union fermée, et non un `track(nom, donnees)` libre : c'est le typage qui
 * garantit qu'aucune charge utile imprévue ne part, pas un commentaire qu'on
 * oublie de lire. Ajouter une propriété ici est un geste délibéré, visible en
 * revue.
 *
 * DEUX RÈGLES, dans cet ordre d'importance :
 *
 * 1. AUCUN IDENTIFIANT DE FICHE, JAMAIS, ET SURTOUT PAS SUR UN ÉVÉNEMENT DE
 *    CALCULATEUR. Toute l'isolation des calculateurs (voir
 *    scripts/verif-isolation-calculateurs.mjs et l'en-tête des fichiers de
 *    src/components/calculateurs/) sert à affirmer qu'il n'existe aucun lien
 *    entre un calculateur et une molécule. Un événement « calculateur ouvert
 *    depuis la fiche X » recréerait ce lien dans les données collectées, et
 *    le garde-fou ne le verrait pas : il contrôle les imports et les chaînes
 *    interdites dans le code, pas la charge utile envoyée à l'exécution.
 *
 * 2. Aucune donnée permettant d'identifier une personne : c'est ce qui rend
 *    vraie la phrase de la politique de confidentialité (« sans cookie et
 *    sans identifiant individuel »), et donc ce qui dispense l'application de
 *    bannière de consentement. Pas de terme de recherche saisi, pas de
 *    contenu libre, pas d'horodatage fin — uniquement des valeurs choisies
 *    dans les listes ci-dessous.
 *
 * Les valeurs reprennent telles quelles les identifiants internes de l'app
 * ("dosePoids", "perOs") plutôt qu'une forme retravaillée pour le tableau de
 * bord : une table de correspondance serait un troisième endroit à tenir à
 * jour, et une divergence silencieuse fausserait les mesures sans rien
 * casser.
 */
type Evenement =
  /** Quel calculateur est réellement utilisé. Sans aucun contexte de fiche :
   * le composant qui l'émet (CalculateurModal) n'en connaît aucune, par
   * construction. */
  | { nom: 'calculateur_ouvert'; onglet: 'debit' | 'dosePoids' | 'imc' | 'conversion' }
  /** Une recherche a mené à l'ouverture d'une fiche — dit si l'on cherche ou
   * si l'on navigue par catégories. Le terme saisi n'est pas transmis. */
  | { nom: 'recherche_aboutie' }
  /** Ajout seulement, jamais le retrait : ce qu'on veut savoir, c'est si la
   * fonctionnalité sert. */
  | { nom: 'favori_ajoute' }
  /** Répartition injectable / per os sur les fiches à deux voies. */
  | { nom: 'voie_choisie'; voie: 'injectable' | 'perOs' }
  /** L'application a été ajoutée à l'écran d'accueil — signal clé d'une
   * bêta : les testeurs installent-ils vraiment la PWA ? */
  | { nom: 'application_installee' }

/** Émet un événement de mesure d'audience. Enveloppe volontairement mince
 * autour de track() : son intérêt n'est pas ce qu'elle fait, mais ce qu'elle
 * empêche — appeler track() directement ailleurs contournerait l'union
 * ci-dessus. */
/** Retire l'URL de page des événements personnalisés avant leur envoi, en la
 * remplaçant par la racine du site.
 *
 * Indispensable, et pas seulement prudent : la bibliothèque joint
 * automatiquement l'URL courante à CHAQUE événement. Sans ce filtre,
 * « calculateur_ouvert » partait avec « /fiche/paracetamol » — le lien
 * calculateur ↔ molécule que toute l'isolation des calculateurs sert à
 * exclure, recréé par le comportement par défaut de la lib et non par la
 * charge utile. Contrôler les propriétés qu'on envoie ne suffisait pas.
 *
 * Le filtre s'applique à TOUS les événements personnalisés, pas seulement à
 * ceux du calculateur : le type BeforeSendEvent n'expose que `type` et
 * `url`, jamais le nom, donc on ne peut pas trier. C'est sans regret — ni
 * « favori_ajoute » ni « voie_choisie » n'ont besoin de savoir sur quelle
 * fiche ils ont eu lieu, seuls leurs totaux nous intéressent.
 *
 * Les PAGES VUES, elles, gardent leur URL complète : savoir quelles fiches
 * sont consultées est l'intérêt même de la mesure, et une consultation de
 * fiche n'a rien à voir avec un calculateur. */
export function anonymiserUrlEvenements(evenement: BeforeSendEvent): BeforeSendEvent {
  if (evenement.type !== 'event') return evenement
  return { ...evenement, url: new URL(evenement.url).origin + '/' }
}

export function suivre(evenement: Evenement): void {
  const { nom, ...proprietes } = evenement
  // track() distingue un appel sans propriétés d'un appel avec un objet
  // vide ; on garde la première forme pour les événements qui n'en ont pas.
  if (Object.keys(proprietes).length === 0) {
    track(nom)
    return
  }
  track(nom, proprietes)
}
