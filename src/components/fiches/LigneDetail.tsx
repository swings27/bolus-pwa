import type { ReactNode } from 'react'

type Disposition = 'colonne' | 'ligne'

interface ILigneDetailProps {
  label: string
  children: ReactNode
  /** 'colonne' (par défaut) : libellé au-dessus de la valeur (DetailInjectable).
   * 'ligne' : libellé à gauche, valeur à droite (DetailPerOs). */
  disposition?: Disposition
}

// Paire libellé / valeur avec séparateur fin, partagée par les détails de
// forme d'administration (injectable, per os/sonde). last:border-b-0 retire
// le séparateur de la dernière ligne réellement affichée — les champs
// optionnels sont rendus conditionnellement, donc "la dernière ligne" varie
// d'une fiche à l'autre.
export default function LigneDetail({ label, children, disposition = 'colonne' }: ILigneDetailProps) {
  if (disposition === 'ligne') {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-texte/10 py-3 last:border-b-0">
        <span className="text-xs text-texte-doux">{label}</span>
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 border-b border-texte/10 py-3 last:border-b-0">
      <span className="text-xs text-texte-doux">{label}</span>
      <span className="text-sm font-semibold text-texte">{children}</span>
    </div>
  )
}
