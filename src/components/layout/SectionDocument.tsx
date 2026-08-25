import type { ReactNode } from 'react'

interface ISectionDocumentProps {
  titre: string
  children: ReactNode
}

// Section de contenu générique pour les pages documentaires. Le titre reste
// en Nunito Sans (font-body, la police déjà utilisée par défaut pour le
// corps de texte — voir body{} dans index.css) plutôt qu'en Fraunces comme
// les autres titres de section de l'app (ex. Paramètres) : ici on lit un
// texte long, pas une étiquette.
export default function SectionDocument({ titre, children }: ISectionDocumentProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-body text-base font-semibold text-texte">{titre}</h2>
      <div className="flex flex-col gap-3 text-base leading-relaxed text-texte">{children}</div>
    </section>
  )
}
