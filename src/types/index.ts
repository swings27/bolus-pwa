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
// gardent son casing snake_case (ex. dose_par_prise_mg_min, note_ajustement)
// plutôt que d'être renommés en camelCase — cela évite une couche de
// traduction supplémentaire pour des structures déjà profondément
// imbriquées. Seuls les champs ajoutés par l'app (id, categorie,
// sousFamille, famille) et les champs de haut niveau déjà existants avant
// cette migration (nomsCommerciaux, grossesseAllaitement...) restent en
// camelCase, conformément aux conventions déjà en usage dans le reste du
// code TypeScript de l'app.

/** Populations couvertes par une ligne de posologie. Seul "pediatrie" est
 * filtré pour le moment (voir SectionPosologies) ; "mixte" (ex. tranche
 * d'âge/poids qui chevauche petits enfants et adultes) reste donc visible,
 * comme "adulte". */
export type IPopulationType = 'adulte' | 'pediatrie' | 'mixte'

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
  /** Toujours une paire min/max, même pour une dose fixe (les deux bornes
   * portent alors la même valeur) — pas de forme scalaire. */
  dose_par_prise_mg_min?: number
  dose_par_prise_mg_max?: number
  /** Dose par prise directement en grammes plutôt qu'en mg (ex. fosfomycine,
   * dosée en g dès l'adulte) — même rang de priorité que la paire en mg
   * ci-dessus, voir formaterDose()/formaterDoseAbsolue(). */
  dose_par_prise_g_min?: number
  dose_par_prise_g_max?: number
  /** Dose par prise en microgrammes (ex. sufentanil, dosé en µg jusqu'en
   * péridurale) — même rang que les paires en mg et en g ci-dessus. */
  dose_par_prise_ug_min?: number
  dose_par_prise_ug_max?: number
  dose_mg_kg_min?: number
  dose_mg_kg_max?: number
  /** Dose par prise rapportée au poids, en microgrammes (ex. sufentanil,
   * 0,1-2 µg/kg à l'induction). À NE PAS confondre avec
   * dose_ug_kg_minute_* plus bas, qui est un DÉBIT (µg/kg/min) : ici la
   * valeur est une dose ponctuelle, là-bas une vitesse d'administration. */
  dose_ug_kg_min?: number
  dose_ug_kg_max?: number
  dose_journaliere_mg_kg_min?: number
  dose_journaliere_mg_kg_max?: number
  /** Number la plupart du temps, mais le RCP ne donne pas toujours un
   * plafond chiffré — particulièrement en pédiatrie, où le maximum
   * journalier dépend du poids de l'enfant plutôt que d'être une valeur
   * fixe ("Selon poids", "Pas de maximum journalier établi"...). Une
   * chaîne est affichée telle quelle par formaterMax(), sans tenter la
   * conversion g→mg qui ne s'applique qu'à un nombre. Même raison pour
   * dose_max_par_prise_g et dose_journaliere_max_MUI ci-dessous. */
  dose_journaliere_max_g?: number | string
  /** Maximum journalier déjà exprimé en mg par le RCP (ex. midazolam,
   * 7,5 mg/j) — affiché tel quel, sans la règle g↔mg de
   * dose_journaliere_max_g, qui ne concerne que les valeurs en grammes. */
  dose_journaliere_max_mg?: number | string
  /** Maximum journalier en microgrammes (ex. sufentanil sublingual,
   * 720 µg/j) — affiché tel quel, aucune conversion vers les mg. */
  dose_journaliere_max_ug?: number | string
  /** Maximum journalier rapporté au poids (ex. kétamine, 5 mg/kg/j) —
   * affiché tel quel en mg/kg/j, jamais converti en mg ou g absolus : sans
   * le poids du patient, la conversion n'a pas de sens. */
  dose_mg_kg_j_max?: number | string
  dose_max_par_prise_g?: number | string
  /** Débits de perfusion continue (PSE), une unité par molécule selon la
   * formulation du RCP : µg/kg/min (adrénaline), mg/kg/h (kétamine),
   * UI/kg/h (héparine sodique) et mg/h non rapporté au poids
   * (nicardipine). Affichés tels quels par formaterDose(), sans conversion
   * de l'un vers l'autre — c'est sous cette forme que le débit est réglé au
   * pousse-seringue. */
  dose_ug_kg_minute_min?: number
  dose_ug_kg_minute_max?: number
  dose_mg_kg_h_min?: number
  dose_mg_kg_h_max?: number
  /** Débit en microgrammes par kilo et par heure (ex. sufentanil en
   * sédation prolongée, 0,2-2 µg/kg/h). */
  dose_ug_kg_h_min?: number
  dose_ug_kg_h_max?: number
  dose_UI_kg_h_min?: number
  dose_UI_kg_h_max?: number
  dose_mg_h_min?: number
  dose_mg_h_max?: number
  /** MUI = millions d'unités internationales (ex. spiramycine) — même
   * famille que dose_par_prise_mg(_min/_max)/dose_journaliere_max_g, en
   * unité différente. */
  dose_par_prise_MUI?: number
  dose_par_prise_MUI_min?: number
  dose_par_prise_MUI_max?: number
  dose_journaliere_MUI_min?: number
  dose_journaliere_MUI_max?: number
  dose_journaliere_max_MUI?: number | string
  /** Posologie au poids par palier de 10 kg (spiramycine pédiatrique) — pas
   * encore affiché, V1 se limite à l'adulte, voir SectionPosologies. Typé ici
   * pour que construireFiche() ne perde aucun champ du JSON source. */
  dose_journaliere_MUI_par_10kg_min?: number
  dose_journaliere_MUI_par_10kg_max?: number
  /** UI = unités internationales, sans rapport d'échelle avec les MUI
   * ci-dessus : une héparine se dose en milliers d'UI, la spiramycine en
   * millions. Par prise en valeur absolue (énoxaparine prophylactique,
   * 2000-4000 UI) ou rapportée au poids (énoxaparine curative, héparine en
   * bolus). */
  dose_par_prise_UI_min?: number
  dose_par_prise_UI_max?: number
  dose_par_prise_UI_kg_min?: number
  dose_par_prise_UI_kg_max?: number
  /** Maximum journalier en UI (ex. héparine calcique, 10 000 UI/j) —
   * accepte aussi une chaîne quand le plafond dépend d'un suivi biologique
   * ("Selon TCA/anti-Xa"). */
  dose_journaliere_max_UI?: number | string
  /** mmol = millimoles (ex. chlorure de potassium) — même famille que
   * dose_journaliere_mg_kg(_min/_max)/dose_journaliere_max_g, en unité
   * différente ; accepte aussi une chaîne pour dose_journaliere_max_mmol,
   * même raison que dose_journaliere_max_g ci-dessus (ex. "Selon
   * kaliémie"). */
  dose_journaliere_mmol_kg_min?: number
  dose_journaliere_mmol_kg_max?: number
  dose_journaliere_max_mmol?: number | string
  /** Intervalle rédigé en toutes lettres, quand aucune valeur chiffrée ne
   * convient (ex. "Fractionné ou continu") — prioritaire sur les champs
   * numériques ci-dessous, voir formaterIntervalle(). */
  intervalle?: string
  intervalle_min_h?: number
  intervalle_max_h?: number
  intervalle_min_min?: number
  intervalle_max_min?: number
  nb_prises_min_24h?: number
  nb_prises_max_24h?: number
  /** Nombre d'administrations par MOIS, et non par jour : réservé aux formes
   * retard (ex. octréotide LP, une injection IM mensuelle), où compter en
   * prises journalières n'aurait aucun sens. Valeur unique — une forme LP ne
   * s'exprime pas en fourchette. */
  nb_prises_mois?: number
  age_min_mois?: number | null
  age_max_mois?: number | null
  /** Âge en jours plutôt qu'en mois (néonatologie, ex. midazolam à partir de
   * la naissance) — prioritaire sur la borne en mois correspondante, et
   * mélangeable avec elle sur une même ligne (« 0 j-6 mois »), voir
   * formaterPopulationDetail(). */
  age_min_jours?: number | null
  age_max_jours?: number | null
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

/** Interaction médicamenteuse pertinente pour le geste infirmier. */
export interface IInteractionRcp {
  substance: string
  effet: string
  action_infirmier: string
}

/** Point de surveillance clinique spécifique. */
export interface ISurveillanceRcp {
  evenement: string
  explication: string
  action: string
}

/** Une étape de préparation avant administration, pour une voie donnée
 * (ex. IVD, IVL, IM, SC, PSE, PERF). Un même médicament peut avoir plusieurs
 * entrées (une par voie utilisable). */
export interface IPreparationVoie {
  voie: string
  detail: string
  duree?: string | null
  stabilite?: string | null
  /** Précision de contexte, informative (ex. "VVC recommandée", "état de mal
   * épileptique") — ne filtre rien à l'affichage, contrairement à
   * `population_type` ci-dessous. */
  contexte?: string
  /** Même rôle que sur IPosologieRcp : une préparation propre à la
   * pédiatrie (ex. dilution néonatologie) doit pouvoir être exclue du
   * périmètre adulte, ce que le texte libre de `contexte` ne permet pas de
   * détecter de façon fiable. */
  population_type?: IPopulationType
}

/** Reconstitution d'une poudre avant dilution/injection (ex. amoxicilline,
 * vancomycine). Absente (null) pour les solutions déjà prêtes à l'emploi.
 *
 * `volume_par_<dose>mg_mL` / `volume_par_<dose>UI_mL` : signature indexée
 * plutôt qu'une liste de champs fixes (500/1000/2000...) — les paliers de
 * dose ET l'unité varient d'une molécule à l'autre (ex. 4000 mg pour la
 * pipéracilline/tazobactam, UI pour la spiramycine), et une liste figée fait
 * silencieusement disparaître tout palier non prévu à l'avance (voir
 * DetailInjectable.tsx, qui les découvre dynamiquement plutôt que de les
 * énumérer un par un). */
export interface IReconstitution {
  solvant?: string
  stabilite_avant_dilution?: string
  [cle: `volume_par_${number}mg_mL`]: number | undefined
  [cle: `volume_par_${number}UI_mL`]: number | undefined
}

/** Grossesse et allaitement — contenu fixe (pas une liste dépliable comme
 * surveillanceSpecifique/interactionsMedicamenteuses). */
export interface IGrossesseAllaitementRcp {
  grossesse: string
  allaitement: string
  url_crat_grossesse?: string | null
  url_crat_allaitement?: string | null
}

/** Une forme galénique orale disponible (comprimé, gélule, suspension...),
 * avec sa sécabilité/ouvrabilité (voir DetailPerOs) et sa posologie
 * adulte/pédiatrique. */
export interface IFormeOraleRcp {
  type: string
  dosage?: string
  /** null pour une forme où la question ne se pose pas (gel, solution à
   * pulvériser) — rendu comme "Non écrasable", au même titre que
   * ouverture_gelule à null, voir DetailPerOs. */
  ecrasable?: boolean | null
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

/** Référence RCP consultée pour construire la fiche. */
export interface IRcpSource {
  specialite: string
  titulaire?: string
  date_maj?: string
  url_ansm?: string
}

/** Traçabilité de la validation clinique de la fiche. */
export interface IValidationRcp {
  date: string
  validateur?: string
  perimetre: string[]
  prochaine_revision?: string
}

/** Détails d'administration par voie injectable (IV, IM, SC, PSE...).
 * L'ajustement posologique ne vit PAS ici : il décrit la molécule (fonction
 * rénale, hépatique, âge, poids) et s'applique donc aux deux voies — voir
 * IFiche.noteAjustement, alimenté par commun.note_ajustement. */
export interface IFormeIv {
  reconstitution: IReconstitution | null
  preparation: IPreparationVoie[]
  administration: {
    posologie: IPosologieRcp[]
  }
  incompatibilites: IIncompatibilite[]
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
  /** Contre-indications de la molécule — proviennent de
   * commun.contre_indications, indépendamment de la forme choisie. */
  contreIndications: string[]
  grossesseAllaitement: IGrossesseAllaitementRcp | null
  /** Provient de commun.surveillance_specifique — s'applique à la fiche
   * entière, affiché indépendamment de la forme choisie (voir la voie
   * choisie iv/oral, qui ne concerne que ce qui EST spécifique à une voie). */
  surveillanceSpecifique: ISurveillance[]
  /** Provient de commun.interactions_pertinentes, indépendamment de la forme
   * choisie. */
  interactionsMedicamenteuses: ISurveillance[]
  /** Provient de commun.pictogrammes — toujours vide dans les fiches
   * publiées à ce jour, pas encore d'emplacement d'affichage dédié. */
  pictogrammes: string[]
  /** Ajustement posologique (fonction rénale, hépatique, âge, poids) —
   * provient de commun.note_ajustement : il décrit la molécule, pas une voie
   * précise, et s'affiche donc au bas des posologies des DEUX onglets
   * (injectable et oral), jamais quand aucune forme n'est sélectionnée. */
  noteAjustement: string | null
  /** Même rôle que noteAjustement, pour une molécule à préparation critique
   * (commun.note_ajustement_absolue) — affichée au même endroit mais en
   * rouge plein à texte blanc. */
  noteAjustementAbsolue: string | null
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
  // Les quatre champs suivants décrivent la molécule, pas une voie
  // d'administration — schéma v2 : ils vivent exclusivement dans `commun`,
  // jamais sous `iv`/`oral`/`aerosol` (seule exception : iv.incompatibilites,
  // qui ne fait sens que pour la voie injectable). Dans l'ancien schéma, ils
  // vivaient sous `iv` et disparaissaient silencieusement pour une molécule
  // sans forme injectable — voir CLAUDE.md du dossier de génération des
  // fiches pour le détail de cette règle.
  contre_indications: string[]
  interactions_pertinentes: IInteractionRcp[]
  surveillance_specifique: ISurveillanceRcp[]
  pictogrammes: string[]
  /** Ajustement posologique de la molécule (fonction rénale, hépatique, âge,
   * poids) — vit dans `commun` et non sous `iv`, pour être affiché aussi bien
   * sur l'onglet injectable que sur l'onglet oral. Chaîne vide ou null quand
   * le RCP n'en documente aucun (converti en `null` par construireFiche). */
  note_ajustement?: string | null
  /** Variante du champ ci-dessus pour les molécules dont la préparation ne
   * souffre aucune approximation (stupéfiants, marge thérapeutique étroite) :
   * même emplacement sur la fiche, mais rendu en rouge plein à texte blanc
   * plutôt qu'en encadré ambre. Les deux peuvent coexister — aucune n'écrase
   * l'autre à l'affichage (voir SectionPosologies). */
  note_ajustement_absolue?: string | null
}

export interface IFicheSourceIv {
  reconstitution: IReconstitution | null
  preparation?: IPreparationVoie[]
  administration: {
    posologie: IPosologieRcp[]
  }
  /** Seul bloc de précaution qui reste sous `iv` : une incompatibilité en Y
   * porte sur le mélange de deux solutions dans une tubulure, ce qui n'a pas
   * de sens hors de la voie injectable. */
  incompatibilites: IIncompatibilite[]
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

/** Forme brute d'un fichier public/data/<id>.json, avant enrichissement.
 *
 * `iv`/`oral` acceptent aussi bien l'absence de la clé qu'un `null` explicite
 * (même convention que `aerosol`) : une molécule uniquement injectable écrit
 * indifféremment `"oral": null` ou rien du tout, les deux signifiant « cette
 * voie n'existe pas pour cette molécule ». */
export interface IFicheSource {
  dci: string
  commun: IFicheSourceCommun
  iv?: IFicheSourceIv | null
  oral?: IFicheSourceOral | null
  /** Bloc aérosol : prévu au schéma, encore `null` dans toutes les fiches
   * publiées — pas de type détaillé tant qu'aucune donnée réelle n'existe. */
  aerosol?: unknown
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
