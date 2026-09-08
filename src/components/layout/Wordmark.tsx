import { useTheme } from '../../contexts/ThemeContext'
import type { CSSProperties } from 'react'

// Wordmark officiel "bolus" : on utilise le logo SVG fourni (dans
// /public), pas une reconstruction en CSS. Le fichier a ses couleurs
// figées en dur (ce n'est pas du CSS, on ne peut pas le faire suivre
// var(--texte)/var(--accent) comme le reste de l'app) : il existe donc en
// deux exports, un par thème, et on choisit le bon fichier selon
// themeEffectif plutôt que d'appliquer un filtre CSS approximatif.
//
// `style` permet à un appelant de piloter la taille autrement que par
// `taille` (hauteur fixe) — ex. un affichage large et responsive piloté
// par la largeur (`width` + `height: 'auto'`). Fixer height ET contraindre
// ensuite via max-width écraserait l'image : max-width ne recalcule PAS
// height quand height n'est pas 'auto' au départ (§10.4 CSS2.1), d'où la
// nécessité de vraiment passer par `style` plutôt qu'une classe max-width
// posée par-dessus une hauteur figée.
export default function Wordmark({
  taille = '1.6rem',
  className,
  style,
}: {
  taille?: string
  className?: string
  style?: CSSProperties
}) {
  const { themeEffectif } = useTheme()
  const src =
    themeEffectif === 'sombre' ? '/bolus-wordmark-sombre.svg' : '/bolus-wordmark-clair.svg'

  return <img src={src} alt="bolus" style={{ height: taille, ...style }} className={className} />
}
