import { useNavigate } from 'react-router-dom'
import type { ICategorie } from '../../types'

interface ICategorieCardProps {
  categorie: ICategorie
  nombreFiches: number
  showSousFamilles?: boolean
}

export default function CategorieCard({
  categorie,
  nombreFiches,
  showSousFamilles = false,
}: ICategorieCardProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/categories/${categorie.slug}`)}
      // color-mix() calcule un mélange entre deux couleurs directement en
      // CSS, sans JS ni valeur pré-calculée : ici, {couleur} de la
      // catégorie et var(--fond) du thème actif, dosé par
      // var(--opacite-tint). Comme --fond change entre clair et sombre,
      // le même appel produit automatiquement un fond pâle cohérent dans
      // les deux thèmes — pas besoin de coder 16 teintes en dur (8
      // catégories × 2 thèmes), color-mix() s'en charge à chaque rendu.
      style={{
        backgroundColor: `color-mix(in srgb, ${categorie.couleur} var(--opacite-tint), var(--fond))`,
        // Ombre légère : détache la carte du fond pour casser l'effet
        // "aplat 2D", sans aller jusqu'à un relief marqué.
        boxShadow: '0 4px 12px var(--ombre-carte)',
      }}
      // active:scale-95 : légère réduction d'échelle au tap, avec une
      // transition douce, pour donner un retour tactile immédiat sur mobile.
      className="flex flex-col items-start gap-2 rounded-2xl p-4 text-left transition-transform duration-150 active:scale-95"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: categorie.couleur }}
        aria-hidden="true"
      >
        {categorie.code}
      </span>
      <span className="font-semibold text-texte">{categorie.label}</span>
      <span className="text-xs text-texte-doux">
        {nombreFiches} fiche{nombreFiches > 1 ? 's' : ''}
      </span>
      {showSousFamilles && categorie.sousFamilles.length > 0 && (
        <span className="mt-1 text-[11px] text-texte-doux">
          {categorie.sousFamilles.join(' · ')}
        </span>
      )}
    </button>
  )
}
