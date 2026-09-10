import { describe, it, expect } from 'vitest'
import {
  formaterDose,
  formaterDoseAbsolue,
  formaterDoseParKg,
  formaterIntervalle,
  formaterMax,
  formaterPopulationDetail,
  libelleCategoriePosologie,
  libelleIntervalle,
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

  // Pas de suffixe "/ prise" : la carte n'affiche qu'une seule prise à la
  // fois, le préciser serait redondant (contrairement à "/ jour" pour une
  // dose journalière, qui change le sens de la valeur).
  it('formate une dose par kg sans suffixe', () => {
    expect(formaterDose(posologie({ dose_mg_kg_min: 15, dose_mg_kg_max: 15 }))).toBe('15 mg/kg')
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

  // MUI (millions d'unités internationales) : introduites pour la
  // spiramycine, même famille de champs que dose_par_prise_mg/
  // dose_journaliere_mg_kg mais dans une unité distincte.
  it('formate une dose fixe par prise en MUI', () => {
    expect(formaterDose(posologie({ dose_par_prise_MUI: 3 }))).toBe('3 MUI')
  })

  it('formate une fourchette par prise en MUI', () => {
    expect(formaterDose(posologie({ dose_par_prise_MUI_min: 1.5, dose_par_prise_MUI_max: 1.5 }))).toBe('1,5 MUI')
  })

  it('formate une dose journalière en MUI avec le suffixe "/ jour"', () => {
    expect(formaterDose(posologie({ dose_journaliere_MUI_min: 6, dose_journaliere_MUI_max: 9 }))).toBe('6-9 MUI / jour')
  })

  // mmol (millimoles) : introduites pour le chlorure de potassium, même
  // famille que dose_journaliere_mg_kg mais dans une unité distincte.
  it('formate une dose journalière en mmol/kg avec le suffixe "/ jour"', () => {
    expect(formaterDose(posologie({ dose_journaliere_mmol_kg_min: 0.8, dose_journaliere_mmol_kg_max: 2 }))).toBe(
      '0,8-2 mmol/kg / jour',
    )
  })

  // dose_par_prise_g : introduit pour la fosfomycine, dosée directement en
  // grammes dès l'adulte (4-8 g par prise) plutôt qu'en mg.
  it('formate une dose par prise directement en grammes', () => {
    expect(formaterDose(posologie({ dose_par_prise_g_min: 4, dose_par_prise_g_max: 8 }))).toBe('4-8 g')
  })

  it('bascule en mg si la fourchette en grammes n\'est pas entière', () => {
    expect(formaterDose(posologie({ dose_par_prise_g_min: 0.5, dose_par_prise_g_max: 1 }))).toBe('500-1000 mg')
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

  // Point 5 de l'audit posologie : un "—" ambigu (donnée manquante ou dose
  // réellement unique ?) est remplacé par une valeur explicite selon la
  // catégorie de la ligne.
  it('affiche "Dose unique" si aucun champ de fréquence n\'est renseigné', () => {
    expect(formaterIntervalle(posologie())).toBe('Dose unique')
  })

  it('affiche "Continue" pour une posologie en PSE sans fréquence renseignée', () => {
    expect(formaterIntervalle(posologie({ categorie: 'pse' }))).toBe('Continue')
  })
})

describe('libelleIntervalle', () => {
  it('reste "Intervalle" quand un intervalle horaire ou en minutes est renseigné', () => {
    expect(libelleIntervalle(posologie({ intervalle_min_h: 4, intervalle_max_h: 6 }))).toBe('Intervalle')
    expect(libelleIntervalle(posologie({ intervalle_min_min: 5 }))).toBe('Intervalle')
  })

  // Régression : quand seul nb_prises_*_24h est renseigné (pas d'intervalle
  // horaire dans le RCP), la valeur affichée est un nombre de prises par
  // jour, pas un intervalle de temps — le libellé doit refléter ça.
  it('devient "Prise journalière" quand seul nb_prises_*_24h est renseigné', () => {
    expect(libelleIntervalle(posologie({ nb_prises_min_24h: 2, nb_prises_max_24h: 4 }))).toBe('Prise journalière')
  })

  it('privilégie "Intervalle" si les deux sont renseignés (le champ horaire prime toujours)', () => {
    expect(libelleIntervalle(posologie({ intervalle_min_h: 4, nb_prises_max_24h: 2 }))).toBe('Intervalle')
  })

  it('reste "Intervalle" si rien n\'est renseigné (dose unique/continue)', () => {
    expect(libelleIntervalle(posologie())).toBe('Intervalle')
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

  it('affiche dose_journaliere_max_MUI directement, sans conversion (contrairement aux grammes)', () => {
    expect(formaterMax(posologie({ dose_journaliere_max_MUI: 4.5 }))).toBe('4,5 MUI/j')
    expect(formaterMax(posologie({ dose_journaliere_max_MUI: 9 }))).toBe('9 MUI/j')
  })

  it('ne réutilise jamais nb_prises_max_24h (déjà un repli de formaterIntervalle)', () => {
    expect(formaterMax(posologie({ nb_prises_max_24h: 4 }))).toBeNull()
  })

  it('renvoie null si aucun champ de maximum n\'est renseigné', () => {
    expect(formaterMax(posologie())).toBeNull()
  })

  // Point 3 de l'audit posologie : le RCP ne donne pas toujours un plafond
  // chiffré (ex. maximum dépendant du poids en pédiatrie) — une chaîne est
  // affichée telle quelle, sans tenter la conversion g→mg.
  it('affiche dose_journaliere_max_g tel quel si c\'est une chaîne, sans conversion', () => {
    expect(formaterMax(posologie({ dose_journaliere_max_g: 'Selon poids' }))).toBe('Selon poids')
  })

  it('affiche dose_journaliere_max_MUI tel quel si c\'est une chaîne', () => {
    expect(formaterMax(posologie({ dose_journaliere_max_MUI: 'Non établi' }))).toBe('Non établi')
  })

  // mmol (chlorure de potassium) : cas réel du RCP, le maximum dépend de la
  // kaliémie mesurée plutôt que d'être une valeur fixe.
  it('affiche dose_journaliere_max_mmol tel quel si c\'est une chaîne', () => {
    expect(formaterMax(posologie({ dose_journaliere_max_mmol: 'Selon kaliémie' }))).toBe('Selon kaliémie')
  })

  it('affiche un nombre de dose_journaliere_max_mmol avec le suffixe "mmol/j"', () => {
    expect(formaterMax(posologie({ dose_journaliere_max_mmol: 150 }))).toBe('150 mmol/j')
  })

  it('affiche dose_max_par_prise_g tel quel si c\'est une chaîne', () => {
    expect(formaterMax(posologie({ dose_max_par_prise_g: 'Selon poids' }))).toBe('Selon poids')
  })
})

describe('formaterDoseParKg / formaterDoseAbsolue', () => {
  // Point 2 de l'audit posologie : une ligne peut combiner une dose au
  // poids ET une dose absolue (ex. plafond) — les deux doivent pouvoir être
  // lues indépendamment plutôt que par un seul formaterDose() qui n'en
  // garde qu'une.
  // Valeur et suffixe séparés (pas une seule chaîne) : le composant met "/
  // jour" en gras pour qu'une dose journalière ne soit jamais confondue
  // avec une dose absolue par prise affichée juste à côté.
  it('formaterDoseParKg lit dose_mg_kg sans suffixe (dose par prise)', () => {
    expect(formaterDoseParKg(posologie({ dose_mg_kg_min: 0.01, dose_mg_kg_max: 0.02 }))).toEqual({
      valeur: '0,01-0,02 mg/kg',
      suffixe: null,
    })
  })

  it('formaterDoseParKg se replie sur dose_journaliere_mg_kg avec le suffixe "/ jour"', () => {
    expect(formaterDoseParKg(posologie({ dose_journaliere_mg_kg_min: 20, dose_journaliere_mg_kg_max: 90 }))).toEqual({
      valeur: '20-90 mg/kg',
      suffixe: '/ jour',
    })
  })

  it('formaterDoseParKg renvoie null sans champ mg/kg', () => {
    expect(formaterDoseParKg(posologie({ dose_par_prise_mg: 10 }))).toBeNull()
  })

  it('formaterDoseAbsolue lit dose_par_prise_mg (fixe ou fourchette)', () => {
    expect(formaterDoseAbsolue(posologie({ dose_par_prise_mg: 10 }))).toBe('10 mg')
    expect(formaterDoseAbsolue(posologie({ dose_par_prise_mg_max: 0.6 }))).toBe('0,6 mg')
  })

  it('formaterDoseAbsolue renvoie null sans champ mg absolu', () => {
    expect(formaterDoseAbsolue(posologie({ dose_mg_kg_min: 1, dose_mg_kg_max: 1 }))).toBeNull()
  })

  it('les deux sont non-null ensemble pour une ligne combinant mg/kg et plafond absolu (cas atropine)', () => {
    const p = posologie({ dose_mg_kg_min: 0.01, dose_mg_kg_max: 0.02, dose_par_prise_mg_max: 0.6 })
    expect(formaterDoseParKg(p)).toEqual({ valeur: '0,01-0,02 mg/kg', suffixe: null })
    expect(formaterDoseAbsolue(p)).toBe('0,6 mg')
  })

  // dose_par_prise_g : cas fosfomycine, dosée directement en grammes.
  it('formaterDoseAbsolue lit dose_par_prise_g quand aucun champ mg n\'est renseigné', () => {
    expect(formaterDoseAbsolue(posologie({ dose_par_prise_g_min: 4, dose_par_prise_g_max: 8 }))).toBe('4-8 g')
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

  it('reconnaît aussi une fourchette exprimée en MUI (pas seulement en mg)', () => {
    const enFourchette = posologie({ population: 'X', categorie: 'generale', dose_par_prise_MUI_min: 1.5, dose_par_prise_MUI_max: 3 })
    const doseFixe = posologie({ population: 'X', categorie: 'generale', dose_par_prise_MUI: 3 })
    expect(dedupliquerPosologies([doseFixe, enFourchette])).toEqual([enFourchette])
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
