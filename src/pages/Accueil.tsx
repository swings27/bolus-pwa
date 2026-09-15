import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import TitrePage from '../components/layout/TitrePage'
import Wordmark from '../components/layout/Wordmark'
import SearchDropdown from '../components/fiches/SearchDropdown'
import CategorieCard from '../components/categories/CategorieCard'
import { useCategoriesAvecFiches } from '../hooks/useCategoriesAvecFiches'

const NOMBRE_CATEGORIES_ACCUEIL = 4

export default function Accueil() {
  const navigate = useNavigate()
  // undefined tant que la première requête Dexie n'a pas résolu ; on
  // n'affiche alors aucune tuile plutôt qu'un faux "0 catégorie".
  const categories = useCategoriesAvecFiches()
  // Les quatre catégories les mieux fournies, et non les quatre premières
  // déclarées : l'accueil doit ouvrir sur ce qu'il y a réellement à
  // consulter, sans faire passer une catégorie à une seule fiche devant une
  // catégorie à dix. La copie ([...]) est délibérée — sort() trierait sur
  // place le tableau que useCategoriesAvecFiches() rend aussi à la page
  // Catégories, qui le veut dans son ordre de déclaration. À nombre de
  // fiches égal cet ordre de déclaration est conservé (le tri de JavaScript
  // est stable), ce qui évite que deux tuiles permutent d'un rendu à l'autre.
  const categoriesAffichees = [...(categories ?? [])]
    .sort((a, b) => b.nombreFiches - a.nombreFiches)
    .slice(0, NOMBRE_CATEGORIES_ACCUEIL)

  return (
    <div className="flex flex-col">
      <Header variant="logo" />
      {/* sr-only : le Wordmark ci-dessous joue déjà le rôle de titre visuel
          de la page (une image, pas une balise de titre) — ce h1 caché lui
          donne un équivalent textuel dans la hiérarchie de la page. */}
      <h1 className="sr-only">Bolus</h1>

      {/* Bloc d'intro */}
      <div className="flex flex-col items-center gap-2 px-6 pb-8 pt-4 text-center">
        <Wordmark taille="3.5rem" />
        <p className="max-w-xs text-base font-semibold text-accent">
          L'information médicamenteuse, fiable et à portée de main.
        </p>
      </div>

      {/* Recherche */}
      <div className="flex flex-col gap-3 px-6 pb-8">
        <div>
          <TitrePage niveau="h2">Rechercher un médicament</TitrePage>
          <p className="text-sm text-texte/60">Par nom, DCI ou nom commercial</p>
        </div>
        <SearchDropdown />
      </div>

      {/* Catégories */}
      <div className="flex flex-col gap-3 px-6 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-texte/60">
          Parcourir par catégorie
        </p>
        <div className="grid grid-cols-2 gap-3">
          {categoriesAffichees.map((categorie) => (
            <CategorieCard
              key={categorie.slug}
              categorie={categorie}
              nombreFiches={categorie.nombreFiches}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => navigate('/categories')}
          // py-3 (pas seulement pt-2) : ce lien n'avait aucun padding
          // vertical en bas, sa zone tactile ne faisait qu'une vingtaine de
          // pixels de haut — sous le minimum de 44px.
          className="mx-auto flex items-center gap-1 py-3 text-sm font-medium text-interactif"
        >
          Voir plus de catégories
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
