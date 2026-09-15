// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.
//
// GRILLE STATIQUE — NE JAMAIS LIER AU RÉSULTAT CALCULÉ
// Ce composant n'a pas de props, et n'en prendra pas : il affiche toujours
// exactement la même chose, quelle que soit la valeur saisie dans le
// calculateur. Aucune surbrillance de la colonne correspondante, aucun
// défilement automatique vers elle, aucune mise en gras, aucune couleur par
// colonne. C'est ce qui sépare une légende de référence d'une
// interprétation : dès que l'affichage désignerait la tranche où tombe l'IMC
// calculé, l'outil rendrait un avis et basculerait dans une autre catégorie
// réglementaire. Toute modification qui relierait cette table au résultat
// est une régression à corriger immédiatement.

// Fourchettes au tiret plutôt qu'en toutes lettres ("18,5 à 24,9") : sur une
// colonne de 48 à 62 px de large, la forme longue repassait sur deux lignes.
// C'est aussi la notation des fourchettes de dose ailleurs dans l'app, voir
// formaterPlage() dans src/utils/posologie.ts, qui écrit "0,5-1 mg".
const REPERES: { categorie: string; plage: string }[] = [
  { categorie: 'Maigreur', plage: '< 18,5' },
  { categorie: 'Corpulence normale', plage: '18,5-24,9' },
  { categorie: 'Surpoids', plage: '25-29,9' },
  { categorie: 'Obésité modérée', plage: '30-39,9' },
  { categorie: 'Obésité sévère', plage: '≥ 40' },
]

export default function TableReferenceIMC() {
  return (
    <div className="flex flex-col gap-1.5">
      {/* L'unité est passée dans le titre : en disposition par colonnes, il
          n'y a plus de colonne "IMC (kg/m²)" pour la porter, et sans elle
          "18,5 à 24,9" ne dirait pas de quoi il parle. */}
      <span className="text-etiquette font-semibold uppercase tracking-widest text-texte-doux">
        Repères OMS · IMC en kg/m²
      </span>

      {/* var(--fond) et non var(--surface) : le corps du calculateur est déjà
          posé sur --surface (voir CalculateurModal), une carte de la même
          couleur y serait invisible. --fond est plus sourd en thème clair et
          plus profond en sombre, donc lisible comme une surface distincte
          dans les deux cas.
          overflow-hidden : sans lui, les cellules d'extrémité déborderaient
          des coins arrondis. */}
      <div className="overflow-hidden rounded-xl" style={{ backgroundColor: 'var(--fond)' }}>
        {/* Les catégories en en-tête de colonne et les fourchettes sur
            l'unique ligne de données : la légende passe de six rangées
            empilées à deux, pour une hauteur divisée par trois. `th scope`
            garde la lecture correcte au lecteur d'écran — chaque fourchette
            reste annoncée avec sa catégorie.
            table-fixed : les cinq colonnes font la même largeur quelle que
            soit la longueur du libellé, sinon "Corpulence normale" écraserait
            "Maigreur". table-auto a été essayé et fait pire — le navigateur
            donne la largeur aux en-têtes et étrangle les fourchettes, qui
            repassent alors sur deux lignes à toutes les largeurs d'écran.
            px-0.5 et non px-1 : "18,5-24,9" mesure 50 px, pour 52 px de
            place utile par colonne sur un écran de 360 px — les 4 px de
            marge gagnés sont exactement ce qui la garde sur une ligne. Le
            texte étant centré, il ne s'approche pas des filets pour autant.
            Sous 340 px, cette seule fourchette repasse sur deux lignes ; la
            coupure tombe après le tiret et reste lisible. */}
        <table className="w-full table-fixed border-collapse" aria-label="Repères OMS d'interprétation de l'IMC">
          <thead>
            <tr>
              {REPERES.map(({ categorie }, index) => (
                <th
                  key={categorie}
                  scope="col"
                  // Traitement rigoureusement identique d'une colonne à
                  // l'autre : aucune couleur d'alerte sur l'obésité sévère,
                  // aucun vert sur la corpulence normale. Une échelle colorée
                  // serait déjà une lecture de la valeur calculée.
                  className={`border-b border-texte/10 px-0.5 pb-1.5 pt-2 align-bottom text-center text-etiquette font-medium leading-tight text-texte ${index > 0 ? 'border-l border-texte/10' : ''}`}
                >
                  {categorie}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {REPERES.map(({ categorie, plage }, index) => (
                // tabular-nums : les chiffres gardent la même chasse d'une
                // colonne à l'autre, les fourchettes restent alignées.
                <td
                  key={categorie}
                  className={`px-0.5 pb-2 pt-1.5 text-center text-xs font-semibold tabular-nums leading-tight text-texte ${index > 0 ? 'border-l border-texte/10' : ''}`}
                >
                  {plage}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-etiquette italic leading-relaxed" style={{ color: 'var(--texte-doux)' }}>
        À titre indicatif. La lecture et l'interprétation restent de la responsabilité du professionnel.
      </p>
    </div>
  )
}
