import { useEffect, useState } from 'react'
import { db } from '../db'
import type { IFiche } from '../types'

const CLE_VERSION_FICHES = 'fiches_version'

interface IVersionFichier {
  version: string
  datefiches: string
}

interface IEtatChargement {
  loading: boolean
  error: string | null
  reessayer: () => void
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
        // 1. On récupère la version courante publiée sur le CDN. C'est un
        // petit fichier léger : on peut le fetcher à chaque démarrage sans
        // coût réseau significatif, contrairement au fichier de fiches.
        const reponseVersion = await fetch('/data/version.json')
        const versionDistante: IVersionFichier = await reponseVersion.json()

        // 2. On compare à la version déjà stockée localement dans Dexie.
        const parametreLocal = await db.parametres.get(CLE_VERSION_FICHES)

        // 3. Versions identiques → les fiches en base sont déjà à jour,
        // aucun re-téléchargement ni ré-écriture nécessaire.
        if (parametreLocal?.valeur === versionDistante.version) {
          if (!annule) setEtat({ loading: false, error: null })
          return
        }

        // 4a. Version absente ou différente → on télécharge le fichier de
        // fiches complet et on le stocke dans Dexie.
        const reponseFiches = await fetch('/data/fiches-v1.json')
        const fiches: IFiche[] = await reponseFiches.json()

        // 4b. bulkPut plutôt que bulkAdd : bulkAdd échoue si une clé
        // primaire (id) existe déjà, alors que bulkPut fait un "upsert"
        // (insert si absent, update si présent). Comme l'id de la fiche
        // est stable d'une version à l'autre, bulkPut rend l'opération
        // idempotente : rappeler ce hook plusieurs fois (ex. remount en
        // dev, ou re-sync manuelle) ne crée jamais de doublons, ça se
        // contente de réécrire les mêmes lignes.
        await db.fiches.bulkPut(fiches)

        // 4c. On mémorise la nouvelle version pour éviter de re-télécharger
        // au prochain démarrage tant qu'elle n'a pas changé côté CDN.
        await db.parametres.put({
          cle: CLE_VERSION_FICHES,
          valeur: versionDistante.version,
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
