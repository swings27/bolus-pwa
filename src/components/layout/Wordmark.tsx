import { useTheme } from '../../contexts/ThemeContext'

// Wordmark officiel "bolus" (SVG fourni dans /public), utilisé par le
// Header (petit format) et le bloc d'intro de l'Accueil (grand format).
// Un SVG reste net à n'importe quelle taille d'affichage, contrairement à
// un PNG — c'est pour ça qu'on ne dimensionne qu'avec une hauteur (h-*) et
// qu'on laisse la largeur suivre le ratio naturel du fichier.
//
// Le fichier a ses couleurs figées en dur (ce n'est pas du CSS, on ne peut
// pas le faire suivre var(--texte) comme le reste de l'app) : il existe
// donc en deux exports, un par thème, et on choisit le bon fichier selon
// themeEffectif plutôt que d'appliquer un filtre CSS approximatif.
export default function Wordmark({ className = 'h-8' }: { className?: string }) {
  const { themeEffectif } = useTheme()
  const src =
    themeEffectif === 'sombre' ? '/bolus-wordmark-sombre.svg' : '/bolus-wordmark-clair.svg'

  return <img src={src} alt="bolus" className={className} />
}
