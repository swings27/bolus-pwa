// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

interface IResultatCalculProps {
  label: string
  valeur: string | null
  unite: string
}

// Le résultat reste neutre quelle que soit sa valeur : aucune couleur
// d'alerte, aucun seuil, aucun code couleur — c'est un chiffre, pas un avis.
export default function ResultatCalcul({ label, valeur, unite }: IResultatCalculProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-texte-doux">{label}</span>
      {valeur === null ? (
        <span className="font-display" style={{ fontSize: '2rem', color: 'var(--texte-doux)' }}>
          —
        </span>
      ) : (
        <span className="flex flex-wrap items-baseline gap-1.5">
          <span className="font-display font-semibold text-texte" style={{ fontSize: '2rem' }}>
            {valeur}
          </span>
          <span className="text-base text-texte-doux">{unite}</span>
        </span>
      )}
    </div>
  )
}
