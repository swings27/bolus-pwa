import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Wordmark from './Wordmark'

interface IHeaderProps {
  variant?: 'logo' | 'retour'
  titre?: string
}

// Header commun aux pages : soit le wordmark centré (accueil, pages
// principales), soit un header de navigation avec retour (fiche
// médicament, sous-pages). sticky top-0 : reste visible en haut de l'écran
// pendant le scroll du contenu.
export default function Header({ variant = 'logo', titre }: IHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 bg-fond px-4 py-4 shadow-[0_4px_10px_-6px_var(--ombre-header)]">
      {variant === 'logo' ? (
        <div className="flex justify-center">
          <Wordmark />
        </div>
      ) : (
        <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Retour"
            className="flex h-10 w-10 items-center justify-center text-texte"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          {titre ? (
            <h1 className="truncate text-center font-display text-lg font-semibold text-texte">
              {titre}
            </h1>
          ) : (
            // Pas de titre fourni (ex. fiche médicament) : le wordmark tient
            // lieu de titre, centré entre la flèche retour et son espace
            // réservé symétrique.
            <div className="flex justify-center">
              <Wordmark className="h-6" />
            </div>
          )}
          <span />
        </div>
      )}
    </header>
  )
}
