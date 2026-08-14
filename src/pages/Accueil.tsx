import { ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Wordmark from '../components/layout/Wordmark'
import DisclaimerBanner from '../components/layout/DisclaimerBanner'
import SearchDropdown from '../components/fiches/SearchDropdown'
import CategorieCard from '../components/categories/CategorieCard'
import { useCategoriesAvecFiches } from '../hooks/useCategoriesAvecFiches'

const NOMBRE_CATEGORIES_ACCUEIL = 4

export default function Accueil() {
  const navigate = useNavigate()
  // undefined tant que la première requête Dexie n'a pas résolu ; on
  // n'affiche alors aucune tuile plutôt qu'un faux "0 catégorie".
  const categories = useCategoriesAvecFiches()
  const categoriesAffichees = (categories ?? []).slice(0, NOMBRE_CATEGORIES_ACCUEIL)

  return (
    <div className="flex flex-col">
      <Header variant="logo" />

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
          <h2 className="font-display text-2xl font-semibold text-texte">
            Rechercher un médicament
          </h2>
          <p className="text-sm text-texte/60">Par nom, DCI ou nom commercial</p>
        </div>
        <SearchDropdown />
      </div>

      {/* Catégories */}
      <div className="flex flex-col gap-3 px-6 pb-8">
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
          className="mx-auto flex items-center gap-1 pt-2 text-sm font-medium text-interactif"
        >
          Voir plus de catégories
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-auto">
        <DisclaimerBanner />
      </div>
    </div>
  )
}
