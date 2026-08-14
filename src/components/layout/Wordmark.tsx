import { useTheme } from '../../contexts/ThemeContext'

// Wordmark officiel "bolus" : on utilise le logo SVG fourni (dans
// /public), pas une reconstruction en CSS. Le fichier a ses couleurs
// figées en dur (ce n'est pas du CSS, on ne peut pas le faire suivre
// var(--texte)/var(--accent) comme le reste de l'app) : il existe donc en
// deux exports, un par thème, et on choisit le bon fichier selon
// themeEffectif plutôt que d'appliquer un filtre CSS approximatif.
export default function Wordmark({ taille = '1.6rem' }: { taille?: string }) {
  const { themeEffectif } = useTheme()
  const src =
    themeEffectif === 'sombre' ? '/bolus-wordmark-sombre.svg' : '/bolus-wordmark-clair.svg'

  return <img src={src} alt="bolus" style={{ height: taille }} />
}
