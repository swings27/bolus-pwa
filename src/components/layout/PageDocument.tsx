import type { ReactNode } from 'react'
import Header from './Header'

interface IPageDocumentProps {
  titre: string
  children: ReactNode
}

// Mise en page commune aux pages documentaires (À propos, Contact, Mentions
// légales, Confidentialité, CGU) : un texte long à lire posément, pas une
// donnée à consulter en garde — d'où l'absence volontaire de
// DisclaimerBanner ici, et une largeur de lecture (max-w-prose) plus étroite
// que les pages de contenu médicamenteux.
export default function PageDocument({ titre, children }: IPageDocumentProps) {
  return (
    <div className="flex flex-col pb-8">
      <Header variant="retour" />

      <div className="flex flex-col gap-8 px-6 pt-4">
        <h1 className="font-display text-2xl font-semibold text-texte">{titre}</h1>

        <div className="mx-auto flex w-full max-w-prose flex-col gap-8 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}
