import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Mail, Globe, Link2, ChevronRight, AlertTriangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import PageDocument from '../components/layout/PageDocument'
import BlocAvertissement from '../components/layout/BlocAvertissement'
import { APP } from '../data/editeur'
import { construireMailtoRetour } from '../utils/retourBeta'

interface ILienContact {
  icon: LucideIcon
  label: string
  href: string
  externe?: boolean
}

const LIENS_CONTACT: ILienContact[] = [
  { icon: Mail, label: APP.contact, href: `mailto:${APP.contact}` },
  { icon: Globe, label: 'bolus-app.fr', href: APP.siteWeb, externe: true },
  {
    // Link2 (icône générique de lien) : cette version de lucide-react
    // n'inclut aucune icône de marque (ni LinkedIn, ni X/Twitter).
    icon: Link2,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/bolus-app-infirmiers/',
    externe: true,
  },
  // X/Twitter : à ajouter ici une fois le compte de l'application prêt
  // (compte actuel, lié au site : https://x.com/Swings27x), même forme que
  // les lignes ci-dessus.
]

export default function Contact() {
  const location = useLocation()
  const [hrefErreur, setHrefErreur] = useState<string | null>(null)

  // Même gabarit contextualisé (version app/fiches, écran, appareil) que le
  // bouton flottant de retour bêta, mais avec un sujet dédié et un champ
  // "Molécule concernée" en tête de corps — ce lien vit en dehors du mode
  // bêta, il reste donc utile après la fin de celle-ci.
  useEffect(() => {
    let annule = false
    construireMailtoRetour({
      sujet: 'Bolus — Erreur de fiche',
      route: location.pathname,
      enTete: 'Molécule concernée :',
    }).then((url) => {
      if (!annule) setHrefErreur(url)
    })
    return () => {
      annule = true
    }
  }, [location.pathname])

  return (
    <PageDocument titre="Contact">
      <p className="text-base leading-relaxed text-texte">
        Une question, une erreur repérée dans une fiche, une molécule qui vous manque ? Écrivez-moi
        directement, je lis tout.
      </p>

      <nav className="overflow-hidden rounded-2xl divide-y divide-texte/10 bg-surface">
        {LIENS_CONTACT.map(({ icon: Icon, label, href, externe }) => (
          <a
            key={href}
            href={href}
            {...(externe ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            // min-h-14 (56px) : hauteur tactile confortable pour une ligne de
            // contact, plus généreuse que le min-h-12 des liens du Menu.
            className="tactile flex min-h-14 items-center gap-3 px-4 py-3 text-texte"
          >
            <Icon className="h-5 w-5 shrink-0 text-texte/70" aria-hidden="true" />
            <span className="flex-1 text-base font-medium">{label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-texte/40" aria-hidden="true" />
          </a>
        ))}
      </nav>

      <BlocAvertissement icone={AlertTriangle} couleur="var(--alerte)">
        <div className="flex flex-col gap-2">
          <p className="text-sm leading-relaxed text-texte">
            <span className="font-semibold">Signaler une erreur dans une fiche</span>
            <br />
            Toute erreur signalée est vérifiée contre le RCP source avant correction.
          </p>
          {hrefErreur && (
            <a
              href={hrefErreur}
              className="tactile self-start rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ backgroundColor: 'var(--alerte)', color: 'var(--fond)' }}
            >
              Signaler une erreur
            </a>
          )}
        </div>
      </BlocAvertissement>
    </PageDocument>
  )
}
