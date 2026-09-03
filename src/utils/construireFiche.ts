import type { IFiche, IFicheSource, IFicheSourceIv, IFicheSourceOral, IFormeIv, IFormeOraleBloc, ISurveillance } from '../types'
import type { IFicheMeta } from '../data/categoriesFiches'

// Le DCI est publié en minuscules dans le JSON source (ex. "adrénaline") —
// l'app l'affiche capitalisé comme un nom clinique usuel.
function capitaliser(mot: string): string {
  return mot.length > 0 ? mot.charAt(0).toUpperCase() + mot.slice(1) : mot
}

// Plusieurs champs texte du JSON source sont des chaînes vides plutôt que
// `null` quand l'information ne s'applique pas (ex. commun.antidote: "" pour
// l'amoxicilline) — normalisé ici une seule fois plutôt que dans chaque
// composant d'affichage.
function videEnNull(valeur: string | null | undefined): string | null {
  return valeur && valeur.trim().length > 0 ? valeur : null
}

function construireIv(brut: IFicheSourceIv | undefined): IFormeIv | null {
  if (!brut) return null
  return {
    reconstitution: brut.reconstitution ?? null,
    preparation: brut.preparation ?? [],
    administration: {
      note_ajustement: videEnNull(brut.administration.note_ajustement),
      posologie: brut.administration.posologie,
    },
    incompatibilites: brut.incompatibilites,
  }
}

function construireOral(brut: IFicheSourceOral | undefined): IFormeOraleBloc | null {
  if (!brut) return null
  return {
    formes: brut.formes,
    recommandation_sonde: brut.recommandation_sonde ?? null,
  }
}

// Convertit une liste RCP (interactions, surveillance) en items
// titre/détail/conduite génériques, réutilisables tels quels par
// AccordeonImbrique — évite de faire porter à ce composant partagé la
// connaissance des champs spécifiques (effet/action_infirmier vs
// evenement/explication/action). `conduite` reste distincte de `detail`
// (plutôt que concaténée) pour être mise en évidence dans son propre encadré
// à l'affichage.
function versAccordeon<T>(items: T[], titre: (item: T) => string, detail: (item: T) => string, conduite: (item: T) => string): ISurveillance[] {
  return items.map((item) => ({ titre: titre(item), detail: detail(item), conduite: conduite(item) }))
}

// `source_rcp` existe sur chaque entrée de interactions_pertinentes et
// surveillance_specifique mais n'est jamais affiché (citation de sourcing
// interne, pas une information clinique utile au geste infirmier) — les
// deux mappings ci-dessous l'ignorent volontairement.

/** Assemble une IFiche affichable à partir du JSON brut d'un fichier
 * public/data/<id>.json et de sa métadonnée de classement. Le contenu de
 * `brut` n'est jamais modifié, seulement lu et réorganisé. */
export function construireFiche(id: string, brut: IFicheSource, meta: IFicheMeta): IFiche {
  return {
    id,
    dci: capitaliser(brut.dci),
    categorie: meta.categorie,
    sousFamille: meta.sousFamille,
    famille: brut.commun.famille,
    nomsCommerciaux: brut.commun.noms_commerciaux,
    antidote: videEnNull(brut.commun.antidote),
    indications: brut.commun.indications,
    // Schéma v2 : contre_indications/interactions_pertinentes/
    // surveillance_specifique/pictogrammes vivent dans `commun`, pas `iv` —
    // toujours lus, jamais conditionnés à la présence d'une forme
    // injectable, pour qu'une molécule sans iv (ex. orale seule) ne perde
    // jamais silencieusement ses précautions.
    contreIndications: brut.commun.contre_indications,
    grossesseAllaitement: brut.commun.grossesse_allaitement,
    surveillanceSpecifique: versAccordeon(
      brut.commun.surveillance_specifique,
      (item) => item.evenement,
      (item) => item.explication,
      (item) => item.action,
    ),
    interactionsMedicamenteuses: versAccordeon(
      brut.commun.interactions_pertinentes,
      (item) => item.substance,
      (item) => item.effet,
      (item) => item.action_infirmier,
    ),
    pictogrammes: brut.commun.pictogrammes,
    iv: construireIv(brut.iv),
    oral: construireOral(brut.oral),
    rcpSource: brut.tracabilite.rcp_source,
    statut: brut.tracabilite.statut,
    dateRevision: brut.tracabilite.validation.date,
    perimetreValidation: brut.tracabilite.validation.perimetre,
    prochaineRevision: videEnNull(brut.tracabilite.validation.prochaine_revision ?? null),
  }
}
