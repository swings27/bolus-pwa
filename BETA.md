# À retirer avant le lancement public

- [ ] `public/robots.txt` — supprimer le `Disallow`
- [ ] `index.html` — retirer la balise `<meta name="robots" content="noindex, nofollow">`
- [ ] `src/data/editeur.ts` — passer `DONNEES_MOCK` à `false`
      (fait disparaître `BandeauBeta.tsx` ; rend au `Header` sa gestion normale
      de la zone sûre iOS, aucun autre changement de code nécessaire — les deux
      sont pilotés par ce même booléen)
- [ ] `src/data/editeur.ts` — passer `MODE_BETA` à `false`
      (retire aussi le bouton de retour bêta)
- [ ] `public/data/fiches-v1.json` — remplacer les mocks par les fiches validées
- [ ] `src/data/editeur.ts` — compléter les champs `[À COMPLÉTER...]`
      (nom, SIRET, adresse)
- [ ] Vérifier que `npm run build:prod` passe

Ce fichier évite d'oublier un élément au moment du lancement, quand la
pression sera forte.
