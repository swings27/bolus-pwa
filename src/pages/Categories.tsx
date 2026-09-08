import Header from '../components/layout/Header'
import ListeSeparee from '../components/fiches/ListeSeparee'
import { useCategoriesAvecFiches } from '../hooks/useCategoriesAvecFiches'
import { useNavigationSure } from '../hooks/useNavigationSure'
import { texteCategorie, fondCategorie } from '../data/categories'

export default function Categories() {
  const naviguer = useNavigationSure()
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
              onClick={() => naviguer(`/categories/${categorie.slug}`)}
              style={{
                backgroundColor: fondCategorie(categorie.couleur),
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
                // div, pas p : ListeSeparee rend elle-même un <p> — un <p>
                // dans un <p> est un nid de balises invalide (React avertit
                // "cannot appear as a descendant of").
                <div className="text-[11px] text-texte-doux">
                  <ListeSeparee items={categorie.sousFamillesPresentes} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
