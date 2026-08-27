import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import BlocInfo from '../components/fiches/BlocInfo'
import ListeSeparee from '../components/fiches/ListeSeparee'
import SelecteurForme from '../components/fiches/SelecteurForme'
import type { Forme } from '../components/fiches/SelecteurForme'
import DetailInjectable from '../components/fiches/DetailInjectable'
import DetailPerOs from '../components/fiches/DetailPerOs'
import SurveillanceAccordeon from '../components/fiches/SurveillanceAccordeon'
import SourcesFiche from '../components/fiches/SourcesFiche'
import { useFiche } from '../hooks/useFiche'
import { enregistrerConsultation } from '../utils/historique'

function EcranChargementFiche() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <h1 className="sr-only">Chargement de la fiche</h1>
      <span
        className="h-8 w-8 animate-spin rounded-full border-4 border-accent-clair border-t-interactif"
        role="status"
        aria-label="Chargement"
      />
    </div>
  )
}

function FicheIntrouvable() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="sr-only">Fiche introuvable</h1>
      <p className="text-sm text-texte/70">
        Cette fiche médicament est introuvable ou n'est plus disponible.
      </p>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="rounded-lg bg-interactif px-5 py-3 text-sm font-medium text-surface"
      >
        Retour
      </button>
    </div>
  )
}

export default function FicheMedicament() {
  const { id = '' } = useParams()
  const { fiche, loading } = useFiche(id)

  // Seul le CHOIX explicite de l'utilisateur est un état ; la forme
  // réellement affichée est dérivée, pas synchronisée via un effet.
  const [formeChoisie, setFormeChoisie] = useState<Forme | null>(null)

  const formesDisponibles = useMemo<Forme[]>(() => {
    if (!fiche) return []
    const formes: Forme[] = []
    if (fiche.injectable) formes.push('injectable')
    if (fiche.perOsSonde) formes.push('perOs')
    return formes
  }, [fiche])

  // Si le choix précédent ne correspond plus aux formes disponibles (ex.
  // React Router réutilise cette même instance en passant d'une fiche
  // injectable-only à une fiche per-os-only sans démonter le composant),
  // on retombe automatiquement sur la première forme disponible plutôt que
  // de figer sur un onglet qui n'existe plus — jamais de carte vide.
  const formeActive =
    formeChoisie && formesDisponibles.includes(formeChoisie) ? formeChoisie : (formesDisponibles[0] ?? null)

  // Alimente l'historique affiché sur la page Recherche. useFiche()
  // s'appuie sur useLiveQuery, qui ne relit vraiment la table "fiches" que
  // si elle est réécrite (resynchronisation CDN) — pas à chaque render :
  // dépendre de l'objet fiche entier ne réenregistre donc pas la
  // consultation en boucle.
  useEffect(() => {
    if (fiche) enregistrerConsultation(fiche.id)
  }, [fiche])

  if (loading) {
    return (
      <div>
        <Header variant="retour" />
        <EcranChargementFiche />
      </div>
    )
  }

  if (!fiche) {
    return (
      <div>
        <Header variant="retour" />
        <FicheIntrouvable />
      </div>
    )
  }

  const antidotePresent = fiche.antidote !== null
  const contreIndicationsPresentes = fiche.contreIndications.length > 0

  return (
    <div className="flex flex-col pb-6">
      <Header variant="retour" />

      {/* Identité */}
      <div className="flex flex-col gap-1 px-6 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          {fiche.sousFamille}
        </p>
        <h1 className="font-display text-[2.5rem] leading-tight text-texte">{fiche.dci}</h1>
        {fiche.nomsCommerciaux.length > 0 && (
          <div className="text-sm text-texte-doux">
            <ListeSeparee items={fiche.nomsCommerciaux} />
          </div>
        )}
      </div>

      {/* Grille antidote / contre-indications */}
      {(antidotePresent || contreIndicationsPresentes) && (
        <div className="mt-6 grid grid-cols-2 gap-3 px-6">
          {antidotePresent && (
            <div className={contreIndicationsPresentes ? '' : 'col-span-2'}>
              <BlocInfo variant="validation" label="Antidote">
                {fiche.antidote}
              </BlocInfo>
            </div>
          )}
          {contreIndicationsPresentes && (
            <div className={antidotePresent ? '' : 'col-span-2'}>
              <BlocInfo variant="alerte" label="Contre-indications">
                <ListeSeparee items={fiche.contreIndications} />
              </BlocInfo>
            </div>
          )}
        </div>
      )}

      {/* Indications */}
      {fiche.indications.length > 0 && (
        <div className="mt-3 px-6">
          <BlocInfo variant="indication" label="Indications">
            <ListeSeparee items={fiche.indications} />
          </BlocInfo>
        </div>
      )}

      {/* Carte des formes d'administration */}
      {formesDisponibles.length > 0 && formeActive !== null && (
        <div className="mt-6 w-full rounded-t-2xl bg-surface p-6">
          <SelecteurForme
            formes={formesDisponibles}
            forme={formeActive}
            onChange={setFormeChoisie}
          />
          <div className={formesDisponibles.length > 1 ? 'mt-4' : ''}>
            {formeActive === 'injectable' && fiche.injectable && (
              <DetailInjectable donnees={fiche.injectable} />
            )}
            {formeActive === 'perOs' && fiche.perOsSonde && (
              <DetailPerOs donnees={fiche.perOsSonde} />
            )}
          </div>
        </div>
      )}

      <SurveillanceAccordeon items={fiche.surveillanceSpecifique} />

      {/* Compatibilités */}
      {(fiche.compatibilitesMajeures.length > 0 ||
        fiche.incompatibilitesAbsolues.length > 0) && (
        <div className="mt-6 flex flex-col gap-3 px-6">
          {fiche.compatibilitesMajeures.length > 0 && (
            <BlocInfo variant="validation" label="Compatibilités">
              <ListeSeparee items={fiche.compatibilitesMajeures} />
            </BlocInfo>
          )}
          {fiche.incompatibilitesAbsolues.length > 0 && (
            <BlocInfo variant="alerte" label="Incompatibilités absolues">
              <ListeSeparee items={fiche.incompatibilitesAbsolues} />
            </BlocInfo>
          )}
        </div>
      )}

      <div className="mt-6 px-6">
        <SourcesFiche sources={fiche.sourcesRcp} dateRevision={fiche.dateRevision} />
      </div>
    </div>
  )
}
