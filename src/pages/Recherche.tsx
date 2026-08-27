import { useEffect, useRef, useState } from 'react'
import { Search, SearchX, X } from 'lucide-react'
import Header from '../components/layout/Header'
import EtatVide from '../components/layout/EtatVide'
import ResultatFiche from '../components/fiches/ResultatFiche'
import { useSearch } from '../hooks/useSearch'
import { lireHistorique } from '../utils/historique'
import { db } from '../db'
import type { IFiche } from '../types'

export default function Recherche() {
  const [query, setQuery] = useState('')
  const [historique, setHistorique] = useState<IFiche[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Pas de limite ici (contrairement au dropdown de l'Accueil) : la page
  // plein écran a la place d'afficher tous les résultats.
  const resultats = useSearch(query)
  const termeValide = query.trim().length >= 2

  // Chargé une fois au montage : revenir sur cette page (changer d'onglet
  // puis revenir) démonte/remonte Recherche, donc relit naturellement la
  // dernière version de l'historique — pas besoin de useLiveQuery ici.
  useEffect(() => {
    let annule = false
    lireHistorique().then(async (ids) => {
      const fiches = await Promise.all(ids.map((id) => db.fiches.get(id)))
      // Une fiche de l'historique a pu disparaître du catalogue depuis
      // (voir la réconciliation dans useFichesLoader) : on l'omet plutôt
      // que d'afficher un trou.
      if (!annule) setHistorique(fiches.filter((fiche): fiche is IFiche => fiche !== undefined))
    })
    return () => {
      annule = true
    }
  }, [])

  function viderChamp() {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header variant="logo" />
      <h1 className="sr-only">Recherche</h1>

      {/* top-14 : colle sous le Header (h-14 = 56px), reste visible au
          scroll de la liste de résultats en dessous. */}
      <div className="sticky top-14 z-10 bg-fond px-6 py-3">
        <div className="flex items-center gap-2 rounded-full border-2 border-texte/50 bg-surface px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-texte/50" aria-hidden="true" />
          <label htmlFor="recherche-page" className="sr-only">
            Rechercher un médicament
          </label>
          <input
            ref={inputRef}
            id="recherche-page"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            // autoFocus : la page Recherche existe pour qu'on tape
            // immédiatement, pas pour qu'on retouche l'écran d'abord.
            autoFocus
            placeholder="Nom, DCI ou nom commercial…"
            className="w-full bg-transparent text-sm text-texte placeholder:text-texte/40 focus:outline-none"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={viderChamp}
              aria-label="Effacer la recherche"
              // -m-2 sur une boîte de 44px (h-11 w-11) : agrandit la zone
              // tactile au minimum WCAG sans agrandir visuellement le bouton
              // (l'icône reste 16px) — la marge négative absorbe la
              // différence, la pilule ne bouge pas.
              className="-m-2 flex h-11 w-11 shrink-0 items-center justify-center"
            >
              <X className="h-4 w-4 text-texte/50" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {!termeValide ? (
        historique.length > 0 ? (
          <div className="flex flex-col">
            <p className="px-6 pb-2 pt-3 text-xs font-semibold uppercase tracking-widest text-texte-doux">
              Consultées récemment
            </p>
            <div>
              {historique.map((fiche) => (
                <ResultatFiche key={fiche.id} fiche={fiche} />
              ))}
            </div>
          </div>
        ) : (
          <EtatVide
            icone={Search}
            titre="Rechercher un médicament"
            description="Tapez au moins 2 lettres pour lancer la recherche."
          />
        )
      ) : resultats.length === 0 ? (
        <EtatVide
          icone={SearchX}
          titre="Aucun résultat"
          description={`Aucun médicament ne correspond à « ${query.trim()} ».`}
        />
      ) : (
        <div className="flex flex-1 flex-col">
          <p className="px-6 pb-2 pt-3 text-xs text-texte-doux">
            {resultats.length} résultat{resultats.length > 1 ? 's' : ''}
          </p>
          <div>
            {resultats.map((fiche) => (
              <ResultatFiche key={fiche.id} fiche={fiche} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
