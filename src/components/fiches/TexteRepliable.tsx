import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface ITexteRepliableProps {
  children: ReactNode
  /** Couleur du bouton, reprise du bloc hôte (pastille de BlocInfo, filet de
   * BlocAvertissement) pour que le lien appartienne visuellement au bloc. */
  couleur: string
  /** Classes du corps de texte : taille et couleur varient d'un bloc à
   * l'autre (contre-indications en text-sm, incompatibilités en 12,5 px). */
  className?: string
}

// Corps de texte limité à 3 lignes, avec un bouton "Voir tout" qui n'apparaît
// que si le contenu déborde réellement. Partagé par BlocInfo
// (contre-indications, indications) et le bloc des incompatibilités en Y :
// la mesure ci-dessous a une subtilité qu'il vaut mieux ne pas dupliquer.
export default function TexteRepliable({ children, couleur, className = '' }: ITexteRepliableProps) {
  const [ouvert, setOuvert] = useState(false)
  const [tronque, setTronque] = useState(false)
  const corpsRef = useRef<HTMLDivElement>(null)

  // Ne mesure qu'à l'état replié (voir "ouvert" dans la garde et les
  // dépendances) : scrollHeight > clientHeight ne veut dire quelque chose que
  // tant que le line-clamp est actif — une fois déplié, les deux valeurs
  // s'égalisent, ce qui remettrait `tronque` à faux et ferait disparaître le
  // bouton "Réduire" au moindre re-render pendant que le bloc est ouvert
  // (ex. un état sans rapport qui change ailleurs sur la page). `ouvert`
  // dans les dépendances re-mesure au moment précis où l'utilisateur replie
  // à nouveau, pour rester exact si le contenu a changé entre-temps.
  useLayoutEffect(() => {
    if (ouvert) return
    const el = corpsRef.current
    if (!el) return
    setTronque(el.scrollHeight > el.clientHeight + 1)
  }, [ouvert, children])

  return (
    <>
      {/* line-clamp-3 en dur (pas une valeur interpolée) : Tailwind ne
          génère le CSS que pour les noms de classe qu'il trouve tels quels
          dans le code source. */}
      <div ref={corpsRef} className={`${className} ${ouvert ? '' : 'line-clamp-3'}`}>
        {children}
      </div>
      {tronque && (
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          className="tactile mt-1.5 flex w-fit items-center gap-1 text-[0.6875rem] font-semibold"
          style={{ color: couleur }}
        >
          {ouvert ? 'Réduire' : 'Voir tout'}
          <ChevronDown
            className={`h-3 w-3 shrink-0 transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      )}
    </>
  )
}
