import type { IPosologieRcp } from '../types'

// Les fichiers RCP expriment une dose de plusieurs façons mutuellement
// exclusives selon la molécule et l'indication (dose fixe par prise, dose
// par kg, dose journalière par kg, débit en µg/kg/min, dose en MUI pour une
// molécule comme la spiramycine...) — ces fonctions de mise en forme testent
// les champs par ordre de spécificité et s'arrêtent au premier renseigné,
// plutôt que d'imposer un seul format à toute la fiche.

function formaterNombre(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',')
}

// Une seule borne renseignée est une borne, pas une valeur : le RCP dit
// "jusqu'à 1 g" ou "au moins 6 h", jamais "1 g" ni "6 h" fermes. Sans
// préfixe, les deux sens opposés s'affichaient à l'identique — "5 min" pour
// un délai minimal à respecter comme pour un délai maximal avant répétition.
// Même convention ≥/≤ que les bornes d'âge et de poids (voir
// formaterPlageAge/formaterPlagePoids plus bas).
function formaterPlage(min: number | undefined, max: number | undefined, unite: string): string | null {
  if (min === undefined && max === undefined) return null
  if (min !== undefined && max !== undefined) {
    return min === max ? `${formaterNombre(min)} ${unite}` : `${formaterNombre(min)}-${formaterNombre(max)} ${unite}`
  }
  return `${min !== undefined ? '≥' : '≤'} ${formaterNombre((min ?? max)!)} ${unite}`
}

// Même convention clinique que formaterGrammesOuMg (voir plus bas), mais
// pour une dose par prise exprimée directement en grammes (ex. fosfomycine,
// dosée en g et non en mg) plutôt qu'un plafond journalier isolé avec
// suffixe "/j" — pas de suffixe ici, même raison que pour le mg (voir
// formaterDose ci-dessous). Grammes entiers sur toute la fourchette → "g",
// sinon on bascule toute la fourchette en mg pour rester cohérent (jamais
// "4 g-8500 mg").
function formaterDoseEnGrammes(min: number | undefined, max: number | undefined): string | null {
  if (min === undefined && max === undefined) return null
  const entiers = (min === undefined || Number.isInteger(min)) && (max === undefined || Number.isInteger(max))
  if (entiers) return formaterPlage(min, max, 'g')
  const versMg = (n: number) => Math.round(n * 1000 * 100) / 100
  return formaterPlage(min !== undefined ? versMg(min) : undefined, max !== undefined ? versMg(max) : undefined, 'mg')
}

export function formaterDose(p: IPosologieRcp): string {
  const parPrise = formaterPlage(p.dose_par_prise_mg_min, p.dose_par_prise_mg_max, 'mg')
  if (parPrise) return parPrise
  // Dose par prise directement en grammes (ex. fosfomycine, 4-8 g) — même
  // rang de priorité que le mg ci-dessus, juste une unité différente.
  const parPriseG = formaterDoseEnGrammes(p.dose_par_prise_g_min, p.dose_par_prise_g_max)
  if (parPriseG) return parPriseG
  // MUI (millions d'unités internationales, ex. spiramycine) : même place
  // dans l'ordre de priorité que la dose par prise en mg ci-dessus, une
  // unité différente pour la même façon d'exprimer la dose.
  if (p.dose_par_prise_MUI !== undefined) return `${formaterNombre(p.dose_par_prise_MUI)} MUI`
  const parPriseMUI = formaterPlage(p.dose_par_prise_MUI_min, p.dose_par_prise_MUI_max, 'MUI')
  if (parPriseMUI) return parPriseMUI
  // UI (unités internationales, ex. énoxaparine en UI anti-Xa) — distinct des
  // MUI ci-dessus (millions d'UI, spiramycine), l'ordre de grandeur n'est pas
  // le même.
  const parPriseUI = formaterPlage(p.dose_par_prise_UI_min, p.dose_par_prise_UI_max, 'UI')
  if (parPriseUI) return parPriseUI
  // Pas de suffixe "/ prise" ici : la carte n'affiche qu'une seule prise à
  // la fois, le préciser serait redondant (contrairement à "/ jour"
  // ci-dessous, qui change réellement le sens de la valeur).
  const parKg = formaterPlage(p.dose_mg_kg_min, p.dose_mg_kg_max, 'mg/kg')
  if (parKg) return parKg
  // UI/kg par prise (ex. énoxaparine curatif, héparine en bolus) — même
  // logique que le mg/kg ci-dessus.
  const parKgUI = formaterPlage(p.dose_par_prise_UI_kg_min, p.dose_par_prise_UI_kg_max, 'UI/kg')
  if (parKgUI) return parKgUI
  const parKgParJour = formaterPlage(p.dose_journaliere_mg_kg_min, p.dose_journaliere_mg_kg_max, 'mg/kg')
  if (parKgParJour) return `${parKgParJour} / jour`
  const parJourMUI = formaterPlage(p.dose_journaliere_MUI_min, p.dose_journaliere_MUI_max, 'MUI')
  if (parJourMUI) return `${parJourMUI} / jour`
  // mmol (millimoles, ex. chlorure de potassium) : même famille que
  // dose_journaliere_mg_kg ci-dessus, en unité différente.
  const parKgParJourMmol = formaterPlage(p.dose_journaliere_mmol_kg_min, p.dose_journaliere_mmol_kg_max, 'mmol/kg')
  if (parKgParJourMmol) return `${parKgParJourMmol} / jour`
  // Débits de perfusion continue (PSE). Quatre unités selon la molécule :
  // µg/kg/min (adrénaline), mg/kg/h (kétamine), UI/kg/h (héparine) et mg/h
  // (nicardipine, non rapporté au poids). Aucune conversion entre elles :
  // chacune est reprise telle que le RCP la formule, c'est sous cette forme
  // que le débit est réglé au pousse-seringue.
  const debit = formaterPlage(p.dose_ug_kg_minute_min, p.dose_ug_kg_minute_max, 'µg/kg/min')
  if (debit) return debit
  const debitMgKgH = formaterPlage(p.dose_mg_kg_h_min, p.dose_mg_kg_h_max, 'mg/kg/h')
  if (debitMgKgH) return debitMgKgH
  const debitUIKgH = formaterPlage(p.dose_UI_kg_h_min, p.dose_UI_kg_h_max, 'UI/kg/h')
  if (debitUIKgH) return debitUIKgH
  const debitMgH = formaterPlage(p.dose_mg_h_min, p.dose_mg_h_max, 'mg/h')
  if (debitMgH) return debitMgH
  return '—'
}

/** Dose "au poids" (mg/kg), avec sa valeur et un suffixe optionnel séparés
 * plutôt qu'une seule chaîne — pour que le composant d'affichage puisse
 * mettre "/ jour" en évidence (gras) quand la dose est journalière plutôt
 * que par prise, un écart qu'il ne faut jamais manquer. Pas de suffixe pour
 * la dose par prise : la carte n'affiche qu'une seule prise à la fois, "/
 * prise" serait redondant. */
export interface IDoseParKg {
  valeur: string
  suffixe: '/ jour' | null
}

/** Calculée séparément de formaterDose() pour pouvoir l'afficher côte à côte
 * avec formaterDoseAbsolue() plutôt que de la masquer par ordre de
 * priorité. Cas réel (atropine, adrénaline, pipéracilline/tazobactam en
 * pédiatrie) : le RCP donne à la fois "0,01-0,02 mg/kg" ET un plafond
 * absolu en mg — les deux sont des informations de sécurité distinctes,
 * mieux vaut les montrer toutes les deux plutôt que de deviner laquelle
 * afficher. */
export function formaterDoseParKg(p: IPosologieRcp): IDoseParKg | null {
  const parKg = formaterPlage(p.dose_mg_kg_min, p.dose_mg_kg_max, 'mg/kg')
  if (parKg) return { valeur: parKg, suffixe: null }
  const parKgUI = formaterPlage(p.dose_par_prise_UI_kg_min, p.dose_par_prise_UI_kg_max, 'UI/kg')
  if (parKgUI) return { valeur: parKgUI, suffixe: null }
  const parKgParJour = formaterPlage(p.dose_journaliere_mg_kg_min, p.dose_journaliere_mg_kg_max, 'mg/kg')
  if (parKgParJour) return { valeur: parKgParJour, suffixe: '/ jour' }
  const parKgParJourMmol = formaterPlage(p.dose_journaliere_mmol_kg_min, p.dose_journaliere_mmol_kg_max, 'mmol/kg')
  if (parKgParJourMmol) return { valeur: parKgParJourMmol, suffixe: '/ jour' }
  return null
}

/** Partie "absolue" d'une dose (mg ou g fixes/en fourchette, jamais ramenés
 * au poids) — voir formaterDoseParKg() ci-dessus. */
export function formaterDoseAbsolue(p: IPosologieRcp): string | null {
  const enMg = formaterPlage(p.dose_par_prise_mg_min, p.dose_par_prise_mg_max, 'mg')
  if (enMg) return enMg
  return formaterDoseEnGrammes(p.dose_par_prise_g_min, p.dose_par_prise_g_max)
}

export function formaterIntervalle(p: IPosologieRcp): string {
  // Intervalle rédigé en toutes lettres quand aucune valeur chiffrée ne
  // convient (ex. noradrénaline en irrigation gastrique, "Fractionné ou
  // continu") — prioritaire sur les champs numériques : c'est une formulation
  // délibérée du RCP, pas un repli.
  if (p.intervalle !== undefined && p.intervalle.trim().length > 0) return p.intervalle
  // Un intervalle de 24 h pile est la façon dont les fiches notent une
  // administration unique : plutôt que d'afficher "24 h", qui demande un
  // calcul mental, la carte l'annonce directement comme une dose unique.
  // C'est ce qui permet de renseigner un intervalle sur toutes les lignes,
  // au lieu de laisser le champ vide pour signaler l'absence de répétition.
  if (p.intervalle_min_h === 24 && p.intervalle_max_h === 24) return 'Dose unique'
  const enHeures = formaterPlage(p.intervalle_min_h, p.intervalle_max_h, 'h')
  if (enHeures) return enHeures
  const enMinutes = formaterPlage(p.intervalle_min_min, p.intervalle_max_min, 'min')
  if (enMinutes) return enMinutes
  const parJour = formaterPlage(p.nb_prises_min_24h, p.nb_prises_max_24h, '/ jour')
  if (parJour) return parJour
  // Aucun champ de fréquence renseigné : plutôt qu'un tiret cadratin
  // ambigu (donnée manquante ou dose réellement unique ?), on affiche
  // explicitement ce que ça signifie le plus souvent — un protocole en PSE
  // ("categorie": "pse") est une perfusion continue, tout le reste sans
  // fréquence est une dose unique (bolus, prémédication...).
  return p.categorie === 'pse' ? 'Continue' : 'Dose unique'
}

/** Libellé à afficher au-dessus de la valeur de formaterIntervalle() —
 * distinct de la valeur elle-même car le sens change selon le champ source :
 * un vrai intervalle de temps (h/min) reste "Intervalle", mais quand seul
 * `nb_prises_*_24h` est renseigné (aucun intervalle horaire dans le RCP), la
 * valeur affichée est un nombre de prises par jour, pas un intervalle — le
 * libellé doit le dire pour ne pas induire en erreur. */
export function libelleIntervalle(p: IPosologieRcp): string {
  const aIntervalle =
    p.intervalle_min_h !== undefined ||
    p.intervalle_max_h !== undefined ||
    p.intervalle_min_min !== undefined ||
    p.intervalle_max_min !== undefined
  if (aIntervalle) return 'Intervalle'
  const aNbPrises = p.nb_prises_min_24h !== undefined || p.nb_prises_max_24h !== undefined
  return aNbPrises ? 'Prise journalière' : 'Intervalle'
}

// Convention clinique française : un dosage ne se dit en grammes que pour un
// nombre de grammes entier ("4 g/j", "12 g/j") ; dès qu'il faudrait une
// décimale, on l'exprime en mg à la place ("1200 mg/j", pas "1,2 g/j" — que
// personne ne dit à l'oral), y compris sous 1 g ("40 mg/j", pas "0,04 g/j").
function formaterGrammesOuMg(grammes: number, parUnite: string): string {
  if (Number.isInteger(grammes)) {
    return `${formaterNombre(grammes)} g/${parUnite}`
  }
  // *1000 en virgule flottante peut produire un résidu (0.04*1000 =
  // 40.00000000000001) — arrondi à 2 décimales pour l'effacer, largement
  // suffisant pour des doses exprimées en mg.
  const mg = Math.round(grammes * 1000 * 100) / 100
  return `${formaterNombre(mg)} mg/${parUnite}`
}

// Distinct de formaterIntervalle : ne reprend jamais nb_prises_max_24h (déjà
// utilisé comme repli d'intervalle ci-dessus) pour ne pas afficher deux fois
// la même information sous deux libellés différents.
//
// Les trois champs de maximum acceptent aussi une chaîne (ex. "Selon poids",
// "Pas de maximum journalier établi") en plus d'un nombre — le RCP ne donne
// pas toujours un plafond chiffré, particulièrement en pédiatrie où la dose
// max dépend directement du poids de l'enfant plutôt que d'être une valeur
// fixe. Une chaîne est affichée telle quelle, sans la conversion g→mg qui ne
// s'applique qu'à une vraie valeur numérique.
export function formaterMax(p: IPosologieRcp): string | null {
  const maxG = p.dose_journaliere_max_g
  if (typeof maxG === 'string') return maxG
  if (maxG !== undefined) return formaterGrammesOuMg(maxG, 'j')

  // Maximum journalier déjà exprimé en mg par le RCP (ex. midazolam,
  // 7,5 mg/j) : affiché tel quel, sans repasser par la règle g↔mg qui ne
  // concerne que les valeurs saisies en grammes.
  const maxMg = p.dose_journaliere_max_mg
  if (typeof maxMg === 'string') return maxMg
  if (maxMg !== undefined) return `${formaterNombre(maxMg)} mg/j`

  const maxMUI = p.dose_journaliere_max_MUI
  if (typeof maxMUI === 'string') return maxMUI
  // Pas de règle MUI→UI équivalente à formaterGrammesOuMg : contrairement à
  // "0,04 g/j", une valeur décimale en MUI (ex. "4,5 MUI/j") est la façon
  // normale de l'exprimer, aucune conversion nécessaire.
  if (maxMUI !== undefined) return `${formaterNombre(maxMUI)} MUI/j`

  // UI (héparine calcique) — sans rapport d'échelle avec les MUI ci-dessus,
  // voir dose_par_prise_UI.
  const maxUI = p.dose_journaliere_max_UI
  if (typeof maxUI === 'string') return maxUI
  if (maxUI !== undefined) return `${formaterNombre(maxUI)} UI/j`

  const maxMmol = p.dose_journaliere_max_mmol
  if (typeof maxMmol === 'string') return maxMmol
  if (maxMmol !== undefined) return `${formaterNombre(maxMmol)} mmol/j`

  // Maximum journalier au poids : reste en mg/kg/j, aucune conversion vers
  // des mg ou des g absolus — elle supposerait un poids que la fiche ne
  // connaît pas.
  const maxMgKgJ = p.dose_mg_kg_j_max
  if (typeof maxMgKgJ === 'string') return maxMgKgJ
  if (maxMgKgJ !== undefined) return `${formaterNombre(maxMgKgJ)} mg/kg/j`

  const maxParPrise = p.dose_max_par_prise_g
  if (typeof maxParPrise === 'string') return maxParPrise
  if (maxParPrise !== undefined) return formaterGrammesOuMg(maxParPrise, 'prise')

  return null
}

// Une borne d'âge est rendue dans l'unité où elle se dit, pas dans une unité
// unique : "0 j" pour un nouveau-né (que "0 an" ne décrirait pas), "6 mois"
// pour un nourrisson (et non "0,5 an"), des années au-delà de 2 ans. Le RCP
// donne l'âge tantôt en jours (néonatologie), tantôt en mois — les deux
// champs peuvent d'ailleurs se mélanger sur une même ligne (ex. midazolam,
// de la naissance à 6 mois).
function formaterBorneAge(jours?: number | null, mois?: number | null): { valeur: string; unite: string } | null {
  if (jours != null) return { valeur: formaterNombre(jours), unite: 'j' }
  if (mois == null) return null
  if (mois < 24) return { valeur: formaterNombre(mois), unite: 'mois' }
  return { valeur: formaterNombre(Math.round((mois / 12) * 10) / 10), unite: 'ans' }
}

function formaterPlageAge(
  minJours?: number | null,
  minMois?: number | null,
  maxJours?: number | null,
  maxMois?: number | null,
): string | null {
  const min = formaterBorneAge(minJours, minMois)
  const max = formaterBorneAge(maxJours, maxMois)
  if (min === null && max === null) return null
  if (min !== null && max !== null) {
    // Unité écrite une seule fois quand les deux bornes la partagent
    // ("6-12 ans"), deux fois sinon ("0 j-6 mois") — ce qui arrive dès qu'une
    // tranche part de la naissance pour finir en mois.
    if (min.unite === max.unite) {
      return min.valeur === max.valeur
        ? `${min.valeur} ${min.unite}`
        : `${min.valeur}-${max.valeur} ${min.unite}`
    }
    return `${min.valeur} ${min.unite}-${max.valeur} ${max.unite}`
  }
  const borne = min ?? max!
  return `${min !== null ? '≥' : '≤'} ${borne.valeur} ${borne.unite}`
}

function formaterPlagePoids(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null
  if (min != null && max != null) return `${formaterNombre(min)}-${formaterNombre(max)} kg`
  if (min != null) return `≥ ${formaterNombre(min)} kg`
  return `≤ ${formaterNombre(max!)} kg`
}

/** Précision d'âge/poids à afficher sous le libellé de population, quand le
 * RCP la chiffre (souvent le cas en pédiatrie, plus rarement pour l'adulte,
 * où la tranche est en général déjà nommée dans `population`). */
export function formaterPopulationDetail(p: IPosologieRcp): string | null {
  const parties = [
    formaterPlageAge(p.age_min_jours, p.age_min_mois, p.age_max_jours, p.age_max_mois),
    formaterPlagePoids(p.poids_min_kg, p.poids_max_kg),
  ].filter((partie): partie is string => partie !== null)
  return parties.length > 0 ? parties.join(' · ') : null
}

const LABELS_CATEGORIE_IV: Record<string, string> = {
  generale: 'Voie IV',
  im: 'Voie IM',
  sc: 'Voie SC',
  ir: 'Voie intrarectale',
  pse: 'PSE (perfusion continue)',
  speciale: 'Protocole particulier',
  ajustement: 'Ajustement',
}

const LABELS_CATEGORIE_ORALE: Record<string, string> = {
  generale: 'Posologie standard',
  speciale: 'Indication particulière',
}

/** Libellé du groupe de posologie affiché au-dessus de ses lignes — la même
 * valeur `categorie` ("generale"/"speciale") ne signifie pas la même chose
 * selon qu'elle vient du bloc iv (où elle encode surtout la voie) ou d'une
 * forme orale (où la voie est déjà connue, seule l'indication varie). */
export function libelleCategoriePosologie(categorie: string | undefined, contexte: 'iv' | 'oral'): string {
  const table = contexte === 'iv' ? LABELS_CATEGORIE_IV : LABELS_CATEGORIE_ORALE
  const cle = categorie ?? 'generale'
  return table[cle] ?? categorie ?? 'Autre'
}

// Une dose exprimée par une fourchette (min ≠ max) couvre déjà le cas d'une
// dose fixe à l'intérieur de cette fourchette (ex. 200-400 mg couvre le cas
// 400 mg) — reprend le même ordre de priorité que formaterDose() pour tester
// la bonne paire de champs selon la façon dont *cette* ligne exprime sa dose.
function estUnePlageDeDose(p: IPosologieRcp): boolean {
  if (p.dose_par_prise_mg_min !== undefined || p.dose_par_prise_mg_max !== undefined) {
    return p.dose_par_prise_mg_min !== p.dose_par_prise_mg_max
  }
  if (p.dose_par_prise_g_min !== undefined || p.dose_par_prise_g_max !== undefined) {
    return p.dose_par_prise_g_min !== p.dose_par_prise_g_max
  }
  if (p.dose_par_prise_MUI !== undefined) return false
  if (p.dose_par_prise_MUI_min !== undefined || p.dose_par_prise_MUI_max !== undefined) {
    return p.dose_par_prise_MUI_min !== p.dose_par_prise_MUI_max
  }
  if (p.dose_par_prise_UI_min !== undefined || p.dose_par_prise_UI_max !== undefined) {
    return p.dose_par_prise_UI_min !== p.dose_par_prise_UI_max
  }
  if (p.dose_mg_kg_min !== undefined || p.dose_mg_kg_max !== undefined) {
    return p.dose_mg_kg_min !== p.dose_mg_kg_max
  }
  if (p.dose_par_prise_UI_kg_min !== undefined || p.dose_par_prise_UI_kg_max !== undefined) {
    return p.dose_par_prise_UI_kg_min !== p.dose_par_prise_UI_kg_max
  }
  if (p.dose_journaliere_mg_kg_min !== undefined || p.dose_journaliere_mg_kg_max !== undefined) {
    return p.dose_journaliere_mg_kg_min !== p.dose_journaliere_mg_kg_max
  }
  if (p.dose_journaliere_MUI_min !== undefined || p.dose_journaliere_MUI_max !== undefined) {
    return p.dose_journaliere_MUI_min !== p.dose_journaliere_MUI_max
  }
  if (p.dose_ug_kg_minute_min !== undefined || p.dose_ug_kg_minute_max !== undefined) {
    return p.dose_ug_kg_minute_min !== p.dose_ug_kg_minute_max
  }
  return false
}

/** Fusionne les lignes de posologie qui partagent le même `population` au
 * sein d'une même `categorie` (ex. "Douleur légère à modérée / fièvre"
 * répété à l'identique sur plusieurs formes orales d'un même médicament) :
 * ne garde que la ligne la plus englobante, celle exprimée en fourchette
 * plutôt qu'une dose fixe qui n'en est qu'un cas particulier. Sans
 * fourchette parmi les doublons, la première ligne rencontrée est gardée.
 * L'ordre d'apparition des groupes restants est préservé. */
export function dedupliquerPosologies(posologies: IPosologieRcp[]): IPosologieRcp[] {
  const parCle = new Map<string, IPosologieRcp>()
  for (const p of posologies) {
    const cle = `${p.categorie ?? 'generale'}::${p.population}`
    const existante = parCle.get(cle)
    if (!existante || (!estUnePlageDeDose(existante) && estUnePlageDeDose(p))) {
      parCle.set(cle, p)
    }
  }
  return [...parCle.values()]
}
