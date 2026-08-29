import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import BlocInfo from '../components/fiches/BlocInfo'
import ListeSeparee from '../components/fiches/ListeSeparee'
import SelecteurForme from '../components/fiches/SelecteurForme'
import type { Forme } from '../components/fiches/SelecteurForme'
import DetailInjectable from '../components/fiches/DetailInjectable'
import DetailPerOs from '../components/fiches/DetailPerOs'
import PrecautionsFiche from '../components/fiches/PrecautionsFiche'
import BoutonFavori from '../components/fiches/BoutonFavori'
import BoutonPrimaire from '../components/layout/BoutonPrimaire'
import { useFiche } from '../hooks/useFiche'
import { useFavoris } from '../hooks/useFavoris'
import { enregistrerConsultation } from '../utils/historique'
import { TAILLE_MAX_FAVORIS } from '../utils/favoris'

// Squelette plutôt qu'un spinner : des blocs approximant la mise en page
// réelle (titre, cartes, bloc de forme) donnent une impression de chargement
// plus rapide qu'une simple roue qui tourne, en laissant deviner la
// structure à venir. Le pouls (voir .squelette dans index.css) respecte
// prefers-reduced-motion.
function EcranChargementFiche() {
  return (
    <div className="flex flex-col gap-6 px-6 pt-2" role="status" aria-label="Chargement de la fiche">
      <h1 className="sr-only">Chargement de la fiche</h1>
      <div className="flex flex-col gap-2">
        <div className="squelette h-3 w-24 rounded-full" />
        <div className="squelette h-10 w-3/4 rounded-lg" />
        <div className="squelette h-4 w-1/2 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="squelette h-20 rounded-xl" />
        <div className="squelette h-20 rounded-xl" />
      </div>
      <div className="squelette h-16 rounded-xl" />
      <div className="squelette h-48 rounded-2xl" />
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
      <BoutonPrimaire onClick={() => navigate(-1)}>Retour</BoutonPrimaire>
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

  // Une seule forme possible : rien à choisir, on l'affiche directement
  // (SelecteurForme ne se montre d'ailleurs pas dans ce cas). Deux formes ou
  // plus : on laisse volontairement le sélecteur sans forme active tant que
  // l'utilisateur n'a pas cliqué — présélectionner "Injectable" par défaut
  // suggérerait à tort que c'est la voie recommandée, alors que le choix
  // dépend du contexte clinique. Si le choix précédent ne correspond plus
  // aux formes disponibles (ex. React Router réutilise cette même instance
  // en passant d'une fiche injectable-only à une fiche per-os-only sans
  // démonter le composant), on retombe sur "aucune forme" plutôt que de
  // figer sur un onglet qui n'existe plus.
  const formeActive =
    formesDisponibles.length <= 1
      ? (formesDisponibles[0] ?? null)
      : formeChoisie && formesDisponibles.includes(formeChoisie)
        ? formeChoisie
        : null

  const { favoris, basculer } = useFavoris()
  const [favoriBloque, setFavoriBloque] = useState(false)

  // Le message d'avertissement (limite de 3 atteinte) se referme tout seul
  // plutôt que d'exiger un geste supplémentaire pour le fermer.
  useEffect(() => {
    if (!favoriBloque) return
    const minuteur = setTimeout(() => setFavoriBloque(false), 4000)
    return () => clearTimeout(minuteur)
  }, [favoriBloque])

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
    // flex-1 (pas juste flex-col) : PrecautionsFiche, dernier bloc de la
    // page, s'étire lui aussi en flex-1 pour que son fond teinté rejoigne
    // toujours le bas de l'écran, même sur une fiche courte — plutôt qu'un
    // padding-bottom fixe qui laisserait un bandeau de fond nu en dessous.
    <div className="flex flex-1 flex-col">
      <Header variant="retour" />

      {/* Identité */}
      <div className="flex flex-col gap-1 px-6 pt-2">
        <div className="-mr-2.5 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {fiche.sousFamille}
          </p>
          <BoutonFavori
            actif={favoris.includes(fiche.id)}
            onClick={async () => setFavoriBloque(await basculer(fiche.id))}
          />
        </div>
        <h1 className="font-display text-[2.5rem] leading-tight text-texte">{fiche.dci}</h1>
        {fiche.nomsCommerciaux.length > 0 && (
          <div className="text-sm text-texte-doux">
            <ListeSeparee items={fiche.nomsCommerciaux} />
          </div>
        )}
        {favoriBloque && (
          <p className="text-xs" style={{ color: 'var(--alerte)' }}>
            Déjà {TAILLE_MAX_FAVORIS} favoris — retirez-en un avant d'en ajouter un nouveau.
          </p>
        )}
      </div>

      {/* Grille antidote / contre-indications : l'antidote s'ajuste à son
          contenu (souvent un seul nom court) plutôt que de forcer un
          partage strict 50/50, qui l'étirerait inutilement sur toute la
          moitié de l'écran. */}
      {(antidotePresent || contreIndicationsPresentes) && (
        <div className="mt-6 flex items-stretch gap-3 px-6">
          {antidotePresent && (
            <div className="shrink-0 whitespace-nowrap">
              <BlocInfo variant="validation" label="Antidote">
                {fiche.antidote}
              </BlocInfo>
            </div>
          )}
          {contreIndicationsPresentes && (
            <div className="min-w-0 flex-1">
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

      {/* Carte des formes d'administration : fond dédié (--fiche-forme-fond,
          voir index.css), pas bg-surface — pour rester nettement distincte
          du reste de la page plutôt que de s'y fondre. */}
      {formesDisponibles.length > 0 && (
        <div
          className="mt-6 w-full rounded-t-2xl p-6"
          style={{ backgroundColor: 'var(--fiche-forme-fond)' }}
        >
          {formesDisponibles.length > 1 && (
            <SelecteurForme
              formes={formesDisponibles}
              forme={formeActive}
              // Recliquer la forme déjà active la désélectionne (retour au
              // placeholder) plutôt que de rester figée dessus sans échappatoire.
              onChange={(forme) => setFormeChoisie(forme === formeActive ? null : forme)}
            />
          )}
          <div className={formesDisponibles.length > 1 ? 'mt-4' : ''}>
            {formeActive === null && (
              <p className="px-2.5 py-4 text-center text-[13px] italic text-texte-doux/70">
                Sélectionnez une forme d'administration ci-dessus
              </p>
            )}
            {formeActive === 'injectable' && fiche.injectable && (
              <DetailInjectable donnees={fiche.injectable} />
            )}
            {formeActive === 'perOs' && fiche.perOsSonde && (
              <DetailPerOs donnees={fiche.perOsSonde} />
            )}
          </div>
        </div>
      )}

      <PrecautionsFiche
        surveillanceSpecifique={fiche.surveillanceSpecifique}
        interactionsMedicamenteuses={fiche.interactionsMedicamenteuses}
        grossesseAllaitement={fiche.grossesseAllaitement}
        sourcesRcp={fiche.sourcesRcp}
        dateRevision={fiche.dateRevision}
      />
    </div>
  )
}
