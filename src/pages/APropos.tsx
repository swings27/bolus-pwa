import PageDocument from '../components/layout/PageDocument'
import SectionDocument from '../components/layout/SectionDocument'

export default function APropos() {
  return (
    <PageDocument titre="À propos">
      <SectionDocument titre="Pourquoi Bolus">
        <p>
          Combien de fois une infirmier.e ou sage-femme s'est retrouvé en garde, une seringue à
          la main, à chercher une information de dilution introuvable au bon moment ? Le protocole
          du service est photographié sur un téléphone personnel, la note griffonnée sur un
          post-it a disparu, et l'ordinateur du poste de soins met trente secondes à afficher une
          page.
        </p>
        <p>
          Bolus est né de ce besoin très concret : avoir une information fiable, tout de suite,
          sans naviguer dans dix onglets ni déranger un collègue en pleine prise en charge.
        </p>
      </SectionDocument>

      <SectionDocument titre="Qui est derrière Bolus">
        <p>
          Bolus est développé par Anna Trabaud-Lopez, infirmière diplômée d'État depuis 2017, avec
          plusieurs années d'expérience en service d'urgences. C'est ce terrain qui a façonné
          l'application : chaque écran répond à une question qu'elle s'est elle-même posée en
          exercice.
        </p>
        <p>
          Elle s'est ensuite formée au développement pour pouvoir construire elle-même l'outil qui
          lui manquait sur le terrain. « Ce n'est pas une reconversion. C'est une trajectoire. »
          Bolus reste pensé par une infirmière d'urgences, pour des soignants qui n'ont pas le
          droit à l'erreur.
        </p>
      </SectionDocument>

      <SectionDocument titre="Comment les fiches sont construites">
        <p>
          Chaque fiche médicament de Bolus est construite à partir d'une source unique : les RCP
          (Résumés des Caractéristiques du Produit) publiés par l'ANSM (Agence Nationale de
          Sécurité du Médicament et des produits de santé).
        </p>
        <ul className="flex flex-col gap-2 pl-5 list-disc">
          <li>Aucune donnée issue de bases commerciales.</li>
          <li>Chaque fiche porte sa source et sa date de dernière révision.</li>
          <li>Le catalogue est mis à jour trimestriellement.</li>
        </ul>
      </SectionDocument>

      <SectionDocument titre="Ce que Bolus n'est pas">
        <p>C'est aussi une question de clarté sur ce que l'application fait, et ne fait pas :</p>
        <ul className="flex flex-col gap-2 pl-5 list-disc">
          <li>Bolus n'est pas un dispositif médical.</li>
          <li>Bolus n'est pas un outil d'aide à la décision.</li>
          <li>
            Bolus ne se substitue ni à la prescription médicale, ni au contrôle infirmier — il les
            accompagne.
          </li>
        </ul>
      </SectionDocument>
    </PageDocument>
  )
}
