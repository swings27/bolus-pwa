import { useEffect, useState } from 'react'
import { db } from '../db'
import type { IFiche } from '../types'

const CLE_VERSION_FICHES = 'fiches_version'
const CLE_DATE_CATALOGUE = 'fiches_date_catalogue'

interface IVersionFichier {
  version: string
  datefiches: string
}

interface IEtatChargement {
  loading: boolean
  error: string | null
  reessayer: () => void
}

// Centralise la vérification de statut HTTP : un fetch() qui "réussit" mais
// renvoie une page d'erreur (404/500) plante sinon plus loin au parsing
// JSON avec un message technique ("Unexpected token < in JSON..."), affiché
// tel quel à l'utilisatrice.
async function recupererJson<T>(url: string): Promise<T> {
  const reponse = await fetch(url)
  if (!reponse.ok) {
    throw new Error(`Le serveur est indisponible pour le moment (${reponse.status}).`)
  }
  return reponse.json()
}

// Ce hook synchronise les fiches médicaments du CDN (fichiers JSON
// statiques dans /public/data/) vers Dexie (IndexedDB), pour que l'app
// puisse ensuite lire les fiches localement, sans réseau. Il ne doit
// s'exécuter qu'une fois au démarrage de l'app (appelé dans App.tsx).
export function useFichesLoader(): IEtatChargement {
  const [etat, setEtat] = useState<{ loading: boolean; error: string | null }>({
    loading: true,
    error: null,
  })
  // Incrémenté par reessayer() pour redéclencher l'effet ci-dessous après
  // une erreur (ex. réseau indisponible au premier lancement).
  const [tentative, setTentative] = useState(0)

  useEffect(() => {
    setEtat({ loading: true, error: null })
    let annule = false

    async function synchroniser() {
      try {
        // 1. Version distante (réseau) et version locale (Dexie) sont deux
        // lectures indépendantes : lancées en parallèle plutôt qu'attendues
        // l'une après l'autre.
        const [versionDistante, parametreLocal] = await Promise.all([
          recupererJson<IVersionFichier>('/data/version.json'),
          db.parametres.get(CLE_VERSION_FICHES),
        ])

        // Un champ "version" manquant (déploiement raté, proxy renvoyant un
        // JSON vide) ne doit jamais être comparé tel quel : au tout premier
        // lancement, la valeur locale est elle aussi absente (undefined),
        // et "undefined === undefined" concluerait à tort "déjà à jour" —
        // sautant silencieusement le tout premier téléchargement des fiches.
        if (!versionDistante.version) {
          throw new Error('Fichier de version invalide.')
        }

        if (parametreLocal?.valeur === versionDistante.version) {
          // Fiches déjà à jour : on garde quand même la date du catalogue
          // synchronisée, affichée dans Paramètres sans nouvel appel réseau.
          await db.parametres.put({ cle: CLE_DATE_CATALOGUE, valeur: versionDistante.datefiches })
          if (!annule) setEtat({ loading: false, error: null })
          return
        }

        const fiches = await recupererJson<IFiche[]>('/data/fiches-v1.json')

        // Le fichier distant est un instantané complet du catalogue (pas un
        // delta) : bulkPut seul insère/met à jour, mais ne retire jamais
        // une fiche disparue du CDN (rappel, doublon corrigé...). On
        // réconcilie donc explicitement, dans la même transaction que
        // l'écriture de la nouvelle version pour ne jamais laisser Dexie
        // dans un état à moitié synchronisé.
        await db.transaction('rw', db.fiches, db.parametres, async () => {
          await db.fiches.bulkPut(fiches)

          const idsDistants = new Set(fiches.map((fiche) => fiche.id))
          const idsLocaux = await db.fiches.toCollection().primaryKeys()
          const idsObsoletes = idsLocaux.filter((id) => !idsDistants.has(id))
          if (idsObsoletes.length > 0) {
            await db.fiches.bulkDelete(idsObsoletes)
          }

          await db.parametres.put({ cle: CLE_VERSION_FICHES, valeur: versionDistante.version })
          await db.parametres.put({ cle: CLE_DATE_CATALOGUE, valeur: versionDistante.datefiches })
        })

        if (!annule) setEtat({ loading: false, error: null })
      } catch (err) {
        if (!annule) {
          setEtat({
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : 'Erreur inconnue lors du chargement des fiches',
          })
        }
      }
    }

    synchroniser()

    return () => {
      annule = true
    }
  }, [tentative])

  return { ...etat, reessayer: () => setTentative((n) => n + 1) }
}
