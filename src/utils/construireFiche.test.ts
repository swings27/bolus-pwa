import { describe, it, expect } from 'vitest'
import { construireFiche } from './construireFiche'
import type { IFicheSource } from '../types'

const META = { categorie: 'antalgiques', sousFamille: 'Antalgiques palier 1' }

// Fabrique une IFicheSource minimale mais complète (tous les champs requis
// du schéma), à surcharger par cas de test — évite de reconstruire toute
// l'arborescence commun/tracabilite dans chaque exemple ci-dessous.
// Les blocs de précautions vivent dans `commun` (schéma v2) : ils restent
// renseignés (même vides) indépendamment de la présence d'un bloc `iv`.
function ficheSource(champs: Partial<IFicheSource> = {}): IFicheSource {
  return {
    dci: 'paracétamol',
    commun: {
      noms_commerciaux: ['Dafalgan'],
      famille: 'Antalgique non opioïde',
      antidote: '',
      indications: ['Douleur'],
      grossesse_allaitement: null,
      contre_indications: [],
      interactions_pertinentes: [],
      surveillance_specifique: [],
      pictogrammes: [],
    },
    tracabilite: {
      rcp_source: [{ specialite: 'Doliprane 1000 mg' }],
      statut: 'valide',
      validation: { date: '2026-08-31', perimetre: ['adulte'] },
    },
    ...champs,
  }
}

describe('construireFiche', () => {
  it('capitalise le DCI, publié en minuscules dans le JSON source', () => {
    const fiche = construireFiche('paracetamol', ficheSource({ dci: 'paracétamol' }), META)
    expect(fiche.dci).toBe('Paracétamol')
  })

  it('convertit un antidote vide en null plutôt que de garder une chaîne vide', () => {
    // Le fixture par défaut a déjà antidote: '' (cas amoxicilline) — pas
    // besoin de le surcharger.
    const fiche = construireFiche('x', ficheSource(), META)
    expect(fiche.antidote).toBeNull()
  })

  it('conserve un antidote renseigné tel quel', () => {
    const base = ficheSource()
    const fiche = construireFiche('x', { ...base, commun: { ...base.commun, antidote: 'N-acétylcystéine' } }, META)
    expect(fiche.antidote).toBe('N-acétylcystéine')
  })

  it('reprend categorie/sousFamille depuis la métadonnée, absente du JSON source', () => {
    const fiche = construireFiche('x', ficheSource(), META)
    expect(fiche.categorie).toBe('antalgiques')
    expect(fiche.sousFamille).toBe('Antalgiques palier 1')
  })

  it('renvoie iv/oral à null quand les deux blocs sont absents', () => {
    const fiche = construireFiche('x', ficheSource(), META)
    expect(fiche.iv).toBeNull()
    expect(fiche.oral).toBeNull()
  })

  // Régression : dans le schéma v1, ces trois champs vivaient sous `iv` et
  // disparaissaient silencieusement pour une molécule sans forme injectable
  // — exactement le défaut de sécurité que la migration vers `commun` (v2)
  // corrige. Ce test échouerait si l'un des trois redevenait conditionné à
  // la présence du bloc `iv`.
  it('garde contre-indications/surveillance/interactions renseignées même sans bloc iv (molécule orale seule)', () => {
    const base = ficheSource()
    const fiche = construireFiche(
      'x',
      {
        ...base,
        commun: {
          ...base.commun,
          contre_indications: ['Hypersensibilité'],
          surveillance_specifique: [
            { evenement: 'Hépatotoxicité', explication: 'Risque en cas de surdosage.', action: 'Doser le paracétamol plasmatique.' },
          ],
          interactions_pertinentes: [
            { substance: 'Probénécide', effet: 'Diminue la clairance.', action_infirmier: 'Envisager une diminution de dose.' },
          ],
        },
      },
      META,
    )
    expect(fiche.iv).toBeNull()
    expect(fiche.contreIndications).toEqual(['Hypersensibilité'])
    expect(fiche.surveillanceSpecifique).toEqual([
      { titre: 'Hépatotoxicité', detail: 'Risque en cas de surdosage.', conduite: 'Doser le paracétamol plasmatique.' },
    ])
    expect(fiche.interactionsMedicamenteuses).toEqual([
      { titre: 'Probénécide', detail: 'Diminue la clairance.', conduite: 'Envisager une diminution de dose.' },
    ])
  })

  it('sépare detail et conduite plutôt que de les concaténer, pour la surveillance spécifique', () => {
    const base = ficheSource()
    const fiche = construireFiche(
      'x',
      {
        ...base,
        commun: {
          ...base.commun,
          surveillance_specifique: [
            {
              evenement: 'Hépatotoxicité',
              explication: 'Risque en cas de surdosage.',
              action: 'Doser le paracétamol plasmatique.',
              source_rcp: 'RCP 4.9',
            },
          ],
        },
      },
      META,
    )
    expect(fiche.surveillanceSpecifique).toEqual([
      { titre: 'Hépatotoxicité', detail: 'Risque en cas de surdosage.', conduite: 'Doser le paracétamol plasmatique.' },
    ])
  })

  it('mappe action_infirmier (pas action) sur conduite pour les interactions médicamenteuses', () => {
    const base = ficheSource()
    const fiche = construireFiche(
      'x',
      {
        ...base,
        commun: {
          ...base.commun,
          interactions_pertinentes: [
            {
              substance: 'Probénécide',
              effet: 'Diminue la clairance du paracétamol.',
              action_infirmier: 'Envisager une diminution de dose.',
              source_rcp: 'RCP 4.5',
            },
          ],
        },
      },
      META,
    )
    expect(fiche.interactionsMedicamenteuses).toEqual([
      { titre: 'Probénécide', detail: 'Diminue la clairance du paracétamol.', conduite: 'Envisager une diminution de dose.' },
    ])
  })

  it('normalise administration.note_ajustement vide en null', () => {
    const fiche = construireFiche(
      'x',
      ficheSource({
        iv: {
          reconstitution: null,
          administration: { note_ajustement: '', posologie: [] },
          incompatibilites: [],
        },
      }),
      META,
    )
    expect(fiche.iv?.administration.note_ajustement).toBeNull()
  })

  it('normalise prochaine_revision absente en null', () => {
    const fiche = construireFiche('x', ficheSource(), META)
    expect(fiche.prochaineRevision).toBeNull()
  })
})
