import type { ReactNode } from 'react'

type Variant = 'validation' | 'alerte' | 'indication'

interface IBlocInfoProps {
  label: string
  variant: Variant
  children: ReactNode
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
export default function BlocInfo({ label, variant, children }: IBlocInfoProps) {
  const { saturee } = CONFIG[variant]

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
      <div className="text-sm text-texte">{children}</div>
    </div>
  )
}
