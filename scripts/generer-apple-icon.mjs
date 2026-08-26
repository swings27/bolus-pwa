#!/usr/bin/env node
// iOS ignore totalement le manifest PWA pour l'icône d'écran d'accueil : il
// ne regarde que la balise <link rel="apple-touch-icon"> (voir index.html)
// et attend une image carrée de 180x180 exactement. Sans ce fichier dédié,
// iOS génère une capture d'écran de la page comme icône — illisible.
//
// On régénère ce fichier depuis bolus-icone-512.png (déjà en place, ne pas
// y toucher) plutôt que de maintenir un second artwork à la main : une
// seule source, un redimensionnement reproductible via `npm run icones`.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const SOURCE = fileURLToPath(new URL('../public/bolus-icone-512.png', import.meta.url))
const DESTINATION = fileURLToPath(new URL('../public/apple-touch-icon.png', import.meta.url))
const TAILLE = 180

readFileSync(SOURCE) // échoue tôt et clairement si la source a été déplacée

await sharp(SOURCE).resize(TAILLE, TAILLE).png().toFile(DESTINATION)

console.log(`apple-touch-icon.png généré (${TAILLE}x${TAILLE}) → public/apple-touch-icon.png`)
