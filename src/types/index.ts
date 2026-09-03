// Types métier de Bolus. Une "fiche" décrit un médicament : ses infos
// générales, sa forme injectable (iv), sa forme orale (oral), et les points
// de surveillance infirmière associés.
//
// Ces types suivent d'assez près le schéma des fichiers JSON de
// public/data/*.json (voir un fichier comme adrenaline.json) : ce sont des
// données cliniques structurées par DCI, extraites de RCP, et leur contenu
// ne doit jamais être modifié depuis le code de l'app. Les champs manquants
// dans ce schéma (id, categorie, sousFamille) sont ajoutés à la volée par
// src/utils/construireFiche.ts à partir de src/data/categoriesFiches.ts.
//
// Convention : les types qui reflètent directement une clé du JSON source
// gardent son casing snake_case (ex. dose_par_prise_mg, note_ajustement)
// plutôt que d'être renommés en camelCase — cela évite une couche de
// traduction supplémentaire pour des structures déjà profondément
// imbriquées. Seuls les champs ajoutés par l'app (id, categorie,
// sousFamille, famille) et les champs de haut niveau déjà existants avant
// cette migration (nomsCommerciaux, grossesseAllaitement...) restent en
// camelCase, conformément aux conventions déjà en usage dans le reste du
// code TypeScript de l'app.

/** Populations couvertes par une ligne de posologie. Seul "adulte" est
 * affiché pour le moment (voir SectionPosologies) ; "pediatrie" reste
 * stocké pour une version ultérieure. */
export type IPopulationType = 'adulte' | 'pediatrie'

/** Une ligne de posologie telle qu'extraite d'un RCP. Les différents champs
 * de dose/intervalle sont mutuellement exclusifs selon la façon dont le RCP
 * exprime la posologie (dose fixe, fourchette, par kg, par kg et par jour,
 * en µg/kg/min...) — voir src/utils/posologie.ts pour la mise en forme. */
export interface IPosologieRcp {
  population: string
  population_type?: IPopulationType
  /** Regroupement indicatif (ex. "generale", "im", "sc", "pse", "speciale")
   * — sert à grouper les lignes par voie/protocole dans l'affichage, voir
   * libelleCategoriePosologie(). */
  categorie?: string
  /** Distingue plusieurs paliers d'une même forme galénique orale (ex.
   * amoxicilline gélule : "Standard" / "Renforcé") — pas affiché, déjà
   * redondant avec le texte de `population` ("Infections standard",
   * "posologie renforcée"). */
  palier?: string
  dose_par_prise_mg?: number
  dose_par_prise_mg_min?: number
  dose_par_prise_mg_max?: number
  dose_mg_kg_min?: number
  dose_mg_kg_max?: number
  dose_journaliere_mg_kg_min?: number
  dose_journaliere_mg_kg_max?: number
  dose_journaliere_max_g?: number
  dose_max_par_prise_g?: number
  dose_ugkgmin_min?: number
  dose_ugkgmin_max?: number
  intervalle_min_h?: number
  intervalle_max_h?: number
  intervalle_min_min?: number
  intervalle_max_min?: number
  nb_prises_min_24h?: number
  nb_prises_max_24h?: number
  age_min_mois?: number | null
  age_max_mois?: number | null
  poids_min_kg?: number | null
  poids_max_kg?: number | null
  /** Surveillance du taux sanguin résiduel requise (jamais affiché comme
   * sigle brut, voir mention dans SectionPosologies). */
  tdm_requis?: boolean
}

/** Incompatibilité physico-chimique en Y (perfusions IV). */
export interface IIncompatibilite {
  substance: string
  niveau: string
}

/** Interaction médicamenteuse pertinente pour le geste infirmier.
 * `source_rcp` existe dans le JSON source mais n'est pas affiché (citation
 * de sourcing interne, pas une donnée clinique) — voir construireFiche(). */
export interface IInteractionRcp {
  substance: string
  effet: string
  action_infirmier: string
  source_rcp?: string
}

/** Point de surveillance clinique spécifique, tel que structuré dans le
 * bloc "iv" des fichiers sources. `source_rcp` existe dans le JSON source
 * mais n'est pas affiché, voir IInteractionRcp ci-dessus. */
export interface ISurveillanceRcp {
  evenement: string
  explication: string
  action: string
  source_rcp?: string
}

/** Une étape de préparation avant administration, pour une voie donnée
 * (ex. IVD, IVL, IM, SC, PSE, PERF). Un même médicament peut avoir plusieurs
 * entrées (une par voie utilisable). */
export interface IPreparationVoie {
  voie: string
  detail: string
  duree?: string | null
  stabilite?: string | null
  /** Précision de contexte (ex. "néonatologie", "état de mal épileptique"). */
  contexte?: string
}

/** Reconstitution d'une poudre avant dilution/injection (ex. amoxicilline,
 * vancomycine). Absente (null) pour les solutions déjà prêtes à l'emploi. */
export interface IReconstitution {
  solvant?: string
  volume_par_500mg_mL?: number
  volume_par_1000mg_mL?: number
  volume_par_2000mg_mL?: number
  stabilite_avant_dilution?: string
}

/** Grossesse et allaitement — contenu fixe (pas une liste dépliable comme
 * surveillanceSpecifique/interactionsMedicamenteuses). */
export interface IGrossesseAllaitementRcp {
  grossesse: string
  allaitement: string
  url_crat_grossesse?: string | null
  url_crat_allaitement?: string | null
  /** Pas affiché — voir note_statut/source_rcp pour la même convention. */
  source?: string
}

/** Une forme galénique orale disponible (comprimé, gélule, suspension...),
 * avec sa sécabilité/ouvrabilité (voir DetailPerOs) et sa posologie
 * adulte/pédiatrique. */
export interface IFormeOraleRcp {
  type: string
  dosage?: string
  secable?: boolean
  ouverture_gelule?: boolean | null
  posologie_adulte: IPosologieRcp[]
}

/** Forme à privilégier en cas d'administration par sonde d'alimentation,
 * comparée entre les formes disponibles de la fiche (voir DetailPerOs). */
export interface IRecommandationSonde {
  forme_preferee: string
  /** Chaîne vide quand aucune alternative crédible n'existe (ex.
   * vancomycine, une seule forme orale) — traité comme absent à
   * l'affichage. */
  alternative?: string
}

/** Référence RCP consultée pour construire la fiche. `note_statut` peut
 * exister dans le JSON source (annotation ponctuelle sur le statut de
 * commercialisation) mais n'est pas affiché, comme les autres champs
 * "note"/"source_rcp" — voir construireFiche(). */
export interface IRcpSource {
  specialite: string
  titulaire?: string
  date_maj?: string
  url_ansm?: string
  note_statut?: string
}

/** Traçabilité de la validation clinique de la fiche. */
export interface IValidationRcp {
  date: string
  validateur?: string
  perimetre: string[]
  prochaine_revision?: string
}

/** Détails d'administration par voie injectable (IV, IM, SC, PSE...). */
export interface IFormeIv {
  reconstitution: IReconstitution | null
  preparation: IPreparationVoie[]
  administration: {
    note_ajustement: string | null
    posologie: IPosologieRcp[]
  }
  incompatibilites: IIncompatibilite[]
  pictogrammes: string[]
}

/** Détails d'administration par voie orale — une ou plusieurs formes
 * galéniques, chacune avec sa propre posologie. */
export interface IFormeOraleBloc {
  formes: IFormeOraleRcp[]
  recommandation_sonde: IRecommandationSonde | null
}

/** Item générique pour les listes dépliables de la zone Précautions
 * (surveillance spécifique, interactions médicamenteuses) — voir
 * AccordeonImbrique. `conduite` est gardée distincte de `detail` (plutôt que
 * concaténée dedans) pour pouvoir la mettre en évidence visuellement dans un
 * encadré séparé, l'information la plus actionnable pour le geste
 * infirmier. */
export interface ISurveillance {
  titre: string
  detail: string
  conduite?: string
}

/** Fiche médicament complète, unité de données centrale de l'app — assemblée
 * par construireFiche() à partir d'un fichier public/data/<id>.json et de sa
 * métadonnée de classement (src/data/categoriesFiches.ts). */
export interface IFiche {
  /** Nom du fichier JSON sans extension (ex. "adrenaline"). */
  id: string
  dci: string
  /** Slug de la catégorie (voir ICategorie.slug) — absent du JSON source,
   * fourni par categoriesFiches.ts. */
  categorie: string
  /** Sous-famille au sens de ICategorie.sousFamilles — absente du JSON
   * source, fournie par categoriesFiches.ts. Sert au classement (voir
   * ListeCategorie), distincte de `famille`, affichée telle quelle sur la
   * fiche. */
  sousFamille: string
  /** Classe pharmacothérapeutique complète telle que rédigée dans le RCP
   * (commun.famille) — affichée en tête de fiche (voir FicheMedicament). */
  famille: string
  nomsCommerciaux: string[]
  antidote: string | null
  indications: string[]
  /** Contre-indications de la molécule — proviennent de iv.contre_indications
   * dans le JSON source (seul endroit où le schéma les documente) mais
   * s'appliquent à la fiche entière, affichées indépendamment de la forme
   * choisie. */
  contreIndications: string[]
  grossesseAllaitement: IGrossesseAllaitementRcp | null
  /** Provient de iv.surveillance_specifique — s'applique à la fiche entière,
   * affiché indépendamment de la forme choisie. */
  surveillanceSpecifique: ISurveillance[]
  /** Provient de iv.interactions_pertinentes — null si la fiche n'a pas de
   * forme injectable. */
  interactionsMedicamenteuses: ISurveillance[] | null
  iv: IFormeIv | null
  oral: IFormeOraleBloc | null
  rcpSource: IRcpSource[]
  statut: string
  dateRevision: string
  perimetreValidation: string[]
  prochaineRevision: string | null
}

// --- Schéma source (public/data/*.json) --------------------------------
// Reflète le JSON tel que publié, avant l'ajout de id/categorie/sousFamille.
// Ce contenu ne doit jamais être modifié par l'app (voir CLAUDE.md du
// dossier public/data) — construireFiche() le lit uniquement.

export interface IFicheSourceCommun {
  noms_commerciaux: string[]
  famille: string
  /** Chaîne vide quand le RCP ne documente aucun antidote — convertie en
   * `null` par construireFiche(). */
  antidote: string
  indications: string[]
  grossesse_allaitement: IGrossesseAllaitementRcp | null
}

export interface IFicheSourceIv {
  reconstitution: IReconstitution | null
  preparation?: IPreparationVoie[]
  administration: {
    note_ajustement?: string
    posologie: IPosologieRcp[]
  }
  incompatibilites: IIncompatibilite[]
  interactions_pertinentes: IInteractionRcp[]
  contre_indications: string[]
  surveillance_specifique: ISurveillanceRcp[]
  pictogrammes: string[]
}

export interface IFicheSourceOral {
  formes: IFormeOraleRcp[]
  recommandation_sonde?: IRecommandationSonde
}

export interface IFicheSourceTracabilite {
  rcp_source: IRcpSource[]
  statut: string
  // extraction_log existe dans le JSON mais n'est jamais lu ni affiché :
  // c'est un journal d'extraction interne, pas une donnée clinique.
  validation: IValidationRcp
}

/** Forme brute d'un fichier public/data/<id>.json, avant enrichissement. */
export interface IFicheSource {
  dci: string
  commun: IFicheSourceCommun
  iv?: IFicheSourceIv
  oral?: IFicheSourceOral
  tracabilite: IFicheSourceTracabilite
}

/** Catégorie thérapeutique servant à classer et filtrer les fiches. */
export interface ICategorie {
  slug: string
  label: string
  sousFamilles: string[]
  /** Couleur de base saturée (voir CategorieCard pour son usage réel : les
   * cartes ne l'appliquent jamais en fond plein, seulement via color-mix()
   * pour un fond pâle teinté, ou pour le code deux lettres). */
  couleur: string
  /** Code deux lettres affiché sur les cartes (ex. "AI"), dans la couleur
   * saturée de la catégorie. */
  code: string
}
