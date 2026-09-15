// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

type Variante = 'principal' | 'discret'
type Disposition = 'colonne' | 'ligne'

interface IResultatCalculProps {
  label: string
  valeur: string | null
  unite: string
  /** "discret" : même bloc en plus petit, pour un résultat intermédiaire —
   * la concentration déduite d'une dilution dans CalcConversion, qui doit
   * rester lisible et recoupable avec l'étiquette de la seringue sans peser
   * autant que la réponse finale du calculateur. Deux chiffres de même
   * taille à l'écran se liraient comme deux réponses. */
  variante?: Variante
  /** "ligne" : libellé et valeur sur une seule ligne, aux deux bouts. Fait
   * gagner une ligne à chaque résultat intermédiaire — sur un téléphone, la
   * modale des calculateurs déborde vite de l'écran. */
  disposition?: Disposition
}

// Seule la taille change d'une variante à l'autre : même police, mêmes
// couleurs, même mise en page. Un résultat secondaire doit rester le même
// objet visuel, juste plus bas dans la hiérarchie — pas un composant qui
// aurait l'air différent.
const TAILLES: Record<Variante, { valeur: string; unite: string }> = {
  principal: { valeur: '2rem', unite: 'text-base' },
  discret: { valeur: '1.25rem', unite: 'text-sm' },
}

// Le résultat reste neutre quelle que soit sa valeur : aucune couleur
// d'alerte, aucun seuil, aucun code couleur — c'est un chiffre, pas un avis.
export default function ResultatCalcul({
  label,
  valeur,
  unite,
  variante = 'principal',
  disposition = 'colonne',
}: IResultatCalculProps) {
  const taille = TAILLES[variante]
  // items-baseline en ligne : le libellé en petites capitales et le chiffre,
  // de corps très différents, s'alignent sur leur ligne d'écriture commune
  // plutôt que sur le haut ou le milieu de leurs boîtes respectives.
  const conteneur =
    disposition === 'ligne' ? 'flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1' : 'flex flex-col gap-1'

  return (
    <div className={conteneur}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-texte-doux">{label}</span>
      {valeur === null ? (
        <span className="font-display" style={{ fontSize: taille.valeur, color: 'var(--texte-doux)' }}>
          —
        </span>
      ) : (
        <span className="flex flex-wrap items-baseline gap-1.5">
          <span className="font-display font-semibold text-texte" style={{ fontSize: taille.valeur }}>
            {valeur}
          </span>
          <span className={`${taille.unite} text-texte-doux`}>{unite}</span>
        </span>
      )}
    </div>
  )
}
