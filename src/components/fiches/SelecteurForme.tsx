export type Forme = 'injectable' | 'perOs'

interface ISelecteurFormeProps {
  formes: Forme[]
  /** null tant que l'utilisateur n'a pas encore choisi — aucune pilule
   * n'est alors active (voir FicheMedicament.tsx). */
  forme: Forme | null
  onChange: (forme: Forme) => void
}

const LABELS: Record<Forme, string> = {
  injectable: 'Injectable',
  perOs: 'Per os / Autres',
}

// Couleur d'identité par forme (pas un simple actif/inactif générique comme
// SegmentedControl) : Injectable garde le teal même inactif, Per os garde
// le terracotta même inactif — seul le remplissage (plein vs. transparent)
// distingue l'onglet actif. Un pilule spécifique à ce sélecteur plutôt
// qu'une délégation à SegmentedControl, dont les calculateurs dépendent
// avec une sémantique différente (actif/inactif générique, pas d'identité
// par option) qu'il ne faut pas perturber.
const COULEUR: Record<Forme, string> = {
  injectable: 'var(--texte)',
  perOs: 'var(--accent)',
}

// Une molécule qui n'existe que sous une seule forme (ex. Adrénaline :
// injectable uniquement) ne doit pas imposer un choix inutile à
// l'utilisateur — le sélecteur ne s'affiche que s'il y a réellement
// quelque chose à choisir entre.
export default function SelecteurForme({ formes, forme, onChange }: ISelecteurFormeProps) {
  if (formes.length === 1) return null

  return (
    <div className="flex gap-2.5">
      {formes.map((valeur) => {
        const actif = valeur === forme
        const couleur = COULEUR[valeur]
        return (
          <button
            key={valeur}
            type="button"
            onClick={() => onChange(valeur)}
            aria-pressed={actif}
            className="tactile flex-1 rounded-full px-4 py-3 text-center text-[12.5px] font-semibold"
            style={{
              backgroundColor: actif ? couleur : 'var(--fond)',
              color: actif ? 'var(--fond)' : couleur,
              boxShadow: actif
                ? `0 3px 9px color-mix(in srgb, ${couleur} 38%, transparent)`
                : `0 1px 3px color-mix(in srgb, var(--texte) 13%, transparent)`,
            }}
          >
            {LABELS[valeur]}
          </button>
        )
      })}
    </div>
  )
}
