import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import BoutonPrimaire from './BoutonPrimaire'

interface IErrorBoundaryProps {
  children: ReactNode
}

interface IErrorBoundaryState {
  erreur: Error | null
}

// Les error boundaries ne peuvent pas être écrites avec des hooks : seul un
// composant de classe peut implémenter getDerivedStateFromError /
// componentDidCatch, les deux méthodes du cycle de vie React qui
// interceptent une erreur de rendu dans l'arbre des enfants avant qu'elle
// ne fasse planter toute l'application sur un écran blanc.
export default class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  state: IErrorBoundaryState = { erreur: null }

  static getDerivedStateFromError(erreur: Error): IErrorBoundaryState {
    return { erreur }
  }

  componentDidCatch(erreur: Error, info: ErrorInfo) {
    // console.error plutôt qu'un envoi vers un service de suivi d'erreurs :
    // l'app ne collecte aucune donnée (voir Confidentialite.tsx), pas
    // question d'y ajouter une télémétrie d'erreurs à son insu.
    console.error('Erreur non interceptée :', erreur, info.componentStack)
  }

  render() {
    if (!this.state.erreur) return this.props.children

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fond px-6 text-center">
        <AlertTriangle className="h-10 w-10 text-alerte" aria-hidden="true" />
        <h1 className="font-display text-xl font-semibold text-texte">Une erreur est survenue</h1>
        <p className="max-w-xs text-sm text-texte-doux">
          L'application a rencontré un problème inattendu.
        </p>
        <BoutonPrimaire onClick={() => window.location.reload()}>Recharger l'application</BoutonPrimaire>
        {/* Uniquement en développement : jamais la stack technique devant
            une utilisatrice en production. */}
        {import.meta.env.DEV && (
          <pre className="mt-4 max-w-full overflow-x-auto rounded-lg bg-surface p-3 text-left font-mono text-xs text-texte">
            {this.state.erreur.message}
            {'\n'}
            {this.state.erreur.stack}
          </pre>
        )}
      </div>
    )
  }
}
