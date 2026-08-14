import type { ReactNode } from 'react'
import type { IFormeInjectble } from '../../types'

interface IDetailInjectableProps {
  donnees: IFormeInjectble
}

// Paire libellé / valeur avec séparateur fin. last:border-b-0 retire le
// séparateur de la dernière ligne réellement affichée — les champs
// optionnels (debitMlH, notes...) sont rendus conditionnellement, donc
// "la dernière ligne" varie d'une fiche à l'autre.
function Ligne({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-texte/10 py-3 last:border-b-0">
      <span className="text-xs text-texte-doux">{label}</span>
      <span className="text-sm font-semibold text-texte">{children}</span>
    </div>
  )
}

// Les champs null n'existent tout simplement pas pour cette fiche (ex. pas
// de débit en gouttes/min pour une perfusion en PSE) — on ne les affiche
// pas du tout, plutôt qu'un "Non renseigné" qui suggérerait une donnée
// manquante à compléter.
export default function DetailInjectable({ donnees }: IDetailInjectableProps) {
  return (
    <div className="flex flex-col">
      <Ligne label="Solvant">{donnees.solvant}</Ligne>
      <Ligne label="Volume de dilution">{donnees.volumeDilution}</Ligne>
      <Ligne label="Voies d'administration">
        <span className="flex flex-wrap gap-1.5">
          {donnees.voies.map((voie) => (
            <span
              key={voie}
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: 'var(--onglet-inactif)', color: 'var(--texte)' }}
            >
              {voie}
            </span>
          ))}
        </span>
      </Ligne>
      {donnees.debitMlH && <Ligne label="Débit (ml/h)">{donnees.debitMlH}</Ligne>}
      {donnees.goutttesMin && <Ligne label="Débit (gouttes/min)">{donnees.goutttesMin}</Ligne>}
      {donnees.dureeAdministration && (
        <Ligne label="Durée d'administration">{donnees.dureeAdministration}</Ligne>
      )}
      {donnees.notes && (
        <Ligne label="Notes">
          <span className="font-normal italic text-texte-doux">{donnees.notes}</span>
        </Ligne>
      )}
    </div>
  )
}
