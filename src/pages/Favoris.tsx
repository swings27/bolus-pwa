import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import Header from '../components/layout/Header'
import EtatVide from '../components/layout/EtatVide'
import ResultatFiche from '../components/fiches/ResultatFiche'
import { useFavoris } from '../hooks/useFavoris'
import { db } from '../db'
import type { IFiche } from '../types'

export default function Favoris() {
  const { favoris } = useFavoris()
  const [fiches, setFiches] = useState<IFiche[]>([])

  useEffect(() => {
    let annule = false
    Promise.all(favoris.map((id) => db.fiches.get(id))).then((resultats) => {
      // Un favori a pu disparaître du catalogue depuis (voir la
      // réconciliation dans useFichesLoader) : on l'omet plutôt que
      // d'afficher un trou.
      if (!annule) setFiches(resultats.filter((fiche): fiche is IFiche => fiche !== undefined))
    })
    return () => {
      annule = true
    }
  }, [favoris])

  return (
    <div className="flex flex-1 flex-col">
      <Header variant="logo" />
      <h1 className="sr-only">Favoris</h1>

      {fiches.length === 0 ? (
        <EtatVide
          icone={Heart}
          titre="Aucun favori"
          description="Touchez le cœur sur une fiche pour la retrouver ici rapidement (3 maximum)."
        />
      ) : (
        <div className="flex flex-col">
          {fiches.map((fiche) => (
            <ResultatFiche key={fiche.id} fiche={fiche} />
          ))}
        </div>
      )}
    </div>
  )
}
