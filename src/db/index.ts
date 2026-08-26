/*
 * RÈGLE DE MIGRATION — à respecter sans exception
 *
 * Ne JAMAIS modifier un bloc this.version(n).stores({...})
 * déjà publié. Pour tout changement de schéma :
 *   1. ajouter un NOUVEAU bloc this.version(n+1)
 *   2. y déclarer le schéma complet mis à jour
 *   3. ajouter .upgrade(tx => {...}) si les données
 *      existantes doivent être transformées
 *
 * Dexie applique automatiquement les versions
 * manquantes dans l'ordre au prochain lancement.
 *
 * Exemple pour un futur ajout de données pédiatriques :
 *   this.version(2).stores({
 *     fiches: "id, dci, *nomsCommerciaux, categorie, sousFamille",
 *     parametres: "cle",
 *   }).upgrade(async tx => {
 *     await tx.table("fiches").toCollection()
 *       .modify(f => { f.pediatrie = null })
 *   })
 */

import Dexie, { type EntityTable } from 'dexie'
import type { IFiche } from '../types'

/**
 * Une ligne de la table "parametres" : stockage clé/valeur pour les
 * préférences locales de l'app (disclaimer accepté, version des fiches
 * en cache, etc.).
 */
export interface IParametre {
  cle: string
  valeur: string
}

// IndexedDB natif (l'API du navigateur) est bas niveau : callbacks/events,
// gestion manuelle des versions de schéma, transactions verbeuses. Dexie.js
// est une surcouche qui expose une API façon "collection" avec async/await,
// des index typés, et des migrations de schéma déclaratives. On perd zéro
// fonctionnalité d'IndexedDB, on gagne juste en confort et lisibilité.
class InfirmDB extends Dexie {
  // Ces propriétés sont déclarées ici pour le typage ; Dexie les
  // initialise réellement via .version().stores() ci-dessous.
  fiches!: EntityTable<IFiche, 'id'>
  parametres!: EntityTable<IParametre, 'cle'>

  constructor() {
    super('InfirmDB')

    // .version(1).stores() décrit le schéma : pour chaque table, la liste
    // des champs indexés (le premier est la clé primaire). On n'a PAS besoin
    // de lister tous les champs d'un objet ici : IndexedDB stocke des objets
    // complets, seuls les champs indexés (utilisés pour rechercher/filtrer)
    // doivent être déclarés. Le "*" devant nomsCommerciaux indique un index
    // multi-entrées : chaque élément du tableau devient une entrée
    // indexable individuellement, ce qui permet de rechercher une fiche par
    // n'importe lequel de ses noms commerciaux.
    this.version(1).stores({
      fiches: 'id, dci, *nomsCommerciaux, categorie, sousFamille',
      parametres: 'cle',
    })
  }
}

// Instance singleton : on exporte un objet déjà construit plutôt que la
// classe elle-même. Dexie ouvre une seule connexion à la base IndexedDB au
// premier accès et la réutilise ; instancier InfirmDB à plusieurs endroits
// de l'app créerait des connexions concurrentes inutiles et risquerait des
// incohérences. Tout le code de l'app importe ce même `db`.
export const db = new InfirmDB()
