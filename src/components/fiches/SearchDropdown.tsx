import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useSearch } from '../../hooks/useSearch'
import { useHistorique } from '../../hooks/useHistorique'
import { useClickOutside } from '../../hooks/useClickOutside'
import ResultatFiche from './ResultatFiche'

const MAX_RESULTATS_DROPDOWN = 6

function idOption(prefixe: string, index: number): string {
  return `${prefixe}-option-${index}`
}

// Barre de recherche de l'Accueil avec dropdown inline de résultats
// (autocomplete-like). useSearch se charge de la requête Dexie ; ce
// composant ne gère que l'UI et l'interaction (ouverture/fermeture,
// navigation clavier, sélection).
//
// Avant toute saisie, le clic sur le champ affiche l'historique de
// consultation (voir Recherche.tsx pour le même principe en plein écran) :
// un accès rapide aux dernières fiches consultées, sans lui dédier un bloc
// séparé sur la page — il partage simplement le dropdown déjà existant.
// Dès la première lettre tapée, l'historique cède la place à la recherche.
export default function SearchDropdown() {
  const [query, setQuery] = useState('')
  const [ouvert, setOuvert] = useState(false)
  const [indexSurligne, setIndexSurligne] = useState(-1)
  const conteneurRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const resultats = useSearch(query, MAX_RESULTATS_DROPDOWN)
  const historique = useHistorique()
  const afficherHistorique = ouvert && query.length === 0 && historique.length > 0
  const afficherResultats = ouvert && query.trim().length >= 2
  // Liste actuellement affichée, pour que la navigation clavier (flèches,
  // Entrée) s'applique à celle-ci quelle qu'elle soit.
  const listeActive = afficherHistorique ? historique : resultats

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

  function viderChamp() {
    setQuery('')
    inputRef.current?.focus()
  }

  function gererClavier(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOuvert(false)
      return
    }
    if ((!afficherHistorique && !afficherResultats) || listeActive.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIndexSurligne((i) => (i + 1) % listeActive.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIndexSurligne((i) => (i <= 0 ? listeActive.length - 1 : i - 1))
    } else if (event.key === 'Enter' && indexSurligne >= 0) {
      event.preventDefault()
      selectionner(listeActive[indexSurligne].id)
    }
  }

  return (
    <div ref={conteneurRef} className="relative">
      <label htmlFor="recherche-accueil" className="sr-only">
        Rechercher un médicament
      </label>
      <div className="flex items-center gap-2 rounded-full border-2 border-texte/70 bg-surface px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-texte/50" aria-hidden="true" />
        <input
          ref={inputRef}
          id="recherche-accueil"
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
          aria-expanded={afficherHistorique || afficherResultats}
          aria-autocomplete="list"
          aria-controls="search-dropdown-liste"
          // Annonce le résultat surligné par les flèches du clavier sans
          // déplacer le focus DOM (celui-ci reste sur l'input) : c'est le
          // pattern standard du rôle combobox.
          aria-activedescendant={indexSurligne >= 0 ? idOption('search-dropdown', indexSurligne) : undefined}
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

      {(afficherHistorique || afficherResultats) && (
        <div
          id="search-dropdown-liste"
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-surface shadow-lg"
        >
          {afficherHistorique && (
            <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-texte-doux">
              Consultées récemment
            </p>
          )}
          {afficherResultats && resultats.length === 0 ? (
            <p className="px-4 py-3 text-sm text-texte/60">Aucun médicament trouvé</p>
          ) : (
            listeActive.map((fiche, index) => (
              // La sémantique combobox (role="option", surlignage clavier)
              // est spécifique à ce dropdown : elle vit dans ce wrapper
              // plutôt que dans ResultatFiche, qui reste un composant de
              // liste générique réutilisable ailleurs sans ces attributs.
              <div
                key={fiche.id}
                id={idOption('search-dropdown', index)}
                role="option"
                aria-selected={index === indexSurligne}
                onMouseEnter={() => setIndexSurligne(index)}
                style={index === indexSurligne ? { backgroundColor: 'var(--fond)' } : undefined}
              >
                <ResultatFiche fiche={fiche} onClick={() => selectionner(fiche.id)} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
