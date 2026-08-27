import SegmentedControl from '../layout/SegmentedControl'

export type Forme = 'injectable' | 'perOs'

interface ISelecteurFormeProps {
  formes: Forme[]
  forme: Forme
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
    <SegmentedControl
      options={formes.map((valeur) => ({ valeur, label: LABELS[valeur] }))}
      valeur={forme}
      onChange={onChange}
    />
  )
}
