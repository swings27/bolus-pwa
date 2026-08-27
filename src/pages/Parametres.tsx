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
  const [stockagePersistant, setStockagePersistant] = useState('—')

  useEffect(() => {
    db.parametres.get('fiches_version').then((param) => {
      if (param) setVersionFiches(param.valeur)
    })

    // Déjà récupérée et mémorisée par useFichesLoader au démarrage de
    // l'app : on la relit dans Dexie plutôt que de re-télécharger
    // /data/version.json, déjà fetché quelques instants plus tôt.
    db.parametres.get('fiches_date_catalogue').then((param) => {
      setDateCatalogue(param?.valeur ?? 'indisponible')
    })

    // Résultat déjà mémorisé par la demande faite au démarrage de l'app
    // (voir App.tsx / src/utils/persistance.ts) — on le relit ici plutôt
    // que de rappeler navigator.storage.persist() une deuxième fois.
    db.parametres.get('stockage_persistant').then((param) => {
      if (param) setStockagePersistant(param.valeur === 'true' ? 'accordé' : 'non accordé')
    })
  }, [])

  return (
    // Header hors du conteneur à padding horizontal : sticky en haut, il
    // doit courir sur toute la largeur de l'écran, pas seulement dans
    // l'espace restant entre les marges px-6 du contenu.
    <div className="flex flex-col pb-8">
      <Header variant="retour" />

      <div className="flex flex-col gap-8 px-6 pt-6">
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
            <LigneInfo label="Stockage persistant" valeur={stockagePersistant} />
          </div>
        </section>
      </div>
    </div>
  )
}
