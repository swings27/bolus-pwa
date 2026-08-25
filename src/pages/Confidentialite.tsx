import PageDocument from '../components/layout/PageDocument'
import SectionDocument from '../components/layout/SectionDocument'
import { APP } from '../data/editeur'

export default function Confidentialite() {
  return (
    <PageDocument titre="Politique de confidentialité">
      <SectionDocument titre="En résumé">
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: 'var(--bloc-antidote)', borderColor: 'var(--validation)' }}
        >
          <p className="text-base leading-relaxed text-texte">
            Bolus ne collecte aucune donnée personnelle. Aucun compte n'est requis. Aucune donnée
            patient n'est saisie ni transmise. Vos préférences d'affichage restent sur votre
            appareil.
          </p>
        </div>
      </SectionDocument>

      <SectionDocument titre="Données traitées">
        <p>
          Bolus ne traite que des données locales, stockées dans le navigateur de votre appareil
          via IndexedDB :
        </p>
        <ul className="flex flex-col gap-2 pl-5 list-disc">
          <li>votre préférence de thème (clair, sombre ou automatique) ;</li>
          <li>la date d'acceptation de l'avertissement d'usage ;</li>
          <li>la version du catalogue de fiches installée sur votre appareil.</li>
        </ul>
        <p>
          Ces données ne quittent jamais votre appareil et ne sont accessibles à personne d'autre
          que vous.
        </p>
      </SectionDocument>

      <SectionDocument titre="Mesure d'audience">
        <p>
          Bolus utilise Vercel Analytics, une mesure d'audience sans cookie et sans identifiant
          individuel. Aucune donnée permettant de vous identifier n'est collectée — c'est la
          raison pour laquelle aucune bannière de consentement n'est affichée.
        </p>
      </SectionDocument>

      <SectionDocument titre="Absence de données de santé">
        <p>
          Bolus ne collecte aucune donnée patient ni aucune donnée nominative. L'application
          n'entre donc pas dans le champ de l'hébergement de données de santé (HDS). Les
          calculateurs n'enregistrent aucune des valeurs que vous saisissez : elles ne servent
          qu'à afficher un résultat, puis sont oubliées à la fermeture.
        </p>
      </SectionDocument>

      <SectionDocument titre="Vos droits">
        <p>
          Conformément au RGPD (Règlement Général sur la Protection des Données), vous disposez de
          droits d'accès, de rectification, d'effacement et d'opposition. En pratique, la
          suppression de l'application efface l'intégralité des données locales décrites
          ci-dessus. Pour toute question : {APP.contact}.
        </p>
      </SectionDocument>

      <SectionDocument titre="Évolutions">
        <p>
          Une future version de Bolus proposera un compte utilisateur optionnel. Cette politique
          de confidentialité sera alors mise à jour, et vous en serez informée avant toute
          collecte de données.
        </p>
      </SectionDocument>
    </PageDocument>
  )
}
