import type { LucideIcon } from 'lucide-react'

interface IEtatVideProps {
  icone: LucideIcon
  titre: string
  description?: string
}

// État vide générique : recherche pas encore lancée, aucun résultat,
// catégorie sans fiche... Centré verticalement dans l'espace disponible du
// parent (le parent doit être flex pour que flex-1 ait un effet).
export default function EtatVide({ icone: Icone, titre, description }: IEtatVideProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <Icone className="h-10 w-10 text-texte-doux/40" aria-hidden="true" />
      <p className="font-semibold text-texte">{titre}</p>
      {description && <p className="text-sm text-texte-doux">{description}</p>}
    </div>
  )
}
