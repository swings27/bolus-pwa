import { defineConfig } from 'vitest/config'

// Config Vitest séparée de vite.config.ts plutôt que fusionnée : les tests
// ci-dessous ne portent que sur de la logique pure (calculateurs, règles
// métier favoris/historique, helpers de catégories), sans DOM ni rendu de
// composant — inutile de charger les plugins Tailwind/PWA du build réel
// pour ça. Environnement "node" (pas "jsdom") pour la même raison.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
