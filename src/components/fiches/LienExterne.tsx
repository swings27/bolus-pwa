interface ILienExterneProps {
  href: string
  /** Libellé sans la flèche : le "↗" qui signale la sortie de l'app est
   * ajouté ici, pour qu'aucun appelant ne l'oublie. */
  children: string
}

// Lien sortant des blocs de la fiche médicament (CRAT pour grossesse et
// allaitement, BDPM pour les sources RCP) : même présentation et surtout
// mêmes attributs d'ouverture partout. rel="noreferrer" implique déjà
// noopener, donc l'onglet ouvert ne garde aucune référence vers l'app.
export default function LienExterne({ href, children }: ILienExterneProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-1 inline-block text-[11px] underline"
      style={{ color: 'var(--interactif)' }}
    >
      {children} ↗
    </a>
  )
}
