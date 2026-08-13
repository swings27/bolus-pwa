import type { ICategorie } from '../types'

// Config statique en TypeScript (pas JSON) : contrairement aux fiches
// médicaments (données volumineuses, amenées à être mises à jour côté CDN
// sans redéployer l'app), les catégories sont peu nombreuses, changent
// rarement, et embarquent de la config visuelle (couleur). Les garder en
// TS permet le typage strict (ICategorie[]) et l'autocomplétion, sans
// bénéfice à les charger dynamiquement.
export const CATEGORIES: ICategorie[] = [
  {
    slug: 'anti-infectieux',
    label: 'Anti-infectieux',
    sousFamilles: ['Antibiotiques', 'Antifongiques', 'Antiparasitaires', 'Antiviraux'],
    couleur: '#1A5276',
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
    couleur: '#0B3C49',
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
    couleur: '#922B21',
  },
  {
    slug: 'electrolytes',
    label: 'Électrolytes',
    sousFamilles: [],
    couleur: '#1F618D',
  },
  {
    slug: 'endocrinologie',
    label: 'Endocrinologie',
    sousFamilles: ['Antidiabétiques', 'Corticoïdes', 'Hormones', 'Thyroïdiens'],
    couleur: '#6C3483',
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
    couleur: '#7D6608',
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
    couleur: '#154360',
  },
  {
    slug: 'autres',
    label: 'Autres',
    sousFamilles: [],
    couleur: '#616A6B',
  },
]

export function getCategorieBySlug(slug: string): ICategorie | undefined {
  return CATEGORIES.find((categorie) => categorie.slug === slug)
}
