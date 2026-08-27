import { FileQuestion } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import EtatVide from '../components/layout/EtatVide'
import BoutonPrimaire from '../components/layout/BoutonPrimaire'

export default function Introuvable() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col">
      <Header variant="logo" />
      {/* sr-only : EtatVide affiche déjà "Page introuvable" visuellement
          (comme titre visuel de l'état vide), mais sans balise de titre —
          ce h1 lui donne sa place dans la hiérarchie de la page sans
          dupliquer le texte à l'écran. */}
      <h1 className="sr-only">Page introuvable</h1>
      <EtatVide
        icone={FileQuestion}
        titre="Page introuvable"
        description="Cette page n'existe pas ou a été déplacée."
      />
      <div className="flex justify-center pb-8">
        <BoutonPrimaire onClick={() => navigate('/')}>Retour à l'accueil</BoutonPrimaire>
      </div>
    </div>
  )
}
