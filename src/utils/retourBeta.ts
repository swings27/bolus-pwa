import { db } from '../db'
import { CLE_FICHES_VERSION } from '../db/cles'
import { APP } from '../data/editeur'

// Rappel affiché juste avant le bloc technique de chaque retour bêta : une
// fiche remontée avec un exemple concret ("chez ce patient...") ferait de
// l'autrice une responsable de traitement de données de santé au sens RGPD,
// ce qui exigerait un hébergement certifié HDS — hors de portée d'une bêta.
const MENTION_DONNEES_PATIENT = "Merci de ne mentionner aucune information concernant un patient."

async function versionFichesActuelle(): Promise<string> {
  const parametre = await db.parametres.get(CLE_FICHES_VERSION)
  return parametre?.valeur ?? 'inconnue'
}

// Réduit le user-agent brut ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_4...")
// à une forme lisible par quelqu'un qui répond au retour ("iPhone /
// Safari"), plutôt que de lui faire déchiffrer la chaîne technique complète.
function appareilSimplifie(): string {
  const ua = navigator.userAgent

  let appareil = 'Ordinateur'
  if (/iPad/.test(ua)) appareil = 'iPad'
  else if (/iPhone/.test(ua)) appareil = 'iPhone'
  else if (/Android/.test(ua)) appareil = 'Android'

  // Ordre de test important : les navigateurs iOS embarquent tous WebKit et
  // mentionnent "Safari" dans leur user-agent (CriOS = Chrome, FxiOS =
  // Firefox) — les variantes doivent être détectées avant Safari lui-même.
  let navigateur = 'Navigateur inconnu'
  if (/EdgA?\//.test(ua)) navigateur = 'Edge'
  else if (/CriOS\//.test(ua) || (/Chrome\//.test(ua) && !/OPR\//.test(ua))) navigateur = 'Chrome'
  else if (/FxiOS\//.test(ua) || /Firefox\//.test(ua)) navigateur = 'Firefox'
  else if (/Safari\//.test(ua)) navigateur = 'Safari'

  return `${appareil} / ${navigateur}`
}

interface IOptionsMailtoRetour {
  sujet: string
  route: string
  /** Ligne(s) libres ajoutées en tête du corps, avant "Votre retour :"
   * (ex. un champ "Molécule concernée" pour le signalement d'erreur). */
  enTete?: string
}

// Construit une URL mailto: pré-remplie avec le contexte technique courant,
// commun au bouton de retour bêta et au lien "Signaler une erreur" de la
// page Contact — pour que la testeuse n'ait jamais à recopier elle-même la
// version de l'app, l'écran concerné ou son appareil.
export async function construireMailtoRetour({ sujet, route, enTete }: IOptionsMailtoRetour): Promise<string> {
  const versionFiches = await versionFichesActuelle()
  const appareil = appareilSimplifie()

  const lignes = [
    ...(enTete ? [enTete, ''] : []),
    'Votre retour :',
    '(décrivez ici ce que vous avez constaté)',
    '',
    MENTION_DONNEES_PATIENT,
    '',
    '---',
    'Informations techniques, ne pas modifier',
    `Version app : ${APP.version}`,
    `Version fiches : ${versionFiches}`,
    `Écran : ${route}`,
    `Appareil : ${appareil}`,
  ]

  // encodeURIComponent traduit \r\n en %0D%0A caractère par caractère : le
  // format explicitement attendu par mailto:, plutôt que le simple \n
  // qu'un \n direct produirait (%0A seul, que certains clients mail
  // n'interprètent pas comme un retour à la ligne).
  const corps = encodeURIComponent(lignes.join('\r\n'))

  return `mailto:${APP.contact}?subject=${encodeURIComponent(sujet)}&body=${corps}`
}
