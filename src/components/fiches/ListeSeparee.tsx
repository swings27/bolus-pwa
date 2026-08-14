interface IListeSepareeProps {
  items: string[]
}

// Affiche une liste comme un paragraphe fluide plutôt qu'à puces : plus
// rapide à parcourir visuellement pour des listes courtes (indications,
// contre-indications, noms commerciaux), et moins de hauteur verticale
// consommée sur un écran de téléphone.
export default function ListeSeparee({ items }: IListeSepareeProps) {
  return <p>{items.join(' · ')}</p>
}
