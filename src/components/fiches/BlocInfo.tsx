import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type Variant = 'validation' | 'alerte' | 'indication'

interface IBlocInfoProps {
  label: string
  variant: Variant
  children: ReactNode
  /** Replie le contenu à 3 lignes avec un bouton "Voir tout" quand il
   * déborde (ex. contre-indications/indications à rallonge comme celles de
   * l'ibuprofène) — omis par défaut (ex. Antidote, toujours court). */
  repliable?: boolean
}

// Couleur saturée (pastille + bordure), par variant. Le fond se calcule à
// partir de cette même couleur via color-mix() plutôt qu'un token pastel
// fixe par variant/thème : plus simple à doser d'un coup (voir le 10%
// ci-dessous) sans jongler avec 6 valeurs hexadécimales (3 variantes × 2
// thèmes) qui dérivent facilement d'un ton trop pâle à l'usage.
const CONFIG: Record<Variant, { saturee: string }> = {
  validation: { saturee: 'var(--validation-pastille)' },
  alerte: { saturee: 'var(--alerte)' },
  indication: { saturee: 'var(--indication)' },
}

// Bloc générique coloré (antidote, contre-indications, indications...) :
// une pastille de label qui chevauche le bord supérieur, un corps pastel
// avec une bordure de 2px dans la même teinte saturée que la pastille.
// h-full : quand deux BlocInfo se retrouvent côte à côte dans un parent
// flex items-stretch (ex. Antidote/Contre-indications sur la fiche
// médicament), l'un ne doit jamais paraître plus court que l'autre — sans
// ça, seul le conteneur invisible qui l'enveloppe est étiré, pas la boîte
// bordée elle-même. Sans effet ailleurs (un parent à hauteur automatique
// ignore un h-full sur son enfant).
export default function BlocInfo({ label, variant, children, repliable = false }: IBlocInfoProps) {
  const { saturee } = CONFIG[variant]
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
    if (!repliable || ouvert) return
    const el = corpsRef.current
    if (!el) return
    setTronque(el.scrollHeight > el.clientHeight + 1)
  }, [repliable, ouvert, children])

  return (
    <div
      className="relative flex h-full flex-col rounded-xl border-2 p-4 pt-5"
      style={{ backgroundColor: `color-mix(in srgb, ${saturee} 10%, var(--fond))`, borderColor: saturee }}
    >
      <span
        className="absolute -top-3 left-4 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
        // var(--fond) plutôt que blanc en dur : --fond est clair en thème
        // clair (crème) et sombre en thème sombre, ce qui donne toujours un
        // texte contrasté sur la pastille saturée, dans les deux thèmes.
        style={{ backgroundColor: saturee, color: 'var(--fond)' }}
      >
        {label}
      </span>
      {/* line-clamp-3 en dur (pas une valeur interpolée) : Tailwind ne
          génère le CSS que pour les noms de classe qu'il trouve tels quels
          dans le code source. */}
      <div ref={repliable ? corpsRef : undefined} className={`text-sm text-texte ${repliable && !ouvert ? 'line-clamp-3' : ''}`}>
        {children}
      </div>
      {repliable && tronque && (
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          className="tactile mt-1.5 flex items-center gap-1 self-start text-[11px] font-semibold"
          style={{ color: saturee }}
        >
          {ouvert ? 'Réduire' : 'Voir tout'}
          <ChevronDown
            className={`h-3 w-3 shrink-0 transition-transform duration-200 ${ouvert ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  )
}
