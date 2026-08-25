#!/usr/bin/env node
// Garde-fou automatisé — protège le positionnement hors MDR 2017/745 de
// Bolus. Les calculateurs (src/components/calculateurs/, qui inclut la
// modale qui les affiche) doivent rester de l'arithmétique pure : aucun
// lien avec la base de données médicaments, ni par import (src/db,
// src/hooks/useFiche, src/hooks/useSearch, src/data/categories) ni par
// référence à une fiche ou à une molécule dans le code. C'est cette
// séparation stricte entre "calculatrice" et "base médicaments" qui
// maintient l'application hors du champ du règlement européen sur les
// dispositifs médicaux : dès qu'un calculateur connaîtrait une molécule ou
// un seuil clinique, il basculerait dans une autre catégorie réglementaire.
// Ce script fait échouer le build (voir "build" dans package.json) si cette
// règle est enfreinte, par erreur ou par un futur ajout mal placé.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = fileURLToPath(new URL('..', import.meta.url))

const CIBLES = [join(racine, 'src/components/calculateurs')]

const EXTENSIONS = new Set(['.ts', '.tsx'])

// Fragments interdits dans un spécificateur d'import (chemin après "from").
const IMPORTS_INTERDITS = ['/db', 'usefiche', 'usesearch', 'categories']

// Chaînes interdites n'importe où dans le fichier, insensible à la casse.
const CHAINES_INTERDITES = ['ifiche', 'medicament', 'molecule', 'dci']

function listerFichiers(chemin) {
  const infos = statSync(chemin)
  if (infos.isFile()) return EXTENSIONS.has(extname(chemin)) ? [chemin] : []
  return readdirSync(chemin).flatMap((entree) => listerFichiers(join(chemin, entree)))
}

function extraireSpecificateursImport(contenu) {
  const specificateurs = []
  const regexes = [
    /import\s+[^'";]*?from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /require\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]
  for (const regex of regexes) {
    let correspondance
    while ((correspondance = regex.exec(contenu))) {
      specificateurs.push(correspondance[1])
    }
  }
  return specificateurs
}

const fichiers = CIBLES.flatMap(listerFichiers)
const erreurs = []

for (const fichier of fichiers) {
  const contenu = readFileSync(fichier, 'utf8')

  for (const specificateur of extraireSpecificateursImport(contenu)) {
    const bas = specificateur.toLowerCase()
    for (const motif of IMPORTS_INTERDITS) {
      if (bas.includes(motif)) {
        erreurs.push(`${fichier} : import interdit "${specificateur}" (contient "${motif}")`)
      }
    }
  }

  const contenuMinuscule = contenu.toLowerCase()
  for (const motif of CHAINES_INTERDITES) {
    if (contenuMinuscule.includes(motif)) {
      erreurs.push(`${fichier} : chaîne interdite "${motif}" présente dans le fichier`)
    }
  }
}

if (erreurs.length > 0) {
  console.error('Isolation des calculateurs rompue — build bloqué :\n')
  for (const erreur of erreurs) console.error(`  - ${erreur}`)
  console.error(
    "\nLes calculateurs doivent rester de l'arithmétique pure, sans aucun lien avec la base de médicaments " +
      '(voir l\'en-tête de scripts/verif-isolation-calculateurs.mjs).',
  )
  process.exit(1)
}

console.log(`Isolation des calculateurs OK (${fichiers.length} fichier(s) vérifié(s)).`)
