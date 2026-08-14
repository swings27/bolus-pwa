import { useEffect, useState } from 'react'
import { Smartphone, Sun, Moon } from 'lucide-react'
import Header from '../components/layout/Header'
import { useTheme } from '../contexts/ThemeContext'
import type { Theme } from '../contexts/ThemeContext'
import { db } from '../db'

interface IOptionTheme {
  valeur: Theme
  label: string
  icon: typeof Smartphone
}

const OPTIONS_THEME: IOptionTheme[] = [
  { valeur: 'auto', label: 'Automatique', icon: Smartphone },
  { valeur: 'clair', label: 'Clair', icon: Sun },
  { valeur: 'sombre', label: 'Sombre', icon: Moon },
]

// Ligne "libellé à gauche / valeur à droite" de la section Informations.
function LigneInfo({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-texte">{label}</span>
      <span className="text-sm text-texte-doux">{valeur}</span>
    </div>
  )
}

export default function Parametres() {
  const { theme, setTheme } = useTheme()
  const [versionFiches, setVersionFiches] = useState('—')
  const [dateCatalogue, setDateCatalogue] = useState('—')

  useEffect(() => {
    db.parametres.get('fiches_version').then((param) => {
      if (param) setVersionFiches(param.valeur)
    })

    fetch('/data/version.json')
      .then((reponse) => reponse.json())
      .then((data: { datefiches: string }) => setDateCatalogue(data.datefiches))
      .catch(() => setDateCatalogue('indisponible'))
  }, [])

  return (
    <div className="flex flex-col gap-8 px-6 pb-8">
      <Header variant="retour" />
      <h1 className="font-display text-2xl font-semibold text-texte">Paramètres</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-semibold text-texte">Apparence</h2>

        <div className="grid grid-cols-3 gap-2">
          {OPTIONS_THEME.map(({ valeur, label, icon: Icon }) => {
            const actif = theme === valeur
            return (
              <button
                key={valeur}
                type="button"
                onClick={() => setTheme(valeur)}
                aria-pressed={actif}
                className="flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-colors"
                style={
                  actif
                    ? { backgroundColor: 'var(--interactif)', color: 'var(--fond)', borderColor: 'var(--interactif)' }
                    : { backgroundColor: 'var(--surface)', color: 'var(--texte)', borderColor: 'color-mix(in srgb, var(--texte) 20%, transparent)' }
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </div>

        <p className="text-xs text-texte-doux">
          Automatique suit le réglage de votre téléphone.
        </p>
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-semibold text-texte">Informations</h2>
        <div className="flex flex-col divide-y divide-texte/10">
          <LigneInfo label="Version de l'application" valeur={__APP_VERSION__} />
          <LigneInfo label="Version des fiches" valeur={versionFiches} />
          <LigneInfo label="Catalogue mis à jour le" valeur={dateCatalogue} />
        </div>
      </section>
    </div>
  )
}
