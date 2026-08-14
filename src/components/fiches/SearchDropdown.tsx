import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useSearch } from '../../hooks/useSearch'
import { useClickOutside } from '../../hooks/useClickOutside'
import { getCategorieBySlug } from '../../data/categories'

// Barre de recherche de l'Accueil avec dropdown inline de résultats
// (autocomplete-like). useSearch se charge de la requête Dexie ; ce
// composant ne gère que l'UI et l'interaction (ouverture/fermeture,
// navigation clavier, sélection).
export default function SearchDropdown() {
  const [query, setQuery] = useState('')
  const [ouvert, setOuvert] = useState(false)
  const [indexSurligne, setIndexSurligne] = useState(-1)
  const conteneurRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { resultats } = useSearch(query)
  const afficherDropdown = ouvert && query.trim().length >= 2

  useClickOutside(conteneurRef, () => setOuvert(false))

  // Nouvelle recherche → on oublie l'ancien index surligné, il pourrait
  // pointer vers un résultat qui n'existe plus dans la nouvelle liste.
  useEffect(() => {
    setIndexSurligne(-1)
  }, [query])

  function selectionner(id: string) {
    setOuvert(false)
    navigate(`/fiche/${id}`)
  }

  function gererClavier(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOuvert(false)
      return
    }
    if (!afficherDropdown || resultats.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIndexSurligne((i) => (i + 1) % resultats.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIndexSurligne((i) => (i <= 0 ? resultats.length - 1 : i - 1))
    } else if (event.key === 'Enter' && indexSurligne >= 0) {
      event.preventDefault()
      selectionner(resultats[indexSurligne].id)
    }
  }

  return (
    <div ref={conteneurRef} className="relative">
      <div className="flex items-center gap-2 rounded-full border-2 border-texte/70 bg-surface px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-texte/50" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOuvert(true)
          }}
          onFocus={() => setOuvert(true)}
          onKeyDown={gererClavier}
          placeholder="Ex. Paracétamol…"
          className="w-full bg-transparent text-sm text-texte placeholder:text-texte/40 focus:outline-none"
          role="combobox"
          aria-expanded={afficherDropdown}
          aria-autocomplete="list"
          aria-controls="search-dropdown-liste"
        />
      </div>

      {afficherDropdown && (
        <div
          id="search-dropdown-liste"
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-surface shadow-lg"
        >
          {resultats.length === 0 ? (
            <p className="px-4 py-3 text-sm text-texte/60">Aucun médicament trouvé</p>
          ) : (
            resultats.map((fiche, index) => {
              const categorie = getCategorieBySlug(fiche.categorie)
              return (
                <button
                  key={fiche.id}
                  type="button"
                  role="option"
                  aria-selected={index === indexSurligne}
                  onClick={() => selectionner(fiche.id)}
                  onMouseEnter={() => setIndexSurligne(index)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${
                    index === indexSurligne ? 'bg-fond' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-texte">
                      {fiche.dci}
                    </span>
                    {fiche.nomsCommerciaux.length > 0 && (
                      <span className="block truncate text-xs text-texte/60">
                        {fiche.nomsCommerciaux.join(' · ')}
                      </span>
                    )}
                  </span>
                  {categorie && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: categorie.couleur }}
                    >
                      {categorie.label}
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
