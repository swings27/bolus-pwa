export type Forme = 'injectable' | 'perOs'

interface ISelecteurFormeProps {
  formes: Forme[]
  forme: Forme | null
  onChange: (forme: Forme) => void
}

const LABELS: Record<Forme, string> = {
  injectable: 'Injectable',
  perOs: 'Per os / Sonde',
}

// Une molécule qui n'existe que sous une seule forme (ex. Adrénaline :
// injectable uniquement) ne doit pas imposer un choix inutile à
// l'utilisateur — le sélecteur ne s'affiche que s'il y a réellement
// quelque chose à choisir entre.
export default function SelecteurForme({ formes, forme, onChange }: ISelecteurFormeProps) {
  if (formes.length === 1) return null

  return (
    <div className="flex gap-2">
      {formes.map((valeur) => {
        const actif = forme === valeur
        return (
          <button
            key={valeur}
            type="button"
            onClick={() => onChange(valeur)}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm transition-colors duration-150"
            style={
              actif
                ? { backgroundColor: 'var(--onglet-actif)', color: 'var(--interactif)', fontWeight: 600 }
                : { backgroundColor: 'var(--onglet-inactif)' }
            }
          >
            <span className={actif ? '' : 'text-texte/70'}>{LABELS[valeur]}</span>
          </button>
        )
      })}
    </div>
  )
}
