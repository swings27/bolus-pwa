// CALCULATEUR — ARITHMÉTIQUE PURE
// Ce composant ne doit jamais recevoir d'identifiant de fiche ni aucune
// donnée provenant de src/db, src/hooks/useFiche, src/hooks/useSearch ou
// src/data/categories. Cette séparation stricte maintient Bolus hors du
// champ du règlement européen MDR 2017/745 sur les dispositifs médicaux.
// Voir scripts/verif-isolation-calculateurs.mjs, qui fait échouer le build
// en cas de couplage.

interface IBoutonReinitialiserProps {
  onClick: () => void
}

// Partagé par CalcDebit et CalcDosePoids : même lien, même geste, seule la
// fonction de remise à zéro diffère d'un calculateur à l'autre.
export default function BoutonReinitialiser({ onClick }: IBoutonReinitialiserProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      // -my-3 compense le py-3 : zone tactile de 44px sans repousser le
      // reste de la mise en page (le lien n'a aucun padding par ailleurs).
      className="-my-3 self-start py-3 text-sm"
      style={{ color: 'var(--interactif)' }}
    >
      Réinitialiser
    </button>
  )
}
