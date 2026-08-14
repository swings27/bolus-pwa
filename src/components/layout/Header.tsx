import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Wordmark from './Wordmark'

interface IHeaderProps {
  variant?: 'logo' | 'retour'
}

// Header sticky commun à toutes les pages. Les deux variants affichent le
// même wordmark centré ; seule la présence de la flèche retour change. Les
// pages qui ont besoin d'un titre visible (Paramètres, À propos...) le
// portent elles-mêmes dans leur contenu, sous le header.
export default function Header({ variant = 'logo' }: IHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-40 flex h-14 items-center px-2"
      style={{
        backgroundColor: 'var(--header-fond)',
        boxShadow: '0 4px 10px -6px var(--ombre-header)',
      }}
    >
      {variant === 'retour' && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Retour"
          // 44x44px : zone tactile minimale (WCAG 2.5.5 / Apple HIG),
          // même si l'icône visible (24px) est plus petite.
          className="flex h-11 w-11 shrink-0 items-center justify-center text-texte"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
      <div
        className="flex flex-1 justify-center"
        // Compense la largeur de la flèche retour pour que le wordmark
        // reste visuellement centré sur toute la largeur du header, pas
        // seulement dans l'espace restant à droite du bouton.
        style={variant === 'retour' ? { marginRight: '2.75rem' } : undefined}
      >
        <Wordmark taille="1.5rem" />
      </div>
    </header>
  )
}
