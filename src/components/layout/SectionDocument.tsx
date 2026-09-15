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
//
// text-xl font-bold (20 px / 700) plutôt que text-base font-semibold
// (16 px / 600) : à corps et graisse presque identiques au paragraphe qui
// suivait, les titres ne servaient plus de points d'accroche dans des pages
// qui alignent six à neuf sections. 18 px a d'abord été essayé, trop proche
// des 16 px du corps pour se voir d'un coup d'œil. À 20 px, la hiérarchie
// reste nette sous le titre de page (24 px, voir PageDocument).
export default function SectionDocument({ titre, children }: ISectionDocumentProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-body text-xl font-bold text-texte">{titre}</h2>
      <div className="flex flex-col gap-3 text-base leading-relaxed text-texte">{children}</div>
    </section>
  )
}
