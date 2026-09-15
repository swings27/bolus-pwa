import { useEffect, useState } from 'react'
import { Smartphone, Sun, Moon } from 'lucide-react'
import Header from '../components/layout/Header'
import TitrePage from '../components/layout/TitrePage'
import { useTheme } from '../contexts/ThemeContext'
import type { Theme } from '../contexts/ThemeContext'
import { db } from '../db'
import { oublierVersionCatalogue } from '../hooks/useFichesLoader'
import { estInstallee } from '../utils/plateforme'
import {
  CLE_FICHES_VERSION,
  CLE_FICHES_DATE_CATALOGUE,
  CLE_ONBOARDING_VU,
  CLE_INSTALL_BANNER_MASQUE,
  CLE_THEME,
} from '../db/cles'

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

// Titre des quatre sections de cette page. Local plutôt que partagé : les
// autres écrans de l'app n'ont pas ce niveau de titre, seul Paramètres
// découpe son contenu en rubriques.
function TitreSection({ children }: { children: string }) {
  return <h2 className="font-display text-lg font-semibold text-texte">{children}</h2>
}

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
  const [miseAJourEnCours, setMiseAJourEnCours] = useState(false)
  // Confirmation en deux temps plutôt qu'un window.confirm() : l'action est
  // irréversible, mais aucune boîte de dialogue native n'est utilisée
  // ailleurs dans l'app, et certains navigateurs en PWA les escamotent.
  const [confirmeEffacement, setConfirmeEffacement] = useState(false)
  const [effacementEnCours, setEffacementEnCours] = useState(false)
  const [aideInstallationRetablie, setAideInstallationRetablie] = useState(false)
  // Lu une seule fois au montage : le mode d'affichage ne change pas
  // pendant qu'on consulte cette page.
  const [dejaInstallee] = useState(estInstallee)

  useEffect(() => {
    // Deux lectures indépendantes de la même table : lancées en parallèle
    // plutôt qu'attendues l'une après l'autre (même principe que dans
    // useFichesLoader/InstallBanner).
    Promise.all([
      db.parametres.get(CLE_FICHES_VERSION),
      // Déjà récupérée et mémorisée par useFichesLoader au démarrage de
      // l'app : on la relit dans Dexie plutôt que de re-télécharger
      // /data/version.json, déjà fetché quelques instants plus tôt.
      db.parametres.get(CLE_FICHES_DATE_CATALOGUE),
    ]).then(([paramVersion, paramDateCatalogue]) => {
      if (paramVersion) setVersionFiches(paramVersion.valeur)
      setDateCatalogue(paramDateCatalogue?.valeur ?? 'indisponible')
    })
  }, [])

  // Le chargeur ne compare les versions qu'au démarrage : sans ce bouton,
  // une personne dont le cache est resté sur un catalogue périmé n'a aucun
  // moyen de forcer la resynchronisation. On oublie la version locale puis
  // on recharge — c'est le démarrage suivant qui refait tout le travail,
  // avec sa logique de comparaison inchangée. Les favoris et l'historique
  // ne sont pas touchés.
  async function mettreAJourLesFiches() {
    setMiseAJourEnCours(true)
    await oublierVersionCatalogue()
    window.location.reload()
  }

  async function reafficherAideInstallation() {
    await db.parametres.delete(CLE_INSTALL_BANNER_MASQUE)
    setAideInstallationRetablie(true)
  }

  // Droit d'effacement du RGPD, rendu réellement exerçable : la politique de
  // confidentialité annonce ce droit, mais sa seule mise en œuvre était
  // « supprimez l'application » — pour une PWA, cela veut dire aller vider
  // les données de site dans les réglages du navigateur, une manipulation
  // que personne ne trouve.
  //
  // db.delete() efface la base entière plutôt que les clés une à une : c'est
  // la seule façon de garantir qu'aucune donnée n'est oubliée, y compris une
  // clé qu'un futur ajout introduirait sans penser à cet écran. Le thème vit
  // en double dans localStorage (cache de démarrage anti-flash, voir
  // index.html) et doit donc être retiré séparément. Le catalogue de fiches
  // part avec le reste et sera retéléchargé au rechargement : l'application
  // revient exactement à son état de première ouverture.
  async function effacerMesDonnees() {
    setEffacementEnCours(true)
    localStorage.removeItem(CLE_THEME)
    await db.delete()
    window.location.reload()
  }

  return (
    // Header hors du conteneur à padding horizontal : sticky en haut, il
    // doit courir sur toute la largeur de l'écran, pas seulement dans
    // l'espace restant entre les marges px-6 du contenu.
    <div className="flex flex-col pb-8">
      <Header variant="retour" />

      <div className="flex flex-col gap-8 px-6 pt-6">
        <TitrePage>Paramètres</TitrePage>

        <section className="flex flex-col gap-3">
          <TitreSection>Apparence</TitreSection>

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
          <TitreSection>Informations</TitreSection>
          {/* Plus de ligne "Stockage persistant" : elle affichait un état
              technique du navigateur, que personne ne peut ni interpréter ni
              changer depuis cet écran. L'information reste mémorisée par
              l'app (voir persistance.ts), elle n'est simplement plus
              exposée ici. */}
          <div className="flex flex-col divide-y divide-texte/10">
            <LigneInfo label="Version de l'application" valeur={__APP_VERSION__} />
            <LigneInfo label="Version des fiches" valeur={versionFiches} />
            <LigneInfo label="Catalogue mis à jour le" valeur={dateCatalogue} />
          </div>
          <button
            type="button"
            onClick={mettreAJourLesFiches}
            disabled={miseAJourEnCours}
            className="tactile flex items-center py-3 text-left text-sm"
            style={{ color: 'var(--interactif)' }}
          >
            {miseAJourEnCours ? 'Mise à jour…' : 'Vérifier les mises à jour des fiches'}
          </button>
        </section>

        <section className="flex flex-col gap-1">
          <TitreSection>Aide</TitreSection>
          <div className="flex flex-col divide-y divide-texte/10">
            <button
              type="button"
              // La suppression de la clé suffit : Onboarding lit cette même
              // clé via useLiveQuery et se réaffiche automatiquement dès
              // qu'elle disparaît, sans navigation ni état intermédiaire.
              onClick={() => db.parametres.delete(CLE_ONBOARDING_VU)}
              className="tactile flex items-center py-3 text-left text-sm text-texte"
            >
              Revoir la présentation de l'application →
            </button>
            {/* Masquée quand l'app tourne déjà installée : le bandeau ne
                s'afficherait pas (voir InstallBanner), l'entrée n'aurait
                donc aucun effet visible. */}
            {!dejaInstallee && (
              <button
                type="button"
                // Fermer le bandeau d'installation écrivait une clé que rien
                // ne supprimait ensuite : le geste était définitif, et sur
                // iOS il n'existe aucune invite native pour le rattraper —
                // plus aucun moyen, donc, d'apprendre à installer l'app sur
                // son écran d'accueil.
                onClick={reafficherAideInstallation}
                className="tactile flex flex-col items-start py-3 text-left text-sm text-texte"
              >
                Revoir l'aide à l'installation →
                {/* Le bandeau n'apparaît qu'à partir de la 2e session et
                    seulement là où une installation est possible : sans ce
                    retour, l'appui restait parfois sans effet visible et
                    passait pour un bouton mort. */}
                {aideInstallationRetablie && (
                  <span className="pt-1 text-xs text-texte-doux">
                    L'aide réapparaîtra au prochain lancement de l'application.
                  </span>
                )}
              </button>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-1">
          <TitreSection>Mes données</TitreSection>
          <p className="pb-1 text-xs text-texte-doux">
            Favoris, fiches consultées, préférences et catalogue hors ligne. Tout est stocké sur cet
            appareil uniquement.
          </p>
          <button
            type="button"
            onClick={() => (confirmeEffacement ? effacerMesDonnees() : setConfirmeEffacement(true))}
            disabled={effacementEnCours}
            className="tactile flex items-center py-3 text-left text-sm font-medium"
            style={{ color: 'var(--alerte)' }}
          >
            {effacementEnCours
              ? 'Effacement…'
              : confirmeEffacement
                ? 'Confirmer : tout effacer définitivement'
                : 'Effacer mes données locales'}
          </button>
          {confirmeEffacement && !effacementEnCours && (
            <button
              type="button"
              onClick={() => setConfirmeEffacement(false)}
              className="tactile flex items-center py-2 text-left text-sm text-texte-doux"
            >
              Annuler
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
