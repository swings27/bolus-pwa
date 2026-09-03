// Validation structurelle légère d'un fichier public/data/<id>.json au
// chargement : pas une bibliothèque de schéma (zod...), juste des vérifs de
// forme ciblées sur les erreurs réalistes (bloc manquant, champ mal nommé,
// tableau attendu là où le JSON donne un objet ou une chaîne) — pas une
// validation exhaustive de chaque champ optionnel de posologie, qui
// échouerait silencieusement de toute façon à l'affichage (un "—" apparaît
// à la place) plutôt que de casser le chargement.
//
// Le but n'est pas d'empêcher toute erreur de donnée, mais de transformer un
// échec de chargement muet ("Impossible de charger les fiches médicaments")
// en message précis : quel fichier, quel champ, quel problème.

type Chemin = (string | number)[]

function formaterChemin(chemin: Chemin): string {
  return chemin.length > 0 ? chemin.join('.') : '(racine)'
}

class CollecteurErreurs {
  private readonly id: string
  private erreurs: string[] = []

  constructor(id: string) {
    this.id = id
  }

  signaler(chemin: Chemin, message: string) {
    this.erreurs.push(`${this.id}.json — ${formaterChemin(chemin)} : ${message}`)
  }

  get liste(): string[] {
    return this.erreurs
  }
}

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)
}

// Vérifie un champ requis et renvoie sa valeur telle quelle (as unknown) pour
// inspection plus poussée par l'appelant — évite de dupliquer "existe-t-il,
// est-ce le bon type de base" à chaque contrôle plus spécifique ci-dessous.
function verifierChamp(
  erreurs: CollecteurErreurs,
  parent: Record<string, unknown>,
  chemin: Chemin,
  cle: string,
  type: 'string' | 'array' | 'object',
): unknown {
  const valeur = parent[cle]
  const cheminComplet = [...chemin, cle]
  if (valeur === undefined) {
    erreurs.signaler(cheminComplet, 'champ manquant')
    return undefined
  }
  if (type === 'string' && typeof valeur !== 'string') {
    erreurs.signaler(cheminComplet, `doit être une chaîne (reçu ${typeDe(valeur)})`)
  }
  if (type === 'array' && !Array.isArray(valeur)) {
    erreurs.signaler(cheminComplet, `doit être un tableau (reçu ${typeDe(valeur)})`)
  }
  if (type === 'object' && !estObjet(valeur)) {
    erreurs.signaler(cheminComplet, `doit être un objet (reçu ${typeDe(valeur)})`)
  }
  return valeur
}

function typeDe(valeur: unknown): string {
  if (valeur === null) return 'null'
  if (Array.isArray(valeur)) return 'tableau'
  if (typeof valeur === 'object') return 'objet'
  return typeof valeur
}

// Vérifie que chaque élément d'un tableau est un objet portant au moins les
// clés `champsRequis` (en chaîne) — utilisé pour les listes d'objets
// homogènes (interactions, surveillance, incompatibilités, sources RCP...)
// sans dupliquer la boucle à chaque fois.
function verifierListeObjets(erreurs: CollecteurErreurs, chemin: Chemin, valeur: unknown, champsRequis: string[]) {
  if (!Array.isArray(valeur)) return
  valeur.forEach((item, index) => {
    const cheminItem = [...chemin, index]
    if (!estObjet(item)) {
      erreurs.signaler(cheminItem, `doit être un objet (reçu ${typeDe(item)})`)
      return
    }
    for (const champ of champsRequis) {
      if (typeof item[champ] !== 'string') {
        erreurs.signaler([...cheminItem, champ], `doit être une chaîne (reçu ${typeDe(item[champ])})`)
      }
    }
  })
}

/** Contrôle la forme d'un fichier public/data/<id>.json fraîchement récupéré
 * (avant construireFiche()) et renvoie la liste des problèmes trouvés — vide
 * si le fichier est structurellement valide. `id` sert uniquement à préfixer
 * les messages (ex. "paracetamol.json — ..."). */
export function validerFicheSource(id: string, brut: unknown): string[] {
  const erreurs = new CollecteurErreurs(id)

  if (!estObjet(brut)) {
    erreurs.signaler([], `le fichier doit contenir un objet JSON (reçu ${typeDe(brut)})`)
    return erreurs.liste
  }

  verifierChamp(erreurs, brut, [], 'dci', 'string')

  const commun = verifierChamp(erreurs, brut, [], 'commun', 'object')
  if (estObjet(commun)) {
    verifierChamp(erreurs, commun, ['commun'], 'noms_commerciaux', 'array')
    verifierChamp(erreurs, commun, ['commun'], 'famille', 'string')
    verifierChamp(erreurs, commun, ['commun'], 'antidote', 'string')
    verifierChamp(erreurs, commun, ['commun'], 'indications', 'array')
    // Schéma v2 : ces quatre blocs vivent dans `commun`, jamais sous
    // `iv`/`oral` — voir CLAUDE.md du dossier de génération des fiches.
    verifierChamp(erreurs, commun, ['commun'], 'contre_indications', 'array')
    verifierListeObjets(erreurs, ['commun', 'interactions_pertinentes'], commun.interactions_pertinentes, [
      'substance',
      'effet',
      'action_infirmier',
    ])
    verifierListeObjets(erreurs, ['commun', 'surveillance_specifique'], commun.surveillance_specifique, [
      'evenement',
      'explication',
      'action',
    ])
    verifierChamp(erreurs, commun, ['commun'], 'pictogrammes', 'array')

    const grossesse = commun.grossesse_allaitement
    if (grossesse !== null && grossesse !== undefined) {
      if (!estObjet(grossesse)) {
        erreurs.signaler(['commun', 'grossesse_allaitement'], `doit être un objet ou null (reçu ${typeDe(grossesse)})`)
      } else {
        verifierChamp(erreurs, grossesse, ['commun', 'grossesse_allaitement'], 'grossesse', 'string')
        verifierChamp(erreurs, grossesse, ['commun', 'grossesse_allaitement'], 'allaitement', 'string')
      }
    }
  }

  if (brut.iv !== undefined) {
    const iv = brut.iv
    if (!estObjet(iv)) {
      erreurs.signaler(['iv'], `doit être un objet (reçu ${typeDe(iv)})`)
    } else {
      const administration = verifierChamp(erreurs, iv, ['iv'], 'administration', 'object')
      if (estObjet(administration)) {
        verifierChamp(erreurs, administration, ['iv', 'administration'], 'posologie', 'array')
      }
      verifierChamp(erreurs, iv, ['iv'], 'incompatibilites', 'array')
      verifierListeObjets(erreurs, ['iv', 'incompatibilites'], iv.incompatibilites, ['substance', 'niveau'])
    }
  }

  if (brut.oral !== undefined) {
    const oral = brut.oral
    if (!estObjet(oral)) {
      erreurs.signaler(['oral'], `doit être un objet (reçu ${typeDe(oral)})`)
    } else {
      const formes = verifierChamp(erreurs, oral, ['oral'], 'formes', 'array')
      if (Array.isArray(formes)) {
        formes.forEach((forme, index) => {
          const chemin = ['oral', 'formes', index]
          if (!estObjet(forme)) {
            erreurs.signaler(chemin, `doit être un objet (reçu ${typeDe(forme)})`)
            return
          }
          verifierChamp(erreurs, forme, chemin, 'type', 'string')
          verifierChamp(erreurs, forme, chemin, 'posologie_adulte', 'array')
        })
      }
    }
  }

  if (brut.iv === undefined && brut.oral === undefined) {
    erreurs.signaler([], 'ni "iv" ni "oral" ne sont renseignés — une fiche doit documenter au moins une voie')
  }

  const tracabilite = verifierChamp(erreurs, brut, [], 'tracabilite', 'object')
  if (estObjet(tracabilite)) {
    verifierChamp(erreurs, tracabilite, ['tracabilite'], 'rcp_source', 'array')
    verifierListeObjets(erreurs, ['tracabilite', 'rcp_source'], tracabilite.rcp_source, ['specialite'])
    verifierChamp(erreurs, tracabilite, ['tracabilite'], 'statut', 'string')
    const validation = verifierChamp(erreurs, tracabilite, ['tracabilite'], 'validation', 'object')
    if (estObjet(validation)) {
      verifierChamp(erreurs, validation, ['tracabilite', 'validation'], 'date', 'string')
      verifierChamp(erreurs, validation, ['tracabilite', 'validation'], 'perimetre', 'array')
    }
  }

  return erreurs.liste
}
