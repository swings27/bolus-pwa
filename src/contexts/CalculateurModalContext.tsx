import { createContext, useContext, useState, type ReactNode } from 'react'

interface ICalculateurModalContext {
  estOuvert: boolean
  ouvrir: () => void
  fermer: () => void
}

const CalculateurModalContext = createContext<ICalculateurModalContext | null>(null)

// État d'ouverture du calculateur, partagé entre le bouton central de la
// BottomNavBar (qui l'ouvre) et le composant modal (qui l'affiche). Vivre en
// dehors du routeur — plutôt que sur une route /calculateurs — permet à la
// modale de s'ouvrir par-dessus n'importe quelle page (une fiche médicament,
// une recherche...) sans la démonter : on garde son état intact et on y
// revient tel qu'on l'a laissé en fermant la modale.
export function CalculateurModalProvider({ children }: { children: ReactNode }) {
  const [estOuvert, setEstOuvert] = useState(false)

  return (
    <CalculateurModalContext.Provider
      value={{ estOuvert, ouvrir: () => setEstOuvert(true), fermer: () => setEstOuvert(false) }}
    >
      {children}
    </CalculateurModalContext.Provider>
  )
}

export function useCalculateurModal() {
  const contexte = useContext(CalculateurModalContext)
  if (!contexte) throw new Error('useCalculateurModal doit être utilisé sous CalculateurModalProvider')
  return contexte
}
