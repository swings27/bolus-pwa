import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Position de scroll par clé de route (useLocation().key), en mémoire pour
// la durée de la session — pas besoin de survivre à un rechargement complet,
// seulement aux allers-retours entre routes pendant que l'app reste ouverte.
const positions = new Map<string, number>()

// Une liste dont les données viennent de Dexie (useLiveQuery) ou une fiche
// (useFiche) rendent d'abord un état vide/chargement, plus court que le
// contenu final — au moment où l'effet ci-dessous s'exécute, la page n'est
// souvent pas encore assez haute pour atteindre la position sauvegardée, et
// window.scrollTo se contente alors de clamper à la hauteur disponible. On
// réapplique donc la cible sur quelques frames, le temps que le contenu
// réel se rende et que la page retrouve sa hauteur d'origine.
function restaurerScroll(y: number, framesRestants = 15) {
  window.scrollTo(0, y)
  if (framesRestants <= 0) return
  requestAnimationFrame(() => restaurerScroll(y, framesRestants - 1))
}

// React Router ne restaure pas la position de scroll entre deux navigations
// (contrairement à un site multi-pages classique) : sans ce hook, revenir
// en arrière depuis une fiche vers une longue liste (catégorie, recherche...)
// rouvre tout en haut, obligeant à tout redéfiler à chaque aller-retour.
//
// Appelé une seule fois dans le Layout principal (qui, lui, ne démonte
// jamais entre deux navigations puisqu'il englobe toutes les routes via
// <Outlet/>) plutôt que dans chaque page individuellement.
export function useScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType() // 'POP' | 'PUSH' | 'REPLACE'
  // Ref (pas state) : dit à l'écouteur de scroll ci-dessous à quelle route
  // attribuer la position actuelle, sans déclencher de re-render.
  const cleActuelle = useRef(location.key)

  // Piège essentiel : on ne peut PAS se contenter de lire window.scrollY
  // "à la sortie" d'une route (ex. dans le retour d'un useEffect déclenché
  // par le changement de location.key). À ce moment-là, React a déjà
  // remplacé le contenu de l'ancienne route par celui de la nouvelle dans
  // le DOM (même Layout, seul l'Outlet change) — si la nouvelle page est
  // plus courte, le navigateur a déjà re-calé le scroll en conséquence
  // (et déclenché son propre événement "scroll"), donc lire scrollY à ce
  // stade renvoie la position de la nouvelle page, pas de l'ancienne.
  //
  // Solution : un écouteur de scroll permanent qui tient la position à
  // jour en continu, PENDANT que l'utilisateur est sur la page — la valeur
  // est donc déjà correcte avant même qu'une navigation ne commence.
  useEffect(() => {
    function gererScroll() {
      positions.set(cleActuelle.current, window.scrollY)
    }
    window.addEventListener('scroll', gererScroll, { passive: true })
    return () => window.removeEventListener('scroll', gererScroll)
  }, [])

  // useLayoutEffect (pas useEffect) : cleActuelle doit pointer vers la
  // NOUVELLE route avant que le navigateur ne peigne son contenu — c'est ce
  // repeint qui peut provoquer le recalage de scroll parasite évoqué
  // ci-dessus. S'il survient après cette mise à jour (toujours le cas avec
  // useLayoutEffect, qui s'exécute avant le paint), l'écouteur l'attribue
  // à la bonne clé et ne corrompt jamais la position déjà enregistrée pour
  // la route qu'on vient de quitter.
  useLayoutEffect(() => {
    cleActuelle.current = location.key

    if (navigationType === 'POP') {
      // Navigation arrière/avant dans l'historique : on restaure la
      // position connue pour cette route (0 si elle n'a jamais été
      // quittée, ex. tout premier chargement direct sur cette URL).
      restaurerScroll(positions.get(location.key) ?? 0)
    } else {
      // Nouvelle navigation (PUSH) ou remplacement (REPLACE) : toujours en
      // haut, comme l'ouverture d'une nouvelle page — que ce soit en
      // ouvrant une fiche depuis une liste ou en changeant d'onglet dans
      // la BottomNavBar.
      window.scrollTo(0, 0)
    }
  }, [location.key, navigationType])
}
