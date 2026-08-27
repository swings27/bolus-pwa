// Premier jet de CGU — à faire relire par un ou une juriste avant tout
// lancement public de l'application, en particulier les clauses de
// limitation de responsabilité : point sensible pour un outil documentaire
// à destination de professionnels de santé, dont l'usage réel peut avoir
// des conséquences cliniques.

import PageDocument from '../components/layout/PageDocument'
import SectionDocument from '../components/layout/SectionDocument'

// Date de dernière modification du texte des CGU — à mettre à jour
// manuellement si leur contenu change. Ne doit JAMAIS être recalculée à
// partir de la date du jour : "en vigueur aujourd'hui" est vrai tous les
// jours et n'informe de rien sur quand ces conditions ont réellement été
// fixées.
const DATE_MISE_A_JOUR_CGU = '26 août 2026'

export default function CGU() {
  return (
    <PageDocument titre="Conditions générales d'utilisation">
      <p className="text-sm" style={{ color: 'var(--texte-doux)' }}>
        Version en vigueur au {DATE_MISE_A_JOUR_CGU}.
      </p>

      <SectionDocument titre="Objet">
        <p>
          Les présentes conditions générales d'utilisation définissent les modalités d'accès et
          d'utilisation de l'application Bolus, un outil documentaire destiné aux professionnels
          de santé.
        </p>
      </SectionDocument>

      <SectionDocument titre="Accès au service">
        <p>
          L'accès à Bolus est gratuit, ne nécessite aucune création de compte et n'engage à rien.
          L'utilisation de l'application vaut acceptation pleine et entière des présentes
          conditions.
        </p>
      </SectionDocument>

      <SectionDocument titre="Public visé">
        <p>
          Bolus est destiné aux professionnels de santé : infirmiers, infirmières et sages-femmes.
          L'application n'est pas destinée au grand public ni aux patients, et ne doit pas être
          utilisée comme telle.
        </p>
      </SectionDocument>

      <SectionDocument titre="Utilisation conforme">
        <p>
          L'utilisateur reste seul responsable de l'usage qu'il fait des informations fournies par
          Bolus et de la vérification des données auprès des sources officielles avant toute
          application clinique.
        </p>
      </SectionDocument>

      <SectionDocument titre="Limitation de responsabilité">
        <p>
          Bolus est un outil d'aide documentaire, fourni avec une obligation de moyens et non de
          résultat. L'éditrice ne saurait être tenue responsable d'une utilisation des
          informations fournies qui ne respecterait pas les recommandations d'usage rappelées dans
          l'application et dans les présentes conditions.
        </p>
      </SectionDocument>

      <SectionDocument titre="Propriété intellectuelle">
        <p>
          L'ensemble des éléments de l'application (structure, contenu éditorial, charte
          graphique, nom Bolus) est protégé. Toute reproduction ou réutilisation sans autorisation
          préalable est interdite.
        </p>
      </SectionDocument>

      <SectionDocument titre="Disponibilité du service">
        <p>
          L'éditrice s'efforce d'assurer un accès continu à Bolus, sans garantie de disponibilité
          permanente. Des interruptions peuvent survenir, notamment pour des opérations de
          maintenance.
        </p>
      </SectionDocument>

      <SectionDocument titre="Modification des conditions">
        <p>
          Les présentes conditions peuvent évoluer. La version applicable est celle affichée dans
          l'application au moment de son utilisation.
        </p>
      </SectionDocument>

      <SectionDocument titre="Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. Tout litige relève de la
          compétence des tribunaux français.
        </p>
      </SectionDocument>
    </PageDocument>
  )
}
