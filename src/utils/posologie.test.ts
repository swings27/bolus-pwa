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
  // Une dose fixe s'écrit avec les deux bornes à la même valeur : il n'existe
  // pas de forme scalaire dans les fiches.
  it('formate une dose fixe par prise', () => {
    expect(formaterDose(posologie({ dose_par_prise_mg_min: 1000, dose_par_prise_mg_max: 1000 }))).toBe('1000 mg')
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
    expect(formaterDose(posologie({ dose_ug_kg_minute_min: 0.01, dose_ug_kg_minute_max: 1 }))).toBe('0,01-1 µg/kg/min')
  })

  // Microgrammes (sufentanil) : trois familles distinctes, dont deux que la
  // seule lecture du nom peut faire confondre — dose_ug_kg_* est une dose
  // ponctuelle, dose_ug_kg_minute_* un débit. Ces tests fixent la
  // différence.
  it('formate une dose par prise en µg', () => {
    expect(formaterDose(posologie({ dose_par_prise_ug_min: 15, dose_par_prise_ug_max: 20 }))).toBe('15-20 µg')
  })

  it('formate une dose au poids en µg/kg, sans la confondre avec un débit', () => {
    expect(formaterDose(posologie({ dose_ug_kg_min: 0.1, dose_ug_kg_max: 2 }))).toBe('0,1-2 µg/kg')
    expect(formaterDose(posologie({ dose_ug_kg_minute_min: 0.1, dose_ug_kg_minute_max: 2 }))).toBe('0,1-2 µg/kg/min')
  })

  it('formate un débit en µg/kg/h', () => {
    expect(formaterDose(posologie({ dose_ug_kg_h_min: 0.2, dose_ug_kg_h_max: 2 }))).toBe('0,2-2 µg/kg/h')
  })

  // Une dose au poids ET un plafond absolu sur la même ligne se lisent côte
  // à côte, comme pour les mg (voir formaterDoseParKg).
  it('affiche ensemble la dose au poids en µg/kg et la dose absolue en µg', () => {
    const p = posologie({ dose_ug_kg_min: 0.2, dose_ug_kg_max: 0.5, dose_par_prise_ug_min: 30, dose_par_prise_ug_max: 30 })
    expect(formaterDoseParKg(p)).toEqual({ valeur: '0,2-0,5 µg/kg', suffixe: null })
    expect(formaterDoseAbsolue(p)).toBe('30 µg')
  })

  it('respecte la priorité de la dose en mg sur les autres champs si plusieurs sont renseignés', () => {
    expect(
      formaterDose(posologie({ dose_par_prise_mg_min: 10, dose_par_prise_mg_max: 10, dose_mg_kg_min: 1, dose_mg_kg_max: 1 })),
    ).toBe('10 mg')
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

  // UI : introduites pour les anticoagulants (énoxaparine, héparine). Sans
  // rapport d'échelle avec les MUI de la spiramycine — d'où deux familles de
  // champs distinctes plutôt qu'une conversion.
  it('formate une dose par prise en UI', () => {
    expect(formaterDose(posologie({ dose_par_prise_UI_min: 2000, dose_par_prise_UI_max: 4000 }))).toBe('2000-4000 UI')
  })

  it('formate une dose par prise en UI/kg', () => {
    expect(formaterDose(posologie({ dose_par_prise_UI_kg_min: 100, dose_par_prise_UI_kg_max: 100 }))).toBe('100 UI/kg')
  })

  it('ne confond pas UI et MUI (ordres de grandeur incomparables)', () => {
    expect(formaterDose(posologie({ dose_par_prise_MUI: 3 }))).toBe('3 MUI')
    expect(formaterDose(posologie({ dose_par_prise_UI_min: 3, dose_par_prise_UI_max: 3 }))).toBe('3 UI')
  })

  // Débits de perfusion continue : chaque molécule garde l'unité de son RCP,
  // c'est sous cette forme que le débit est réglé au pousse-seringue.
  it('formate un débit en mg/kg/h', () => {
    expect(formaterDose(posologie({ dose_mg_kg_h_min: 0.125, dose_mg_kg_h_max: 0.25 }))).toBe('0,125-0,25 mg/kg/h')
  })

  it('formate un débit en UI/kg/h', () => {
    expect(formaterDose(posologie({ dose_UI_kg_h_min: 20, dose_UI_kg_h_max: 20 }))).toBe('20 UI/kg/h')
  })

  it('formate un débit en mg/h, non rapporté au poids', () => {
    expect(formaterDose(posologie({ dose_mg_h_min: 3, dose_mg_h_max: 5 }))).toBe('3-5 mg/h')
  })

  it('replie un débit mg/h min=max en valeur unique', () => {
    expect(formaterDose(posologie({ dose_mg_h_min: 1, dose_mg_h_max: 1 }))).toBe('1 mg/h')
  })

  // Une borne seule est une borne, pas une dose ferme : sans le préfixe, le
  // plafond "jusqu'à 1 g" de la voie IM (amoxicilline, céfotaxime)
  // s'affichait exactement comme une dose fixe de 1000 mg.
  it("préfixe d'un ≤ une dose dont seule la borne haute est renseignée", () => {
    expect(formaterDose(posologie({ dose_par_prise_mg_max: 1000 }))).toBe('≤ 1000 mg')
    expect(formaterDose(posologie({ dose_mg_kg_max: 25 }))).toBe('≤ 25 mg/kg')
    expect(formaterDose(posologie({ dose_journaliere_mg_kg_max: 120 }))).toBe('≤ 120 mg/kg / jour')
  })

  // Spiramycine pediatrique : le RCP formule la dose par palier de 10 kg, pas
  // au kg — elle etait declaree dans le type mais aucune fonction ne la mettait
  // en forme, la ligne affichait donc un tiret cadratin.
  it('formate une dose journalière exprimée par palier de 10 kg', () => {
    expect(formaterDose(posologie({ dose_journaliere_MUI_par_10kg_min: 1.5, dose_journaliere_MUI_par_10kg_max: 3 }))).toBe('1,5-3 MUI/10 kg / jour')
  })
  it("préfixe d'un ≥ une dose dont seule la borne basse est renseignée", () => {
    expect(formaterDose(posologie({ dose_par_prise_mg_min: 500 }))).toBe('≥ 500 mg')
  })

  it('préfixe aussi une borne seule exprimée en grammes, conversion g→mg comprise', () => {
    expect(formaterDose(posologie({ dose_par_prise_g_max: 8 }))).toBe('≤ 8 g')
    expect(formaterDose(posologie({ dose_par_prise_g_max: 1.5 }))).toBe('≤ 1500 mg')
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

  // Intervalle en toutes lettres : prioritaire sur les champs chiffrés, c'est
  // une formulation délibérée du RCP.
  it('affiche un intervalle rédigé en toutes lettres', () => {
    expect(formaterIntervalle(posologie({ intervalle: 'Fractionné ou continu' }))).toBe('Fractionné ou continu')
  })

  it('fait primer l\'intervalle en toutes lettres sur les champs chiffrés', () => {
    expect(formaterIntervalle(posologie({ intervalle: 'Selon réponse clinique', intervalle_min_h: 6, intervalle_max_h: 8 }))).toBe(
      'Selon réponse clinique',
    )
  })

  it('ignore un intervalle en toutes lettres vide et retombe sur les champs chiffrés', () => {
    expect(formaterIntervalle(posologie({ intervalle: '   ', intervalle_min_h: 6, intervalle_max_h: 8 }))).toBe('6-8 h')
  })

  // Convention des fiches : un intervalle de 24 h pile note une
  // administration unique, ce qui permet de renseigner un intervalle sur
  // toutes les lignes plutôt que de laisser le champ vide.
  it('affiche "Dose unique" pour un intervalle de 24 h pile', () => {
    expect(formaterIntervalle(posologie({ intervalle_min_h: 24, intervalle_max_h: 24 }))).toBe('Dose unique')
  })

  it('garde un vrai intervalle horaire quand 24 n\'est qu\'une des deux bornes', () => {
    expect(formaterIntervalle(posologie({ intervalle_min_h: 1, intervalle_max_h: 24 }))).toBe('1-24 h')
    expect(formaterIntervalle(posologie({ intervalle_min_h: 24, intervalle_max_h: 48 }))).toBe('24-48 h')
  })

  // Point 5 de l'audit posologie : un "—" ambigu (donnée manquante ou dose
  // réellement unique ?) est remplacé par une valeur explicite selon la
  // catégorie de la ligne. Conservé en plus de la règle des 24 h ci-dessus,
  // le temps que toutes les fiches renseignent un intervalle.
  it('affiche "Dose unique" si aucun champ de fréquence n\'est renseigné', () => {
    expect(formaterIntervalle(posologie())).toBe('Dose unique')
  })

  it('affiche "Continue" pour une posologie en PSE sans fréquence renseignée', () => {
    expect(formaterIntervalle(posologie({ categorie: 'pse' }))).toBe('Continue')
  })

  // Deux bornes de sens opposé rendaient le même texte : "5 min" pour un
  // délai minimal à respecter (diazépam) comme pour un délai maximal avant
  // répétition (adrénaline). Le préfixe est ce qui les distingue.
  it("distingue un intervalle minimal d'un intervalle maximal", () => {
    expect(formaterIntervalle(posologie({ intervalle_min_min: 5 }))).toBe('≥ 5 min')
    expect(formaterIntervalle(posologie({ intervalle_max_min: 5 }))).toBe('≤ 5 min')
    expect(formaterIntervalle(posologie({ intervalle_min_h: 6 }))).toBe('≥ 6 h')
  })

  it('préfixe un nombre de prises journalières plafonné', () => {
    expect(formaterIntervalle(posologie({ nb_prises_max_24h: 3 }))).toBe('≤ 3 / jour')
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

  // Maximum déjà exprimé en mg par le RCP (midazolam) : pas de passage par
  // la règle g↔mg, qui ne concerne que les valeurs saisies en grammes.
  it('affiche dose_journaliere_max_mg en mg/j, sans conversion', () => {
    expect(formaterMax(posologie({ dose_journaliere_max_mg: 7.5 }))).toBe('7,5 mg/j')
  })

  // Microgrammes (sufentanil sublingual) : même principe, aucune bascule
  // vers le mg — "0,72 mg/j" ne se dit pas au chevet.
  it('affiche dose_journaliere_max_ug en µg/j, sans conversion', () => {
    expect(formaterMax(posologie({ dose_journaliere_max_ug: 720 }))).toBe('720 µg/j')
    expect(formaterMax(posologie({ dose_journaliere_max_ug: 30 }))).toBe('30 µg/j')
  })

  // UI (héparine calcique), y compris quand le plafond dépend d'un suivi
  // biologique plutôt que d'un chiffre.
  it('affiche dose_journaliere_max_UI en UI/j, chaîne comprise', () => {
    expect(formaterMax(posologie({ dose_journaliere_max_UI: 10000 }))).toBe('10000 UI/j')
    expect(formaterMax(posologie({ dose_journaliere_max_UI: 'Selon TCA/anti-Xa' }))).toBe('Selon TCA/anti-Xa')
  })

  // Maximum journalier au poids (kétamine) : reste en mg/kg/j, la conversion
  // en mg absolus supposerait un poids que la fiche ne connaît pas.
  it('affiche dose_mg_kg_j_max en mg/kg/j, sans conversion en mg ni en g', () => {
    expect(formaterMax(posologie({ dose_mg_kg_j_max: 5 }))).toBe('5 mg/kg/j')
    expect(formaterMax(posologie({ dose_mg_kg_j_max: 1.5 }))).toBe('1,5 mg/kg/j')
  })

  it('affiche dose_mg_kg_j_max tel quel si c\'est une chaîne', () => {
    expect(formaterMax(posologie({ dose_mg_kg_j_max: 'Selon protocole' }))).toBe('Selon protocole')
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
    expect(formaterDoseParKg(posologie({ dose_par_prise_mg_min: 10, dose_par_prise_mg_max: 10 }))).toBeNull()
  })

  it('formaterDoseAbsolue lit dose_par_prise_mg_min/max (fourchette ou borne seule)', () => {
    expect(formaterDoseAbsolue(posologie({ dose_par_prise_mg_min: 10, dose_par_prise_mg_max: 10 }))).toBe('10 mg')
    expect(formaterDoseAbsolue(posologie({ dose_par_prise_mg_max: 0.6 }))).toBe('≤ 0,6 mg')
  })

  it('formaterDoseAbsolue renvoie null sans champ mg absolu', () => {
    expect(formaterDoseAbsolue(posologie({ dose_mg_kg_min: 1, dose_mg_kg_max: 1 }))).toBeNull()
  })

  it('les deux sont non-null ensemble pour une ligne combinant mg/kg et plafond absolu (cas atropine)', () => {
    const p = posologie({ dose_mg_kg_min: 0.01, dose_mg_kg_max: 0.02, dose_par_prise_mg_max: 0.6 })
    expect(formaterDoseParKg(p)).toEqual({ valeur: '0,01-0,02 mg/kg', suffixe: null })
    expect(formaterDoseAbsolue(p)).toBe('≤ 0,6 mg')
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

  // Rendu pédiatrique : chaque borne est dite dans son unité naturelle. Un
  // nourrisson de 6 mois ne se décrit pas comme "0,5 an", et un nouveau-né
  // pas comme "0 an".
  it('garde les mois en dessous de 2 ans plutôt que de les convertir en années', () => {
    expect(formaterPopulationDetail(posologie({ age_min_mois: 1, age_max_mois: 12 }))).toBe('1-12 mois')
    expect(formaterPopulationDetail(posologie({ age_max_mois: 6 }))).toBe('≤ 6 mois')
  })

  it('lit un âge en jours (néonatologie) et le mélange avec une borne en mois', () => {
    expect(formaterPopulationDetail(posologie({ age_min_jours: 0, age_max_mois: 6 }))).toBe('0 j-6 mois')
    expect(formaterPopulationDetail(posologie({ age_max_jours: 28 }))).toBe('≤ 28 j')
  })

  it('privilégie la borne en jours sur celle en mois quand les deux sont posées', () => {
    expect(formaterPopulationDetail(posologie({ age_min_jours: 7, age_min_mois: 0 }))).toBe('≥ 7 j')
  })

  it('replie une tranche d\'âge dégénérée (min = max) en valeur unique', () => {
    expect(formaterPopulationDetail(posologie({ age_min_mois: 36, age_max_mois: 36 }))).toBe('3 ans')
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

  it('libelle la voie intrarectale (midazolam)', () => {
    expect(libelleCategoriePosologie('ir', 'iv')).toBe('Voie intrarectale')
  })

  it('renvoie la valeur brute pour une categorie inconnue de la table', () => {
    expect(libelleCategoriePosologie('mystere', 'iv')).toBe('mystere')
  })
})

describe('dedupliquerPosologies', () => {
  it('ne garde qu\'une ligne quand plusieurs partagent la même categorie + population', () => {
    const resultat = dedupliquerPosologies([
      posologie({ population: 'Douleur ou fièvre', categorie: 'generale', dose_par_prise_mg_min: 400, dose_par_prise_mg_max: 400 }),
      posologie({ population: 'Douleur ou fièvre', categorie: 'generale', dose_par_prise_mg_min: 400, dose_par_prise_mg_max: 400 }),
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
    const doseFixe = posologie({ population: 'Douleur ou fièvre', categorie: 'generale', dose_par_prise_mg_min: 400, dose_par_prise_mg_max: 400 })

    // Peu importe l'ordre d'apparition, le résultat garde toujours la fourchette.
    expect(dedupliquerPosologies([doseFixe, enFourchette])).toEqual([enFourchette])
    expect(dedupliquerPosologies([enFourchette, doseFixe])).toEqual([enFourchette])
  })

  it('reconnaît aussi une fourchette exprimée en MUI (pas seulement en mg)', () => {
    const enFourchette = posologie({ population: 'X', categorie: 'generale', dose_par_prise_MUI_min: 1.5, dose_par_prise_MUI_max: 3 })
    const doseFixe = posologie({ population: 'X', categorie: 'generale', dose_par_prise_MUI: 3 })
    expect(dedupliquerPosologies([doseFixe, enFourchette])).toEqual([enFourchette])
  })

  // Regression : les debits (mg/h, mg/kg/h, UI/kg/h) et les mmol/kg etaient
  // connus de formaterDose() mais absents de la liste que estUnePlageDeDose()
  // recopiait a cote — une fourchette en mg/h passait donc pour une dose fixe,
  // et perdait l'arbitrage contre un doublon moins englobant. Les deux lisent
  // desormais la meme table FAMILLES_DOSE.
  it('reconnaît une fourchette exprimée par un débit de perfusion (mg/h, mg/kg/h, UI/kg/h)', () => {
    for (const enFourchette of [
      posologie({ population: 'X', categorie: 'pse', dose_mg_h_min: 3, dose_mg_h_max: 5 }),
      posologie({ population: 'X', categorie: 'pse', dose_mg_kg_h_min: 0.5, dose_mg_kg_h_max: 2 }),
      posologie({ population: 'X', categorie: 'pse', dose_UI_kg_h_min: 10, dose_UI_kg_h_max: 20 }),
      posologie({ population: 'X', categorie: 'pse', dose_journaliere_mmol_kg_min: 1, dose_journaliere_mmol_kg_max: 3 }),
    ]) {
      const doseFixe = posologie({ population: 'X', categorie: 'pse', dose_mg_h_min: 4, dose_mg_h_max: 4 })
      expect(dedupliquerPosologies([doseFixe, enFourchette])).toEqual([enFourchette])
    }
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
