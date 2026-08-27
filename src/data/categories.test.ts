import { describe, it, expect } from 'vitest'
import { CATEGORIES, getCategorieBySlug, fondCategorie, texteCategorie } from './categories'

describe('getCategorieBySlug', () => {
  it('retrouve une catégorie existante par son slug', () => {
    const categorie = getCategorieBySlug('cardiovasculaire')
    expect(categorie?.label).toBe('Cardiovasculaire')
  })

  it('renvoie undefined pour un slug inconnu', () => {
    expect(getCategorieBySlug('slug-qui-nexiste-pas')).toBeUndefined()
  })

  it('couvre bien toutes les catégories déclarées (aucun slug dupliqué)', () => {
    const slugs = CATEGORIES.map((categorie) => categorie.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe('fondCategorie', () => {
  it('mélange la couleur donnée avec --fond via le dosage --opacite-tint', () => {
    expect(fondCategorie('#C65D3B')).toBe('color-mix(in srgb, #C65D3B var(--opacite-tint), var(--fond))')
  })
})

describe('texteCategorie', () => {
  it('mélange --texte avec la couleur donnée via le dosage --poids-texte-categorie', () => {
    expect(texteCategorie('#0B3C49')).toBe('color-mix(in srgb, var(--texte) var(--poids-texte-categorie), #0B3C49)')
  })
})
