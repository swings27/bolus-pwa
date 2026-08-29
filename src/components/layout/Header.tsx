import { ChevronLeft, Menu as MenuIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Wordmark from './Wordmark'
import BandeauBeta from './BandeauBeta'
import { DONNEES_MOCK } from '../../data/editeur'

interface IHeaderProps {
  variant?: 'logo' | 'retour'
}

// Header sticky commun à toutes les pages. Les deux variants affichent le
// même wordmark centré ; seule la présence de la flèche retour change. Les
// pages qui ont besoin d'un titre visible (Paramètres, À propos...) le
// portent elles-mêmes dans leur contenu, sous le header.
//
// Trois zones de largeur symétrique (44px chacune à gauche/droite, le
// centre en flex-1) plutôt qu'une marge de compensation calculée à la
// main : le bouton Menu occupe toujours la zone de droite, la zone de
// gauche est vide ou porte la flèche retour selon le variant — le
// wordmark reste centré sur toute la largeur du header dans les deux cas,
// sans recalcul si un troisième élément s'ajoute un jour.
//
// Le conteneur sticky englobe BandeauBeta ET la barre elle-même — un seul
// bloc, pas deux éléments sticky indépendants coordonnés via une hauteur
// mesurée (ResizeObserver + variable CSS) : cette dernière approche a
// laissé passer un intervalle visible entre les deux (l'espace au-dessus
// du Header, le temps que la mesure se propage à travers l'arbre). Ici,
// les deux vivent dans le même flux normal sous un seul top:0 sticky —
// rien à mesurer, rien à décaler, ils bougent physiquement ensemble.
export default function Header({ variant = 'logo' }: IHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-40">
      <BandeauBeta />
      <header
        className="flex items-center px-2"
        style={{
          // height (pas h-14) : la hauteur totale doit inclure la zone sûre
          // en plus des 56px de contenu, sans quoi padding-top grignoterait
          // les 56px existants et écraserait le wordmark contre le bas —
          // sauf quand BandeauBeta s'en charge déjà juste au-dessus (elle
          // porte alors elle-même cette marge, voir ce composant).
          height: DONNEES_MOCK ? '56px' : 'var(--hauteur-header)',
          paddingTop: DONNEES_MOCK ? undefined : 'env(safe-area-inset-top)',
          backgroundColor: 'var(--header-fond)',
          boxShadow: '0 4px 10px -6px var(--ombre-header)',
        }}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {variant === 'retour' && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Retour"
              // 44x44px : zone tactile minimale (WCAG 2.5.5 / Apple HIG),
              // même si l'icône visible (24px) est plus petite.
              className="flex h-11 w-11 items-center justify-center text-texte"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-1 justify-center">
          <Wordmark taille="1.5rem" />
        </div>

        <Link
          to="/menu"
          aria-label="Menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-texte"
        >
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        </Link>
      </header>
    </div>
  )
}
