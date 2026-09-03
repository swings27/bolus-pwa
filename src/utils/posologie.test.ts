import { describe, it, expect } from 'vitest'
import {
  formaterDose,
  formaterIntervalle,
  formaterMax,
  formaterPopulationDetail,
  libelleCategoriePosologie,
  dedupliquerPosologies,
} from './posologie'
import type { IPosologieRcp } from '../types'

// Fabrique une ligne de posologie minimale, à compléter par cas de test —
// évite de répéter "population: '...'" (seul champ requis par le type) dans
// chaque exemple ci-dessous.
function posologie(champs: Partial<IPosologieRcp> = {}): IPosologieRcp {
  return { population: 'Cas test', ...champs }
}

describe('formaterDose', () => {
  it('formate une dose fixe par prise', () => {
    expect(formaterDose(posologie({ dose_par_prise_mg: 1000 }))).toBe('1000 mg')
  })

  it('formate une fourchette par prise, avec virgule française', () => {
    expect(formaterDose(posologie({ dose_par_prise_mg_min: 0.5, dose_par_prise_mg_max: 1 }))).toBe('0,5-1 mg')
  })

  it('replie min=max en valeur unique plutôt qu\'une fourchette dégénérée', () => {
    expect(formaterDose(posologie({ dose_par_prise_mg_min: 400, dose_par_prise_mg_max: 400 }))).toBe('400 mg')
  })

  it('formate une dose par kg avec le suffixe "/ prise"', () => {
    expect(formaterDose(posologie({ dose_mg_kg_min: 15, dose_mg_kg_max: 15 }))).toBe('15 mg/kg / prise')
  })

  it('formate une dose journalière par kg avec le suffixe "/ jour"', () => {
    expect(formaterDose(posologie({ dose_journaliere_mg_kg_min: 20, dose_journaliere_mg_kg_max: 90 }))).toBe(
      '20-90 mg/kg / jour',
    )
  })

  it('formate un débit en µg/kg/min', () => {
    expect(formaterDose(posologie({ dose_ugkgmin_min: 0.01, dose_ugkgmin_max: 1 }))).toBe('0,01-1 µg/kg/min')
  })

  it('respecte la priorité dose_par_prise_mg sur les autres champs si plusieurs sont renseignés', () => {
    expect(formaterDose(posologie({ dose_par_prise_mg: 10, dose_mg_kg_min: 1, dose_mg_kg_max: 1 }))).toBe('10 mg')
  })

  it('renvoie un tiret cadratin si aucun champ de dose n\'est renseigné', () => {
    expect(formaterDose(posologie())).toBe('—')
  })
})

describe('formaterIntervalle', () => {
  it('formate une fourchette en heures', () => {
    expect(formaterIntervalle(posologie({ intervalle_min_h: 4, intervalle_max_h: 6 }))).toBe('4-6 h')
  })

  it('formate une fourchette en minutes si aucun intervalle en heures', () => {
    expect(formaterIntervalle(posologie({ intervalle_min_min: 3, intervalle_max_min: 5 }))).toBe('3-5 min')
  })

  it('se replie sur le nombre de prises par jour en dernier recours', () => {
    expect(formaterIntervalle(posologie({ nb_prises_min_24h: 2, nb_prises_max_24h: 4 }))).toBe('2-4 / jour')
  })

  it('renvoie un tiret cadratin si rien n\'est renseigné', () => {
    expect(formaterIntervalle(posologie())).toBe('—')
  })
})

describe('formaterMax', () => {
  it('affiche un nombre entier de grammes en g/j', () => {
    expect(formaterMax(posologie({ dose_journaliere_max_g: 4 }))).toBe('4 g/j')
    expect(formaterMax(posologie({ dose_journaliere_max_g: 12 }))).toBe('12 g/j')
  })

  it('convertit en mg dès que le nombre de grammes est décimal, même au-dessus de 1 g', () => {
    // Régression : personne ne dit "1,2 g/j" en pratique clinique — voir
    // l'échange qui a introduit cette règle (ibuprofène, 1200 mg/j).
    expect(formaterMax(posologie({ dose_journaliere_max_g: 1.2 }))).toBe('1200 mg/j')
  })

  it('convertit en mg pour un nombre de grammes décimal sous 1 g', () => {
    // Régression : diazépam affichait "0,04 g/j" avant cette règle.
    expect(formaterMax(posologie({ dose_journaliere_max_g: 0.04 }))).toBe('40 mg/j')
    expect(formaterMax(posologie({ dose_journaliere_max_g: 0.015 }))).toBe('15 mg/j')
  })

  it('applique la même règle à dose_max_par_prise_g, avec le suffixe "/prise"', () => {
    expect(formaterMax(posologie({ dose_max_par_prise_g: 2 }))).toBe('2 g/prise')
  })

  it('ne réutilise jamais nb_prises_max_24h (déjà un repli de formaterIntervalle)', () => {
    expect(formaterMax(posologie({ nb_prises_max_24h: 4 }))).toBeNull()
  })

  it('renvoie null si aucun champ de maximum n\'est renseigné', () => {
    expect(formaterMax(posologie())).toBeNull()
  })
})

describe('formaterPopulationDetail', () => {
  it('renvoie null si ni âge ni poids ne sont renseignés', () => {
    expect(formaterPopulationDetail(posologie())).toBeNull()
  })

  it('formate une fourchette de poids en kg', () => {
    expect(formaterPopulationDetail(posologie({ poids_min_kg: 18, poids_max_kg: 33 }))).toBe('18-33 kg')
  })

  it('convertit une fourchette d\'âge en mois vers des années', () => {
    expect(formaterPopulationDetail(posologie({ age_min_mois: 72, age_max_mois: 144 }))).toBe('6-12 ans')
  })

  it('combine âge et poids quand les deux sont renseignés', () => {
    expect(
      formaterPopulationDetail(posologie({ age_min_mois: 72, age_max_mois: 144, poids_min_kg: 18, poids_max_kg: 33 })),
    ).toBe('6-12 ans · 18-33 kg')
  })

  it('affiche une borne unique avec ≥ ou ≤ selon le sens', () => {
    expect(formaterPopulationDetail(posologie({ age_min_mois: 144 }))).toBe('≥ 12 ans')
    expect(formaterPopulationDetail(posologie({ poids_max_kg: 12 }))).toBe('≤ 12 kg')
  })
})

describe('libelleCategoriePosologie', () => {
  it('donne un libellé différent pour "generale" selon le contexte iv/oral', () => {
    expect(libelleCategoriePosologie('generale', 'iv')).toBe('Voie IV')
    expect(libelleCategoriePosologie('generale', 'oral')).toBe('Posologie standard')
  })

  it('traite categorie absente comme "generale"', () => {
    expect(libelleCategoriePosologie(undefined, 'iv')).toBe('Voie IV')
  })

  it('renvoie la valeur brute pour une categorie inconnue de la table', () => {
    expect(libelleCategoriePosologie('mystere', 'iv')).toBe('mystere')
  })
})

describe('dedupliquerPosologies', () => {
  it('ne garde qu\'une ligne quand plusieurs partagent la même categorie + population', () => {
    const resultat = dedupliquerPosologies([
      posologie({ population: 'Douleur ou fièvre', categorie: 'generale', dose_par_prise_mg: 400 }),
      posologie({ population: 'Douleur ou fièvre', categorie: 'generale', dose_par_prise_mg: 400 }),
    ])
    expect(resultat).toHaveLength(1)
  })

  it('préfère la ligne en fourchette à la ligne à dose fixe pour le même doublon', () => {
    const enFourchette = posologie({
      population: 'Douleur ou fièvre',
      categorie: 'generale',
      dose_par_prise_mg_min: 200,
      dose_par_prise_mg_max: 400,
    })
    const doseFixe = posologie({ population: 'Douleur ou fièvre', categorie: 'generale', dose_par_prise_mg: 400 })

    // Peu importe l'ordre d'apparition, le résultat garde toujours la fourchette.
    expect(dedupliquerPosologies([doseFixe, enFourchette])).toEqual([enFourchette])
    expect(dedupliquerPosologies([enFourchette, doseFixe])).toEqual([enFourchette])
  })

  it('ne fusionne pas deux populations identiques de categorie différente', () => {
    const enIv = posologie({ population: 'Douleur ou fièvre', categorie: 'generale' })
    const enSpeciale = posologie({ population: 'Douleur ou fièvre', categorie: 'speciale' })
    expect(dedupliquerPosologies([enIv, enSpeciale])).toHaveLength(2)
  })

  it('conserve les lignes à population distincte', () => {
    const a = posologie({ population: 'Arrêt cardiaque' })
    const b = posologie({ population: 'Choc anaphylactique' })
    expect(dedupliquerPosologies([a, b])).toEqual([a, b])
  })

  it('préserve l\'ordre d\'apparition des groupes restants', () => {
    const premier = posologie({ population: 'Premier' })
    const second = posologie({ population: 'Second' })
    const doublonPremier = posologie({ population: 'Premier' })
    const resultat = dedupliquerPosologies([premier, second, doublonPremier])
    expect(resultat.map((p) => p.population)).toEqual(['Premier', 'Second'])
  })
})
