import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { IFiche } from '../../types'
import { getCategorieBySlug, texteCategorie, fondCategorie } from '../../data/categories'
import ListeSeparee from './ListeSeparee'

interface IResultatFicheProps {
  fiche: IFiche
  onClick?: () => void
  /** false dans les listes déjà filtrées par catégorie (ListeCategorie) :
   * la pastille redirait vers une information déjà connue du contexte. */
  showCategorie?: boolean
}

// Ligne de résultat réutilisée par le dropdown de l'Accueil, la page
// Recherche plein écran et les listes de catégories — un seul balisage à
// maintenir pour ces trois usages.
export default function ResultatFiche({
  fiche,
  onClick,
  showCategorie = true,
}: IResultatFicheProps) {
  const navigate = useNavigate()
  const categorie = getCategorieBySlug(fiche.categorie)

  function gererClic() {
    if (onClick) onClick()
    else navigate(`/fiche/${fiche.id}`)
  }

  return (
    <button
      type="button"
      onClick={gererClic}
      // min-h-14 (56px) : zone tactile confortable pour une liste dense de
      // résultats. active:bg-surface : léger retour visuel au tap.
      className="flex min-h-14 w-full items-center gap-3 border-b border-texte/10 px-4 py-3 text-left transition-colors active:bg-surface"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-texte">{fiche.dci}</span>
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
