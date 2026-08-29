import { DONNEES_MOCK } from '../../data/editeur'

// Marqueur visuel permanent tant que le catalogue contient des fiches de
// développement (voir DONNEES_MOCK dans editeur.ts) : si l'URL de bêta
// circule hors du cercle des testeuses, personne ne peut prendre une valeur
// clinique fictive pour une donnée validée. Rendu par Header.tsx, dans le
// MÊME conteneur sticky que la barre elle-même (pas un élément sticky
// indépendant coordonné via une hauteur mesurée) — les deux doivent rester
// physiquement collés l'un à l'autre à tout instant, y compris le temps
// qu'une mesure asynchrone se propage, ce qu'une coordination à distance ne
// garantit pas. C'est donc lui, et non le Header, qui porte la marge de
// sécurité iOS (env(safe-area-inset-top)) quand il s'affiche.
//
// var(--fond) comme texte (pas un crème fixe) : en sombre, --alerte devient
// une teinte plus claire (#E07A6B) — un texte crème fixe y perdrait tout
// contraste, alors que --fond y vaut la couleur sombre du thème, toujours
// lisible sur un fond saturé quel que soit le thème (même principe que
// BlocInfo.tsx).
export default function BandeauBeta() {
  if (!DONNEES_MOCK) return null

  return (
    <div
      className="flex items-center justify-center px-2"
      style={{ paddingTop: 'env(safe-area-inset-top)', backgroundColor: 'var(--alerte)' }}
    >
      <p
        className="py-1 text-center text-[9px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--fond)' }}
      >
        Version de test — données non validées
      </p>
    </div>
  )
}
