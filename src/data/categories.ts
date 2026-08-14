import type { ICategorie } from '../types'

// Config statique en TypeScript (pas JSON) : contrairement aux fiches
// médicaments (données volumineuses, amenées à être mises à jour côté CDN
// sans redéployer l'app), les catégories sont peu nombreuses, changent
// rarement, et embarquent de la config visuelle (couleur). Les garder en
// TS permet le typage strict (ICategorie[]) et l'autocomplétion, sans
// bénéfice à les charger dynamiquement.
//
// "couleur" est une teinte saturée (identité de la catégorie), mais les
// composants ne l'appliquent JAMAIS en fond plein — un fond entièrement
// saturé sur toute une carte serait trop agressif visuellement, surtout
// répété plusieurs fois dans une grille. Voir CategorieCard.tsx : le fond
// réel est obtenu avec color-mix(in srgb, {couleur} var(--opacite-tint),
// var(--fond)), c'est-à-dire un mélange de la couleur de la catégorie et du
// fond du thème actif, dosé par --opacite-tint (18% en clair, 22% en
// sombre — un peu plus dosé en sombre car les teintes y paraissent plus
// discrètes sur un fond sombre). Comme le mélange se fait avec var(--fond),
// la même couleur de catégorie donne automatiquement un résultat cohérent
// avec le thème actif, sans qu'on ait à coder 16 valeurs en dur (8
// catégories × 2 thèmes) : une seule couleur de base suffit, color-mix()
// fait le reste au moment du rendu.
export const CATEGORIES: ICategorie[] = [
  {
    slug: 'anti-infectieux',
    label: 'Anti-infectieux',
    sousFamilles: ['Antibiotiques', 'Antifongiques', 'Antiparasitaires', 'Antiviraux'],
    couleur: '#0B3C49',
    code: 'AI',
  },
  {
    slug: 'antalgiques',
    label: 'Antalgiques',
    sousFamilles: [
      'AINS',
      'Antalgiques palier 1',
      'Antalgiques palier 2',
      'Opiacés',
    ],
    couleur: '#C65D3B',
    code: 'AN',
  },
  {
    slug: 'cardiovasculaire',
    label: 'Cardiovasculaire',
    sousFamilles: [
      'Anticoagulants',
      'Antihypertenseurs',
      'Cardiotropes',
      'Diurétiques',
      'Hypolipémiants',
    ],
    couleur: '#8C2F39',
    code: 'CV',
  },
  {
    slug: 'electrolytes',
    label: 'Électrolytes',
    sousFamilles: [],
    couleur: '#3E7C8A',
    code: 'EL',
  },
  {
    slug: 'endocrinologie',
    label: 'Endocrinologie',
    sousFamilles: ['Antidiabétiques', 'Corticoïdes', 'Hormones', 'Thyroïdiens'],
    couleur: '#7A4F63',
    code: 'EN',
  },
  {
    slug: 'gastrologie',
    label: 'Gastrologie',
    sousFamilles: [
      'Antiémétiques',
      'Antidiarrhéiques',
      'Laxatifs',
      'Protecteurs gastriques',
    ],
    couleur: '#D4B106',
    code: 'GA',
  },
  {
    slug: 'psychotropes',
    label: 'Psychotropes',
    sousFamilles: [
      'Anticonvulsivants',
      'Antidépresseurs',
      'Antipsychotiques',
      'Anxiolytiques',
      'Hypnotiques',
    ],
    couleur: '#3F5D38',
    code: 'PS',
  },
  {
    slug: 'autres',
    label: 'Autres',
    sousFamilles: [],
    couleur: '#5C6B70',
    code: 'AU',
  },
]

export function getCategorieBySlug(slug: string): ICategorie | undefined {
  return CATEGORIES.find((categorie) => categorie.slug === slug)
}
