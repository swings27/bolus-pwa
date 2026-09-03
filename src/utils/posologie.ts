import type { IPosologieRcp } from '../types'

// Les fichiers RCP expriment une dose de plusieurs façons mutuellement
// exclusives selon la molécule et l'indication (dose fixe par prise, dose
// par kg, dose journalière par kg, débit en µg/kg/min...) — ces fonctions de
// mise en forme testent les champs par ordre de spécificité et s'arrêtent au
// premier renseigné, plutôt que d'imposer un seul format à toute la fiche.

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
  const parKg = formaterPlage(p.dose_mg_kg_min, p.dose_mg_kg_max, 'mg/kg')
  if (parKg) return `${parKg} / prise`
  const parKgParJour = formaterPlage(p.dose_journaliere_mg_kg_min, p.dose_journaliere_mg_kg_max, 'mg/kg')
  if (parKgParJour) return `${parKgParJour} / jour`
  const debit = formaterPlage(p.dose_ugkgmin_min, p.dose_ugkgmin_max, 'µg/kg/min')
  if (debit) return debit
  return '—'
}

export function formaterIntervalle(p: IPosologieRcp): string {
  const enHeures = formaterPlage(p.intervalle_min_h, p.intervalle_max_h, 'h')
  if (enHeures) return enHeures
  const enMinutes = formaterPlage(p.intervalle_min_min, p.intervalle_max_min, 'min')
  if (enMinutes) return enMinutes
  const parJour = formaterPlage(p.nb_prises_min_24h, p.nb_prises_max_24h, '/ jour')
  if (parJour) return parJour
  return '—'
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
export function formaterMax(p: IPosologieRcp): string | null {
  if (p.dose_journaliere_max_g !== undefined) return formaterGrammesOuMg(p.dose_journaliere_max_g, 'j')
  if (p.dose_max_par_prise_g !== undefined) return formaterGrammesOuMg(p.dose_max_par_prise_g, 'prise')
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
  if (p.dose_mg_kg_min !== undefined || p.dose_mg_kg_max !== undefined) {
    return p.dose_mg_kg_min !== p.dose_mg_kg_max
  }
  if (p.dose_journaliere_mg_kg_min !== undefined || p.dose_journaliere_mg_kg_max !== undefined) {
    return p.dose_journaliere_mg_kg_min !== p.dose_journaliere_mg_kg_max
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
