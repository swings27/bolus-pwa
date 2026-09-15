import type { ReactNode } from 'react'

interface ITitrePageProps {
  children: ReactNode
  /** `h2` pour un titre qui n'est pas celui de la page — l'accueil réserve
   * son `h1` au wordmark, la modale d'accueil au titre de son dialogue. Le
   * niveau change, l'apparence non. */
  niveau?: 'h1' | 'h2'
  id?: string
}

// Titre principal d'un écran : Fraunces, 24px, semi-gras. Le même trio de
// classes était recopié à six endroits (PageDocument, Onboarding, Accueil,
// Catégories, Menu, Paramètres) — six occasions de diverger au prochain
// ajustement typographique, et c'est déjà arrivé une fois sur la graisse.
export default function TitrePage({ children, niveau = 'h1', id }: ITitrePageProps) {
  const Balise = niveau
  return (
    <Balise id={id} className="font-display text-2xl font-semibold text-texte">
      {children}
    </Balise>
  )
}
