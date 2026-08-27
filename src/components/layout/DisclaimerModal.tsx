import { useEffect, useRef, useState } from 'react'
import { db } from '../../db'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { CLE_DISCLAIMER_ACCEPTE } from '../../db/cles'

// On persiste l'acceptation dans Dexie (IndexedDB) plutôt que dans
// localStorage pour deux raisons :
// 1. Cohérence : toutes les données locales de l'app (fiches, préférences)
//    vivent dans la même base IndexedDB via Dexie — un seul système de
//    stockage à gérer, une seule source de vérité.
// 2. Fiabilité hors-ligne/PWA : IndexedDB est conçu pour stocker des
//    volumes de données plus importants et est la base du fonctionnement
//    offline-first ; localStorage est synchrone et bloquant, IndexedDB
//    (via Dexie) est asynchrone et ne gèle pas le thread principal.
export default function DisclaimerModal() {
  // null = "on ne sait pas encore" (vérification en cours), évite un flash
  // du modal le temps de lire la base au montage.
  const [accepte, setAccepte] = useState<boolean | null>(null)
  const [caseCochee, setCaseCochee] = useState(false)
  const conteneurRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    db.parametres.get(CLE_DISCLAIMER_ACCEPTE).then((param) => {
      setAccepte(param !== undefined)
    })
  }, [])

  useFocusTrap(accepte === false, conteneurRef)

  async function accepter() {
    await db.parametres.put({
      cle: CLE_DISCLAIMER_ACCEPTE,
      valeur: new Date().toISOString(),
    })
    setAccepte(true)
  }

  // Rien à afficher tant qu'on vérifie, ou si déjà accepté.
  if (accepte !== false) return null

  return (
    // z-[60] : au-dessus de la BottomNavBar (z-50, dont le bouton
    // Calculateur dépasse volontairement de la barre) — une modale reste
    // toujours au-dessus de la navigation.
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-texte/60 p-4">
      <div
        ref={conteneurRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-titre"
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl"
      >
        <h2 id="disclaimer-titre" className="text-lg font-semibold text-texte">
          Avertissement
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-texte/80">
          Bolus est un outil d'aide destiné aux professionnels de santé. Il
          ne remplace ni le jugement clinique de l'infirmier ou de
          l'infirmière, ni la prescription médicale. L'administration d'un
          médicament reste sous la responsabilité du professionnel de
          santé.
        </p>

        <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-texte">
          <input
            type="checkbox"
            checked={caseCochee}
            onChange={(e) => setCaseCochee(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-interactif"
          />
          J'ai lu et je comprends cet avertissement.
        </label>

        <button
          type="button"
          disabled={!caseCochee}
          onClick={accepter}
          className="mt-5 w-full rounded-lg bg-interactif py-3 text-sm font-medium text-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          J'ai compris et j'accepte
        </button>
      </div>
    </div>
  )
}
