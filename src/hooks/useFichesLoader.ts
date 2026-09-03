import { useEffect, useState } from 'react'
import { db } from '../db'
import { CLE_FICHES_VERSION, CLE_FICHES_DATE_CATALOGUE } from '../db/cles'
import { CATALOGUE_FICHES } from '../data/categoriesFiches'
import { construireFiche } from '../utils/construireFiche'
import { validerFicheSource } from '../utils/validerFicheSource'
import type { IFiche, IFicheSource } from '../types'

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

// Ce hook synchronise les fiches médicaments du CDN (un fichier JSON par
// fiche dans /public/data/, voir src/data/categoriesFiches.ts pour la liste)
// vers Dexie (IndexedDB), pour que l'app puisse ensuite lire les fiches
// localement, sans réseau. Il ne doit s'exécuter qu'une fois au démarrage de
// l'app (appelé dans App.tsx).
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
          db.parametres.get(CLE_FICHES_VERSION),
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
          await db.parametres.put({ cle: CLE_FICHES_DATE_CATALOGUE, valeur: versionDistante.datefiches })
          if (!annule) setEtat({ loading: false, error: null })
          return
        }

        // Un fichier JSON par fiche (pas un instantané unique comme l'ancien
        // fiches-v1.json) : chaque entrée de CATALOGUE_FICHES pointe vers
        // /data/<id>.json, dont le contenu est assemblé en IFiche par
        // construireFiche() (id + catégorie/sous-famille n'existent pas dans
        // le JSON clinique lui-même).
        const ids = Object.keys(CATALOGUE_FICHES)
        const brutes = await Promise.all(ids.map((id) => recupererJson<IFicheSource>(`/data/${id}.json`)))

        // Valide la forme de CHAQUE fichier avant de les assembler en
        // fiches : sans ça, un champ mal nommé ou du mauvais type ne casse
        // rien (construireFiche() est tolérante — un "—" apparaît juste à
        // l'affichage) ou, pire, fait planter le chargement avec un message
        // technique qui ne dit ni quel fichier ni quel champ est en cause.
        // Les erreurs de tous les fichiers sont accumulées avant d'échouer,
        // pour ne pas devoir corriger puis recharger un par un.
        const erreursValidation = brutes.flatMap((brut, index) => validerFicheSource(ids[index], brut))
        if (erreursValidation.length > 0) {
          throw new Error(erreursValidation.join('\n'))
        }

        const fiches: IFiche[] = brutes.map((brut, index) => construireFiche(ids[index], brut, CATALOGUE_FICHES[ids[index]]))

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

          await db.parametres.put({ cle: CLE_FICHES_VERSION, valeur: versionDistante.version })
          await db.parametres.put({ cle: CLE_FICHES_DATE_CATALOGUE, valeur: versionDistante.datefiches })
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
