import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { db } from '../db'

// "theme" = préférence utilisateur, telle que choisie dans Paramètres (3
// valeurs possibles, "auto" y compris). "themeEffectif" (dans le contexte
// ci-dessous) est le thème RÉELLEMENT appliqué à l'écran (2 valeurs
// seulement : "clair" ou "sombre") : quand theme === "auto", themeEffectif
// est résolu dynamiquement depuis les préférences système et peut changer
// sans aucune action de l'utilisateur (ex. le téléphone bascule en sombre
// au coucher du soleil) ; quand theme est explicite, themeEffectif lui est
// simplement identique.
export type Theme = 'auto' | 'clair' | 'sombre'
type ThemeEffectif = 'clair' | 'sombre'

const CLE_THEME = 'theme'

interface IThemeContext {
  theme: Theme
  themeEffectif: ThemeEffectif
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<IThemeContext | null>(null)

function systemePrefereSombre(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Applique le thème effectif au document : la classe "dark" sur <html>
// pilote tous les tokens CSS de index.css (:root vs .dark), et la balise
// <meta name="theme-color"> pilote la couleur de la barre d'état du
// téléphone/navigateur — sans cette mise à jour, elle resterait teintée
// terracotta clair (couleur du thème clair) au-dessus d'une app passée en
// sombre.
function appliquerAuDocument(themeEffectif: ThemeEffectif) {
  document.documentElement.classList.toggle('dark', themeEffectif === 'sombre')

  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', themeEffectif === 'sombre' ? '#0F272E' : '#FAF3E7')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('auto')
  const [themeEffectif, setThemeEffectif] = useState<ThemeEffectif>(
    systemePrefereSombre() ? 'sombre' : 'clair',
  )

  // Au montage : Dexie est la source de vérité pour la préférence de
  // thème. On la lit une fois ; si absente (première visite), "auto" reste
  // la valeur par défaut déjà posée dans le useState ci-dessus.
  useEffect(() => {
    db.parametres.get(CLE_THEME).then((param) => {
      if (param?.valeur === 'auto' || param?.valeur === 'clair' || param?.valeur === 'sombre') {
        setThemeState(param.valeur)
      }
    })
  }, [])

  // Résout themeEffectif à partir de theme. En mode "auto", on s'abonne en
  // plus à matchMedia pour réagir en direct si l'utilisateur change le
  // thème de son OS pendant que l'app reste ouverte.
  useEffect(() => {
    if (theme !== 'auto') {
      setThemeEffectif(theme)
      return
    }

    setThemeEffectif(systemePrefereSombre() ? 'sombre' : 'clair')

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function gererChangementSysteme(event: MediaQueryListEvent) {
      setThemeEffectif(event.matches ? 'sombre' : 'clair')
    }
    media.addEventListener('change', gererChangementSysteme)
    return () => media.removeEventListener('change', gererChangementSysteme)
  }, [theme])

  useEffect(() => {
    appliquerAuDocument(themeEffectif)
  }, [themeEffectif])

  function setTheme(nouveauTheme: Theme) {
    setThemeState(nouveauTheme)
    db.parametres.put({ cle: CLE_THEME, valeur: nouveauTheme })
    // Dexie est asynchrone : un script inline exécuté avant le montage de
    // React (voir index.html) ne peut pas l'attendre sans bloquer le
    // rendu. On duplique donc la préférence dans localStorage — lui est
    // synchrone et lisible instantanément par ce script, pour poser la
    // classe "dark" avant le premier paint et éviter un flash clair au
    // rechargement en thème sombre. Dexie reste la source de vérité ;
    // localStorage n'est qu'un cache de démarrage écrit à chaque changement.
    localStorage.setItem(CLE_THEME, nouveauTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, themeEffectif, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): IThemeContext {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme() doit être appelé à l’intérieur de <ThemeProvider>')
  return ctx
}
