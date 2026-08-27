import type { IFormePerOs } from '../../types'
import Ligne from './LigneDetail'

interface IDetailPerOsProps {
  donnees: IFormePerOs
}

function BadgeOuiNon({ valeur }: { valeur: boolean }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-semibold"
      // var(--fond) comme texte : toujours contrasté sur validation/alerte
      // saturés, dans les deux thèmes (voir BlocInfo pour le même principe).
      style={{ backgroundColor: valeur ? 'var(--validation)' : 'var(--alerte)', color: 'var(--fond)' }}
    >
      {valeur ? 'Oui' : 'Non'}
    </span>
  )
}

// null = information non applicable/inconnue pour cette fiche → la ligne
// correspondante ne s'affiche pas du tout (pas de "Non renseigné").
export default function DetailPerOs({ donnees }: IDetailPerOsProps) {
  return (
    <div className="flex flex-col">
      {donnees.ecrasable !== null && (
        <Ligne label="Écrasable" disposition="ligne">
          <BadgeOuiNon valeur={donnees.ecrasable} />
        </Ligne>
      )}
      {donnees.divisible !== null && (
        <Ligne label="Divisible" disposition="ligne">
          <BadgeOuiNon valeur={donnees.divisible} />
        </Ligne>
      )}
      {donnees.passageEnSonde !== null && (
        <Ligne label="Passage en sonde" disposition="ligne">
          <BadgeOuiNon valeur={donnees.passageEnSonde} />
        </Ligne>
      )}
      {donnees.modalitesSonde && (
        <Ligne label="Modalités sonde" disposition="ligne">
          <span className="text-right text-sm font-semibold text-texte">
            {donnees.modalitesSonde}
          </span>
        </Ligne>
      )}
      {donnees.notes && (
        <Ligne label="Notes" disposition="ligne">
          <span className="text-right text-sm font-normal italic text-texte-doux">
            {donnees.notes}
          </span>
        </Ligne>
      )}
    </div>
  )
}
