import PageDocument from '../components/layout/PageDocument'
import SectionDocument from '../components/layout/SectionDocument'
import { EDITEUR, HEBERGEUR } from '../data/editeur'

export default function MentionsLegales() {
  return (
    <PageDocument titre="Mentions légales">
      <SectionDocument titre="Éditeur de l'application">
        <p>
          {EDITEUR.nom}
          <br />
          {EDITEUR.statut}
          <br />
          SIRET : {EDITEUR.siret}
          <br />
          {EDITEUR.adresse}
          <br />
          Email : {EDITEUR.email}
          <br />
          Directeur de la publication : {EDITEUR.directeurPublication}
        </p>
      </SectionDocument>

      <SectionDocument titre="Hébergement">
        <p>
          {HEBERGEUR.nom}
          <br />
          {HEBERGEUR.adresse}
          <br />
          {HEBERGEUR.site}
        </p>
        <p>
          Les fichiers de contenu de l'application (fiches médicaments, code, ressources
          statiques) sont servis depuis le réseau de diffusion de contenu de Vercel.
        </p>
      </SectionDocument>

      <SectionDocument titre="Propriété intellectuelle">
        <p>
          La structure, le contenu éditorial, la charte graphique et le nom Bolus sont protégés.
          Toute reproduction ou réutilisation sans autorisation préalable est interdite.
        </p>
        <p>
          Les RCP (Résumés des Caractéristiques du Produit) cités sont des documents publics de
          l'ANSM, librement réutilisables. Les noms de spécialités pharmaceutiques mentionnés dans
          l'application sont des marques déposées par leurs laboratoires respectifs, cités à titre
          informatif.
        </p>
      </SectionDocument>

      <SectionDocument titre="Nature de l'application">
        <p>
          Bolus est un outil documentaire de consultation. Il ne constitue pas un dispositif
          médical au sens du règlement européen (UE) 2017/745. Il ne produit aucune recommandation
          thérapeutique, aucun diagnostic et aucune adaptation posologique.
        </p>
      </SectionDocument>

      <SectionDocument titre="Responsabilité">
        <p>
          L'utilisation des informations disponibles dans Bolus relève de la responsabilité du
          professionnel de santé. L'éditrice met en œuvre les moyens raisonnables pour garantir
          l'exactitude des données, sans garantie d'exhaustivité ni d'actualité permanente. En cas
          de doute, la vérification auprès de la source reste recommandée.
        </p>
      </SectionDocument>

      <SectionDocument titre="Droit applicable">
        <p>
          Les présentes mentions légales sont soumises au droit français. Tout litige relève de la
          compétence des tribunaux français.
        </p>
      </SectionDocument>
    </PageDocument>
  )
}
