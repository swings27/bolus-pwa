import { Info } from 'lucide-react'

// Rappel discret mais permanent (pas de bouton de fermeture) que l'app est
// un outil d'aide et non une source prescriptive. Affiché uniquement sur
// l'Accueil (voir Layout.tsx, qui le monte dans son conteneur de bandeaux
// bas d'écran quand pathname === '/') — ailleurs, le disclaimer accepté une
// fois via DisclaimerModal suffit.
export default function DisclaimerBanner() {
  return (
    <div
      className="flex items-start gap-2 px-4 py-3"
      // Fond "légèrement plus foncé que le fond principal" dans les deux
      // thèmes : on mélange un peu de --texte dans --fond plutôt que de
      // coder une teinte fixe, qui ne conviendrait qu'au thème clair.
      style={{ backgroundColor: 'color-mix(in srgb, var(--texte) 10%, var(--fond))' }}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-texte/60" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-texte/80">
        Bolus est un outil d'aide destiné aux professionnels de santé. Il ne
        remplace ni le jugement clinique de l'infirmier ou de l'infirmière,
        ni la prescription médicale.
      </p>
    </div>
  )
}
