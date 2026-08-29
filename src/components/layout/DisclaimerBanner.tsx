import { Info } from 'lucide-react'

// Rappel discret mais permanent (pas de bouton de fermeture) que l'app est
// un outil d'aide et non une source prescriptive. Affiché uniquement sur
// l'Accueil (voir Layout.tsx, qui le monte dans son conteneur de bandeaux
// bas d'écran quand pathname === '/') — ailleurs, le disclaimer accepté une
// fois via DisclaimerModal suffit.
export default function DisclaimerBanner() {
  return (
    <div
      // pb-8 (pas py-3 uniforme) : le bouton rond du Calculateur dépasse de
      // 22px au-dessus de la BottomNavBar (voir BottomNavBar.tsx), soit
      // directement dans le bas de ce bandeau puisqu'il est le dernier
      // empilé juste au-dessus de la barre (voir Layout.tsx) — sans cette
      // marge basse généreuse, il recouvrirait la fin du texte. Cette
      // hauteur supplémentaire, mesurée dynamiquement (voir hauteurBandeaux
      // dans Layout.tsx), repousse aussi d'autant le bouton flottant "Un
      // retour ?", qui reste ainsi toujours au-dessus, jamais sur le texte.
      className="flex items-start gap-2 px-4 pt-3 pb-8"
      // Fond "légèrement plus foncé que le fond principal" dans les deux
      // thèmes : on mélange un peu de --texte dans --fond plutôt que de
      // coder une teinte fixe, qui ne conviendrait qu'au thème clair.
      style={{ backgroundColor: 'color-mix(in srgb, var(--texte) 10%, var(--fond))' }}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-texte/60" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-texte/80">
        Bolus est un outil d'aide destiné aux professionnels de santé. Il ne
        remplace ni votre jugement clinique, ni la prescription médicale.
      </p>
    </div>
  )
}
