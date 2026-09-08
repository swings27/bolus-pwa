// Le "o" du logo bolus, isolé : même géométrie que public/bolus-favicon.svg
// (cercle en deux arcs de 180°, séparation horizontale au centre), mais en
// couleurs var(--accent-clair)/var(--accent) plutôt qu'en hexadécimal figé
// — s'adapte donc automatiquement au thème clair/sombre, contrairement au
// wordmark (voir Wordmark.tsx) qui doit swapper de fichier SVG faute de
// pouvoir le faire en CSS pur.
export default function LogoO({ taille = 96 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 48 48" role="img" aria-hidden="true">
      <path d="M 4 24 A 20 20 0 0 1 44 24 Z" fill="var(--accent-clair)" />
      <path d="M 4 24 A 20 20 0 0 0 44 24 Z" fill="var(--accent)" />
    </svg>
  )
}
