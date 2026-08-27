import { useNavigate } from 'react-router-dom'
import type { ICategorie } from '../../types'
import { fondCategorie } from '../../data/categories'

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
      style={{
        backgroundColor: fondCategorie(categorie.couleur),
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
