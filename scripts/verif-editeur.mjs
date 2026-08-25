#!/usr/bin/env node
// Garde-fou de build — s'assure que les mentions légales de
// src/data/editeur.ts sont complètes avant une mise en production.
//
// Désactivé par défaut : le développement quotidien ne doit jamais être
// bloqué par des champs légaux encore provisoires (SIRET en cours de
// création, adresse pas encore arbitrée...). Ce script ne fait donc échouer
// le build que si la variable d'environnement VERIF_LEGAL vaut "1" —
// positionnée uniquement par le script "build:prod" de package.json.
// npm run build (développement / CI courante) l'ignore silencieusement.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const CHEMIN_EDITEUR = fileURLToPath(new URL('../src/data/editeur.ts', import.meta.url))
const MARQUEUR_INCOMPLET = '[À COMPLÉTER'

if (process.env.VERIF_LEGAL !== '1') {
  console.log(
    'Vérification des mentions légales ignorée (VERIF_LEGAL non défini) — réservée à npm run build:prod.',
  )
  process.exit(0)
}

const contenu = readFileSync(CHEMIN_EDITEUR, 'utf8')

if (contenu.includes(MARQUEUR_INCOMPLET)) {
  console.error(
    `Mentions légales incomplètes : "${MARQUEUR_INCOMPLET}" est encore présent dans src/data/editeur.ts.\n` +
      'Complétez ces champs avant un build de production.',
  )
  process.exit(1)
}

console.log('Mentions légales OK — aucun champ "À COMPLÉTER" restant dans src/data/editeur.ts.')
