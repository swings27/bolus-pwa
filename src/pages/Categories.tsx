import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import ListeSeparee from '../components/fiches/ListeSeparee'
import { useCategoriesAvecFiches } from '../hooks/useCategoriesAvecFiches'
import { texteCategorie } from '../data/categories'

export default function Categories() {
  const navigate = useNavigate()
  const categories = useCategoriesAvecFiches()

  return (
    <div className="flex flex-col">
      <Header variant="logo" />

      <div className="flex flex-col gap-4 px-6 pb-8 pt-2">
        <div>
          <h1 className="font-display text-2xl font-semibold text-texte">Catégories</h1>
          <p className="text-sm text-texte-doux">Parcourir les médicaments par famille.</p>
        </div>

        <div className="flex flex-col gap-3">
          {(categories ?? []).map((categorie) => (
            <button
              key={categorie.slug}
              type="button"
              onClick={() => navigate(`/categories/${categorie.slug}`)}
              // Même logique color-mix() que CategorieCard (Accueil) : fond
              // pâle dérivé de la couleur de catégorie + var(--fond), donc
              // cohérent avec le thème actif sans teinte codée en dur.
              style={{
                backgroundColor: `color-mix(in srgb, ${categorie.couleur} var(--opacite-tint), var(--fond))`,
                borderColor: categorie.couleur,
              }}
              className="flex flex-col gap-1 rounded-2xl border-2 p-4 text-left"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold" style={{ color: texteCategorie(categorie.couleur) }}>
                  {categorie.label}
                </span>
                <span className="shrink-0 text-xs text-texte-doux">
                  {categorie.nombreFiches} fiche{categorie.nombreFiches > 1 ? 's' : ''}
                </span>
              </div>
              {categorie.sousFamillesPresentes.length > 0 && (
                <p className="text-[11px] text-texte-doux">
                  <ListeSeparee items={categorie.sousFamillesPresentes} />
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
