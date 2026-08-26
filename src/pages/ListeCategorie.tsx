import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { FolderX } from 'lucide-react'
import Header from '../components/layout/Header'
import EtatVide from '../components/layout/EtatVide'
import ResultatFiche from '../components/fiches/ResultatFiche'
import { db } from '../db'
import { getCategorieBySlug, texteCategorie } from '../data/categories'
import type { IFiche } from '../types'

interface IGroupe {
  titre: string | null
  fiches: IFiche[]
}

function trierParDci(fiches: IFiche[]): IFiche[] {
  // localeCompare('fr') : tri alphabétique correct sur les accents
  // (Étanercept doit se classer avec les E, pas après le Z d'un tri
  // ASCII naïf).
  return [...fiches].sort((a, b) => a.dci.localeCompare(b.dci, 'fr'))
}

export default function ListeCategorie() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const categorie = getCategorieBySlug(slug)

  const fiches = useLiveQuery(
    () => db.fiches.where('categorie').equals(slug).toArray(),
    [slug],
  )

  const groupes = useMemo<IGroupe[]>(() => {
    if (!fiches || !categorie) return []

    // Catégorie sans sous-familles définies (Électrolytes, Autres) :
    // liste simple triée alphabétiquement, pas de titres de groupe.
    if (categorie.sousFamilles.length === 0) {
      return [{ titre: null, fiches: trierParDci(fiches) }]
    }

    // Ordre des groupes = ordre de categories.ts (intentionnel, pas
    // alphabétique) ; à l'intérieur, tri alphabétique par DCI.
    return categorie.sousFamilles
      .map((sousFamille) => ({
        titre: sousFamille,
        fiches: trierParDci(fiches.filter((fiche) => fiche.sousFamille === sousFamille)),
      }))
      .filter((groupe) => groupe.fiches.length > 0)
  }, [fiches, categorie])

  if (!categorie) {
    return (
      <div className="flex flex-1 flex-col">
        <Header variant="retour" />
        <h1 className="sr-only">Catégorie introuvable</h1>
        <EtatVide icone={FolderX} titre="Catégorie introuvable" />
        <div className="px-6 pb-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="rounded-lg bg-interactif px-5 py-3 text-sm font-medium text-surface"
          >
            Retour aux catégories
          </button>
        </div>
      </div>
    )
  }

  const nombreFiches = fiches?.length ?? 0

  return (
    <div className="flex flex-col">
      <Header variant="retour" />

      <div className="flex flex-col gap-1 px-6 pt-2">
        <h1
          className="font-display text-2xl font-semibold"
          style={{ color: texteCategorie(categorie.couleur) }}
        >
          {categorie.label}
        </h1>
        <p className="text-sm text-texte-doux">
          {nombreFiches} fiche{nombreFiches > 1 ? 's' : ''}
        </p>
      </div>

      <div className="mt-4 flex flex-col">
        {groupes.map((groupe) => (
          <div key={groupe.titre ?? '_'}>
            {groupe.titre && (
              <div className="px-6 pb-2 pt-4">
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: texteCategorie(categorie.couleur) }}
                >
                  {groupe.titre}
                </p>
                <div className="mt-1 h-px" style={{ backgroundColor: categorie.couleur }} />
              </div>
            )}
            {groupe.fiches.map((fiche) => (
              <ResultatFiche key={fiche.id} fiche={fiche} showCategorie={false} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
