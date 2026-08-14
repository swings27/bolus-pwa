import type { ReactNode } from 'react'

type Variant = 'validation' | 'alerte' | 'indication'

interface IBlocInfoProps {
  label: string
  variant: Variant
  children: ReactNode
}

// Couleur saturée (pastille + bordure) et fond pastel, par variant. Le
// fond pastel change de "famille" selon la variante (antidote/alerte/
// indication) — pas juste une question d'opacité — donc chaque variant a
// son propre token de fond dans index.css.
const CONFIG: Record<Variant, { saturee: string; fond: string }> = {
  validation: { saturee: 'var(--validation-pastille)', fond: 'var(--bloc-antidote)' },
  alerte: { saturee: 'var(--alerte)', fond: 'var(--bloc-alerte)' },
  indication: { saturee: 'var(--indication)', fond: 'var(--bloc-indication)' },
}

// Bloc générique coloré (antidote, contre-indications, indications...) :
// une pastille de label qui chevauche le bord supérieur, un corps pastel
// avec une bordure fine dans la même teinte saturée que la pastille.
export default function BlocInfo({ label, variant, children }: IBlocInfoProps) {
  const { saturee, fond } = CONFIG[variant]

  return (
    <div
      className="relative rounded-xl border p-4 pt-5"
      style={{ backgroundColor: fond, borderColor: saturee }}
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
