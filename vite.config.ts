import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Vite est un outil de build : contrairement à Create React App (webpack),
// il sert les fichiers en dev via ES modules natifs du navigateur (démarrage
// quasi instantané, pas de bundle complet recalculé à chaque sauvegarde),
// puis bundle tout avec Rollup pour la prod. Sa config se fait ici, par plugins.
// https://vite.dev/config/
const { version: appVersion } = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  // "define" remplace __APP_VERSION__ par la vraie version, en dur, dans le
  // bundle final au moment du build — pas d'appel réseau ni de lecture de
  // fichier à l'exécution. Le type de cette constante globale est déclaré
  // dans src/vite-env.d.ts pour que TypeScript l'accepte.
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react(),
    // Plugin officiel Tailwind v4 : remplace l'ancien pipeline PostCSS,
    // Tailwind est directement intégré au pipeline de build de Vite.
    tailwindcss(),
    VitePWA({
      // "generateSW" : Workbox génère automatiquement le Service Worker
      // (le script qui tourne en arrière-plan dans le navigateur et
      // intercepte les requêtes réseau pour servir du cache hors-ligne).
      // Alternative "injectManifest" = on écrit le SW à la main ; ici on
      // laisse Workbox faire le travail, ce qui suffit pour nos besoins.
      //
      // registerType "prompt" (pas "autoUpdate") : un nouveau déploiement ne
      // doit jamais recharger l'application dans le dos de l'utilisatrice —
      // inacceptable si elle consulte une fiche en pleine préparation de
      // médicament. Le Service Worker télécharge la nouvelle version en
      // arrière-plan et attend une action explicite (voir UpdateBanner.tsx,
      // qui appelle updateServiceWorker()).
      registerType: 'prompt',
      // injectRegister à false : UpdateBanner.tsx enregistre lui-même le
      // Service Worker via le hook useRegisterSW() (virtual:pwa-register/
      // react). Laisser le plugin injecter EN PLUS son propre script
      // d'enregistrement dans index.html ferait doublon (deux enregistrements
      // concurrents du même Service Worker).
      injectRegister: false,
      // includeAssets : fichiers statiques de /public à précacher au même
      // titre que les icônes du manifest, pour qu'ils restent disponibles
      // hors-ligne dès l'installation du Service Worker.
      includeAssets: [
        'bolus-icone-192.png',
        'bolus-icone-512.png',
        'bolus-wordmark-clair.svg',
        'bolus-wordmark-sombre.svg',
        'apple-touch-icon.png',
        'bolus-favicon.svg',
      ],
      manifest: {
        name: 'Bolus',
        short_name: 'Bolus',
        description: 'Fiches médicaments et calculateurs pour infirmiers',
        lang: 'fr',
        theme_color: '#C65D3B',
        background_color: '#FAF3E7',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/bolus-icone-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/bolus-icone-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // runtimeCaching définit comment le Service Worker doit gérer
        // les requêtes réseau une fois l'app installée / hors-ligne.
        runtimeCaching: [
          {
            // Les fiches médicaments sont stockées en JSON statique dans
            // /data/. On les met en cache pour un accès hors-ligne fiable.
            urlPattern: /\/data\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            // StaleWhileRevalidate : sert la version en cache immédiatement
            // (rapide, marche hors-ligne), puis va chercher la version
            // réseau en arrière-plan pour mettre à jour le cache pour la
            // prochaine fois. Compromis idéal pour des données qui changent
            // rarement (fiches médicaments) mais doivent rester à jour.
            options: {
              cacheName: 'bolus-data-json',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
              },
            },
          },
        ],
      },
    }),
  ],
})
