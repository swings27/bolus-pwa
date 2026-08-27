import { ChevronRight, Heart } from 'lucide-react'
import type { IFiche } from '../../types'
import { getCategorieBySlug, texteCategorie, fondCategorie } from '../../data/categories'
import { useNavigationSure } from '../../hooks/useNavigationSure'
import ListeSeparee from './ListeSeparee'

interface IResultatFicheProps {
  fiche: IFiche
  onClick?: () => void
  /** false dans les listes déjà filtrées par catégorie (ListeCategorie) :
   * la pastille redirait vers une information déjà connue du contexte. */
  showCategorie?: boolean
  /** Affiche un petit cœur plein à côté du nom si la fiche est favorite —
   * purement indicatif ici, pas un bouton (voir BoutonFavori sur la fiche
   * elle-même pour basculer le statut). */
  estFavori?: boolean
}

// Ligne de résultat réutilisée par le dropdown de l'Accueil, la page
// Recherche plein écran et les listes de catégories — un seul balisage à
// maintenir pour ces trois usages.
export default function ResultatFiche({
  fiche,
  onClick,
  showCategorie = true,
  estFavori = false,
}: IResultatFicheProps) {
  const naviguer = useNavigationSure()
  const categorie = getCategorieBySlug(fiche.categorie)

  function gererClic() {
    if (onClick) onClick()
    else naviguer(`/fiche/${fiche.id}`)
  }

  return (
    <button
      type="button"
      onClick={gererClic}
      // min-h-14 (56px) : zone tactile confortable pour une liste dense de
      // résultats.
      className="tactile flex min-h-14 w-full items-center gap-3 border-b border-texte/10 px-4 py-3 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold text-texte">{fiche.dci}</span>
          {estFavori && (
            <Heart
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: 'var(--interactif)' }}
              fill="currentColor"
              aria-hidden="true"
            />
          )}
        </span>
        {fiche.nomsCommerciaux.length > 0 && (
          <span className="block truncate text-xs text-texte-doux">
            <ListeSeparee items={fiche.nomsCommerciaux} />
          </span>
        )}
      </span>
      {showCategorie && categorie && (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: fondCategorie(categorie.couleur),
            color: texteCategorie(categorie.couleur),
          }}
        >
          {categorie.label}
        </span>
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-texte-doux" aria-hidden="true" />
    </button>
  )
}
