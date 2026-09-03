/// <reference types="node" />
// Référence Node ciblée à ce seul fichier : tsconfig.app.json restreint
// volontairement `types` à "vite/client" pour le reste de src/ (code d'app
// strictement navigateur) — ce test lit les fichiers publiés sur disque pour
// vérifier qu'ils respectent le schéma, ce qui n'a de sens qu'en contexte
// Node (voir les scripts/verif-*.mjs pour le même genre de vérification
// côté build, en JS pur cette fois).
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { validerFicheSource } from './validerFicheSource'
import { CATALOGUE_FICHES } from '../data/categoriesFiches'

// Fiche minimale mais structurellement complète (schéma v2 : les blocs de
// précautions vivent dans `commun`) — clonée en JSON pour chaque cas de
// test, jamais mutée en place (objets/tableaux imbriqués partagés sinon).
function ficheValide(): unknown {
  return JSON.parse(
    JSON.stringify({
      dci: 'paracétamol',
      commun: {
        noms_commerciaux: ['Dafalgan'],
        famille: 'Antalgique non opioïde',
        antidote: '',
        indications: ['Douleur'],
        grossesse_allaitement: null,
        contre_indications: [],
        interactions_pertinentes: [{ substance: 'X', effet: 'Y', action_infirmier: 'Z' }],
        surveillance_specifique: [{ evenement: 'X', explication: 'Y', action: 'Z' }],
        pictogrammes: [],
      },
      iv: {
        reconstitution: null,
        administration: { posologie: [{ population: 'Adulte' }] },
        incompatibilites: [{ substance: 'Aciclovir', niveau: 'absolu' }],
      },
      oral: {
        formes: [{ type: 'Comprimé', posologie_adulte: [] }],
      },
      tracabilite: {
        rcp_source: [{ specialite: 'Doliprane 1000 mg' }],
        statut: 'valide',
        validation: { date: '2026-08-31', perimetre: ['adulte'] },
      },
    }),
  )
}

describe('validerFicheSource', () => {
  it('ne remonte aucune erreur pour une fiche valide', () => {
    expect(validerFicheSource('paracetamol', ficheValide())).toEqual([])
  })

  it('signale un fichier qui ne contient pas un objet JSON', () => {
    expect(validerFicheSource('x', 'pas un objet')).toEqual(['x.json — (racine) : le fichier doit contenir un objet JSON (reçu string)'])
  })

  it('signale un champ racine manquant', () => {
    const brut = ficheValide() as Record<string, unknown>
    delete brut.dci
    expect(validerFicheSource('x', brut)).toContain('x.json — dci : champ manquant')
  })

  it('signale un champ de commun du mauvais type', () => {
    const brut = ficheValide() as { commun: Record<string, unknown> }
    brut.commun.famille = 42
    expect(validerFicheSource('x', brut)).toContain('x.json — commun.famille : doit être une chaîne (reçu number)')
  })

  it("signale l'absence des deux voies iv/oral", () => {
    const brut = ficheValide() as Record<string, unknown>
    delete brut.iv
    delete brut.oral
    expect(validerFicheSource('x', brut)).toContain(
      'x.json — (racine) : ni "iv" ni "oral" ne sont renseignés — une fiche doit documenter au moins une voie',
    )
  })

  it('accepte une fiche avec seulement iv, ou seulement oral', () => {
    const avecIvSeul = ficheValide() as Record<string, unknown>
    delete avecIvSeul.oral
    expect(validerFicheSource('x', avecIvSeul)).toEqual([])

    const avecOralSeul = ficheValide() as Record<string, unknown>
    delete avecOralSeul.iv
    expect(validerFicheSource('x', avecOralSeul)).toEqual([])
  })

  it('signale iv.administration.posologie quand ce n\'est pas un tableau', () => {
    const brut = ficheValide() as { iv: { administration: Record<string, unknown> } }
    brut.iv.administration.posologie = {}
    expect(validerFicheSource('x', brut)).toContain('x.json — iv.administration.posologie : doit être un tableau (reçu objet)')
  })

  it('signale une forme orale sans son champ type, avec l\'index dans le chemin', () => {
    const brut = ficheValide() as { oral: { formes: Record<string, unknown>[] } }
    brut.oral.formes.push({ posologie_adulte: [] })
    expect(validerFicheSource('x', brut)).toContain('x.json — oral.formes.1.type : champ manquant')
  })

  it('signale une interaction sans action_infirmier', () => {
    const brut = ficheValide() as { commun: { interactions_pertinentes: Record<string, unknown>[] } }
    brut.commun.interactions_pertinentes.push({ substance: 'Y', effet: 'Z' })
    expect(validerFicheSource('x', brut)).toContain(
      'x.json — commun.interactions_pertinentes.1.action_infirmier : doit être une chaîne (reçu undefined)',
    )
  })

  it('signale une absence de tracabilite', () => {
    const brut = ficheValide() as Record<string, unknown>
    delete brut.tracabilite
    expect(validerFicheSource('x', brut)).toContain('x.json — tracabilite : champ manquant')
  })

  it('accumule plusieurs erreurs indépendantes plutôt que de s\'arrêter à la première', () => {
    const brut = ficheValide() as Record<string, unknown>
    delete brut.dci
    delete brut.tracabilite
    const erreurs = validerFicheSource('x', brut)
    expect(erreurs).toContain('x.json — dci : champ manquant')
    expect(erreurs).toContain('x.json — tracabilite : champ manquant')
  })
})

// Vérifie que les fiches réellement publiées respectent le schéma attendu —
// sert de garde-fou si l'une d'elles est éditée à la main sans passer par
// une relecture complète de l'app.
describe('validerFicheSource — fiches publiées', () => {
  for (const id of Object.keys(CATALOGUE_FICHES)) {
    it(`public/data/${id}.json est structurellement valide`, () => {
      const brut = JSON.parse(readFileSync(new URL(`../../public/data/${id}.json`, import.meta.url), 'utf-8'))
      expect(validerFicheSource(id, brut)).toEqual([])
    })
  }
})
