import type { IFormeInjectable } from '../../types'
import Ligne from './LigneDetail'
import BlocAvertissement from '../layout/BlocAvertissement'
import SectionPosologies from './SectionPosologies'
import TitreSectionFiche from './TitreSectionFiche'

interface IDetailInjectableProps {
  donnees: IFormeInjectable
}

// Les champs null n'existent tout simplement pas pour cette fiche (ex. pas
// de débit en gouttes/min pour une perfusion en PSE) — on ne les affiche
// pas du tout, plutôt qu'un "Non renseigné" qui suggérerait une donnée
// manquante à compléter.
export default function DetailInjectable({ donnees }: IDetailInjectableProps) {
  return (
    <div className="flex flex-col">
      {donnees.preparation ? (
        <div>
          <TitreSectionFiche>Préparation</TitreSectionFiche>
          <div
            className="rounded-xl p-3.5"
            style={{ backgroundColor: 'color-mix(in srgb, var(--texte) 5%, var(--fond))' }}
          >
            <div className="mb-2.5 flex items-center gap-2">
              <span
                className="rounded-md px-2 py-1 text-[10px] font-semibold"
                style={{ backgroundColor: 'var(--texte)', color: 'var(--fond)' }}
              >
                {donnees.preparation.badge}
              </span>
              <span className="text-[11.5px] font-semibold text-texte">{donnees.preparation.duree}</span>
            </div>
            <p className="text-xs leading-relaxed text-texte">{donnees.preparation.description}</p>
            {donnees.preparation.stabilite && (
              <p className="mt-2.5 border-t border-texte/10 pt-2 text-[11px] leading-relaxed text-texte-doux">
                <b className="font-semibold">Stabilité</b> · {donnees.preparation.stabilite}
              </p>
            )}
          </div>
        </div>
      ) : (
        // Repli pour les fiches qui n'ont pas encore de bloc "préparation"
        // structuré : l'ancien affichage (solvant, débit, voies) reste
        // fonctionnel telle quelle.
        <>
          <Ligne label="Solvant">{donnees.solvant}</Ligne>
          <Ligne label="Volume de dilution">{donnees.volumeDilution}</Ligne>
          <Ligne label="Voies d'administration">
            <span className="flex flex-wrap gap-1.5">
              {donnees.voies.map((voie) => (
                <span
                  key={voie}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  // Dosé depuis --fiche-forme-fond (le fond réel de cette
                  // carte), pas --onglet-inactif directement : les deux se
                  // sont un jour retrouvées strictement identiques en
                  // sombre, rendant ce badge invisible (voir le même
                  // correctif sur BadgeEtat dans DetailPerOs.tsx).
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--texte) 15%, var(--fiche-forme-fond))',
                    color: 'var(--texte)',
                  }}
                >
                  {voie}
                </span>
              ))}
            </span>
          </Ligne>
          {donnees.debitMlH && <Ligne label="Débit (ml/h)">{donnees.debitMlH}</Ligne>}
          {donnees.gouttesMin && <Ligne label="Débit (gouttes/min)">{donnees.gouttesMin}</Ligne>}
          {donnees.dureeAdministration && (
            <Ligne label="Durée d'administration">{donnees.dureeAdministration}</Ligne>
          )}
          {donnees.notes && (
            <Ligne label="Notes">
              <span className="font-normal italic text-texte-doux">{donnees.notes}</span>
            </Ligne>
          )}
        </>
      )}

      {donnees.incompatibiliteY && donnees.incompatibiliteY.length > 0 && (
        <div className="mt-5">
          <BlocAvertissement couleur="var(--alerte)">
            <div>
              <p
                className="mb-1 text-[9.5px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--alerte)' }}
              >
                Incompatible en Y
              </p>
              <p className="text-[12.5px] leading-relaxed text-texte">{donnees.incompatibiliteY.join(' · ')}</p>
            </div>
          </BlocAvertissement>
        </div>
      )}

      {donnees.posologies && donnees.posologies.length > 0 && (
        <SectionPosologies
          titre="Posologies"
          posologies={donnees.posologies}
          ajustementPosologique={donnees.ajustementPosologique}
        />
      )}
    </div>
  )
}
