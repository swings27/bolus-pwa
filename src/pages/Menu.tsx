import { Settings, Info, Mail, FileText, Shield, ScrollText, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'

interface ILienMenu {
  to: string
  label: string
  icon: LucideIcon
}

const LIENS: ILienMenu[] = [
  { to: '/menu/parametres', label: 'Paramètres', icon: Settings },
  { to: '/menu/a-propos', label: 'À propos', icon: Info },
  { to: '/menu/contact', label: 'Contact', icon: Mail },
  { to: '/menu/mentions-legales', label: 'Mentions légales', icon: FileText },
  { to: '/menu/confidentialite', label: 'Confidentialité', icon: Shield },
  { to: '/menu/cgu', label: 'CGU', icon: ScrollText },
]

export default function Menu() {
  return (
    // Header hors du conteneur à padding horizontal : sticky en haut, il
    // doit courir sur toute la largeur de l'écran, pas seulement dans
    // l'espace restant entre les marges px-6 du contenu.
    <div className="flex flex-col pb-8">
      <Header variant="retour" />
      <h1 className="sr-only">Menu</h1>

      <div className="flex flex-col gap-8 px-6 pt-6">
        {/* overflow-hidden + divide-y : coins arrondis sur le groupe entier,
            un simple séparateur fin entre les lignes plutôt qu'une bordure
            par ligne. */}
        <nav className="overflow-hidden rounded-2xl divide-y divide-texte/10 bg-surface">
          {LIENS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              // min-h-12 (48px) : hauteur tactile minimale recommandée.
              className="flex min-h-12 items-center gap-3 px-4 py-3 text-texte"
            >
              <Icon className="h-5 w-5 shrink-0 text-texte/70" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium">{label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-texte/40" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <p className="text-center text-xs text-texte-doux">
          Bolus · version {__APP_VERSION__}
        </p>
      </div>
    </div>
  )
}
