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

function formaterPlage(min: number | undefined, max: number | undefined, unite: string): string | null {
  if (min === undefined && max === undefined) return null
  if (min !== undefined && max !== undefined) {
    return min === max ? `${formaterNombre(min)} ${unite}` : `${formaterNombre(min)}-${formaterNombre(max)} ${unite}`
  }
  return `${formaterNombre((min ?? max)!)} ${unite}`
}

export function formaterDose(p: IPosologieRcp): string {
  if (p.dose_par_prise_mg !== undefined) return `${formaterNombre(p.dose_par_prise_mg)} mg`
  const parPrise = formaterPlage(p.dose_par_prise_mg_min, p.dose_par_prise_mg_max, 'mg')
  if (parPrise) return parPrise
  // MUI (millions d'unités internationales, ex. spiramycine) : même place
  // dans l'ordre de priorité que la dose par prise en mg ci-dessus, une
  // unité différente pour la même façon d'exprimer la dose.
  if (p.dose_par_prise_MUI !== undefined) return `${formaterNombre(p.dose_par_prise_MUI)} MUI`
  const parPriseMUI = formaterPlage(p.dose_par_prise_MUI_min, p.dose_par_prise_MUI_max, 'MUI')
  if (parPriseMUI) return parPriseMUI
  const parKg = formaterPlage(p.dose_mg_kg_min, p.dose_mg_kg_max, 'mg/kg')
  if (parKg) return `${parKg} / prise`
  const parKgParJour = formaterPlage(p.dose_journaliere_mg_kg_min, p.dose_journaliere_mg_kg_max, 'mg/kg')
  if (parKgParJour) return `${parKgParJour} / jour`
  const parJourMUI = formaterPlage(p.dose_journaliere_MUI_min, p.dose_journaliere_MUI_max, 'MUI')
  if (parJourMUI) return `${parJourMUI} / jour`
  const debit = formaterPlage(p.dose_ugkgmin_min, p.dose_ugkgmin_max, 'µg/kg/min')
  if (debit) return debit
  return '—'
}

/** Partie "au poids" d'une dose (mg/kg par prise, ou mg/kg par jour) —
 * calculée séparément de formaterDose() pour pouvoir l'afficher côte à côte
 * avec formaterDoseAbsolue() plutôt que de la masquer par ordre de
 * priorité. Cas réel (atropine, adrénaline, pipéracilline/tazobactam en
 * pédiatrie) : le RCP donne à la fois "0,01-0,02 mg/kg" ET un plafond
 * absolu en mg — les deux sont des informations de sécurité distinctes,
 * mieux vaut les montrer toutes les deux plutôt que de deviner laquelle
 * afficher. */
export function formaterDoseParKg(p: IPosologieRcp): string | null {
  const parKg = formaterPlage(p.dose_mg_kg_min, p.dose_mg_kg_max, 'mg/kg')
  if (parKg) return `${parKg} / prise`
  const parKgParJour = formaterPlage(p.dose_journaliere_mg_kg_min, p.dose_journaliere_mg_kg_max, 'mg/kg')
  if (parKgParJour) return `${parKgParJour} / jour`
  return null
}

/** Partie "absolue" d'une dose (mg fixes ou fourchette de mg, jamais ramenés
 * au poids) — voir formaterDoseParKg() ci-dessus. */
export function formaterDoseAbsolue(p: IPosologieRcp): string | null {
  if (p.dose_par_prise_mg !== undefined) return `${formaterNombre(p.dose_par_prise_mg)} mg`
  return formaterPlage(p.dose_par_prise_mg_min, p.dose_par_prise_mg_max, 'mg')
}

export function formaterIntervalle(p: IPosologieRcp): string {
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

  const maxMUI = p.dose_journaliere_max_MUI
  if (typeof maxMUI === 'string') return maxMUI
  // Pas de règle MUI→UI équivalente à formaterGrammesOuMg : contrairement à
  // "0,04 g/j", une valeur décimale en MUI (ex. "4,5 MUI/j") est la façon
  // normale de l'exprimer, aucune conversion nécessaire.
  if (maxMUI !== undefined) return `${formaterNombre(maxMUI)} MUI/j`

  const maxParPrise = p.dose_max_par_prise_g
  if (typeof maxParPrise === 'string') return maxParPrise
  if (maxParPrise !== undefined) return formaterGrammesOuMg(maxParPrise, 'prise')

  return null
}

function formaterPlageAge(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null
  const enAnnees = (mois: number) => Math.round((mois / 12) * 10) / 10
  if (min != null && max != null) return `${formaterNombre(enAnnees(min))}-${formaterNombre(enAnnees(max))} ans`
  if (min != null) return `≥ ${formaterNombre(enAnnees(min))} ans`
  return `≤ ${formaterNombre(enAnnees(max!))} ans`
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
  const parties = [formaterPlageAge(p.age_min_mois, p.age_max_mois), formaterPlagePoids(p.poids_min_kg, p.poids_max_kg)].filter(
    (partie): partie is string => partie !== null,
  )
  return parties.length > 0 ? parties.join(' · ') : null
}

const LABELS_CATEGORIE_IV: Record<string, string> = {
  generale: 'Voie IV',
  im: 'Voie IM',
  sc: 'Voie SC',
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
  if (p.dose_par_prise_mg !== undefined) return false
  if (p.dose_par_prise_mg_min !== undefined || p.dose_par_prise_mg_max !== undefined) {
    return p.dose_par_prise_mg_min !== p.dose_par_prise_mg_max
  }
  if (p.dose_par_prise_MUI !== undefined) return false
  if (p.dose_par_prise_MUI_min !== undefined || p.dose_par_prise_MUI_max !== undefined) {
    return p.dose_par_prise_MUI_min !== p.dose_par_prise_MUI_max
  }
  if (p.dose_mg_kg_min !== undefined || p.dose_mg_kg_max !== undefined) {
    return p.dose_mg_kg_min !== p.dose_mg_kg_max
  }
  if (p.dose_journaliere_mg_kg_min !== undefined || p.dose_journaliere_mg_kg_max !== undefined) {
    return p.dose_journaliere_mg_kg_min !== p.dose_journaliere_mg_kg_max
  }
  if (p.dose_journaliere_MUI_min !== undefined || p.dose_journaliere_MUI_max !== undefined) {
    return p.dose_journaliere_MUI_min !== p.dose_journaliere_MUI_max
  }
  if (p.dose_ugkgmin_min !== undefined || p.dose_ugkgmin_max !== undefined) {
    return p.dose_ugkgmin_min !== p.dose_ugkgmin_max
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
