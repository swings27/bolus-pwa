import type { ICategorie } from '../../types'
import { fondCategorie } from '../../data/categories'
import { useNavigationSure } from '../../hooks/useNavigationSure'

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
  const naviguer = useNavigationSure()

  return (
    <button
      type="button"
      onClick={() => naviguer(`/categories/${categorie.slug}`)}
      style={{
        backgroundColor: fondCategorie(categorie.couleur),
        // Ombre légère : détache la carte du fond pour casser l'effet
        // "aplat 2D", sans aller jusqu'à un relief marqué.
        boxShadow: '0 4px 12px var(--ombre-carte)',
      }}
      className="tactile flex flex-col items-start gap-2 rounded-2xl p-4 text-left"
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
