import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquarePlus } from 'lucide-react'
import { useCalculateurModal } from '../../contexts/CalculateurModalContext'
import { construireMailtoRetour } from '../../utils/retourBeta'
import { MODE_BETA } from '../../data/editeur'

interface IBoutonRetourBetaProps {
  /** Hauteur courante d'InstallBanner/UpdateBanner (voir Layout.tsx),
   * ajoutée à la position pour ne jamais chevaucher l'un ou l'autre quand
   * il est affiché. */
  decalageBas?: number
}

// Bouton flottant discret, actif uniquement pendant la bêta (voir
// MODE_BETA) : ouvre un mailto pré-rempli avec le contexte technique
// courant, pour que chaque retour arrive avec de quoi le reproduire sans
// aller-retour supplémentaire. Masqué sur /menu/* (déjà une liste d'items
// tactiles, un bouton flottant y gênerait) et pendant que le calculateur
// est ouvert (modale plein écran avec ses propres champs de saisie) —
// /calculateurs n'est pas une route à part entière, d'où la dépendance à
// l'état de la modale plutôt qu'au pathname pour ce cas précis.
export default function BoutonRetourBeta({ decalageBas = 0 }: IBoutonRetourBetaProps) {
  const location = useLocation()
  const { estOuvert: calculateurOuvert } = useCalculateurModal()
  const [href, setHref] = useState<string | null>(null)

  const masque = location.pathname.startsWith('/menu') || calculateurOuvert

  useEffect(() => {
    if (masque) return
    let annule = false
    construireMailtoRetour({ sujet: 'Bolus bêta — Retour', route: location.pathname }).then((url) => {
      if (!annule) setHref(url)
    })
    return () => {
      annule = true
    }
  }, [location.pathname, masque])

  if (!MODE_BETA || masque || !href) return null

  return (
    <a
      href={href}
      className="fixed z-40 flex h-10 items-center gap-1.5 rounded-full border px-3.5 opacity-90 shadow-md transition-opacity duration-150 hover:opacity-100 active:opacity-100"
      style={{
        right: '16px',
        // 8px (pas 16px) : sur l'Accueil, DisclaimerBanner réserve désormais
        // une marge basse généreuse (voir DisclaimerBanner.tsx) pour le
        // bouton du Calculateur, ce qui pousse d'autant ce bouton-ci vers le
        // haut — un écart plus petit ici compense pour qu'il reste proche du
        // bandeau plutôt que de sembler flotter loin au-dessus.
        bottom: `calc(var(--hauteur-nav) + ${decalageBas}px + 8px)`,
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--nav-bordure)',
        color: 'var(--texte)',
      }}
    >
      <MessageSquarePlus className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="text-[11px] font-semibold">Un retour ?</span>
    </a>
  )
}
