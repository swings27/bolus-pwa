import PageDocument from '../components/layout/PageDocument'
import SectionDocument from '../components/layout/SectionDocument'
import { EDITEUR } from '../data/editeur'

// Date de dernière modification du texte — à mettre à jour manuellement si
// son contenu change. Ne doit JAMAIS être recalculée à partir de la date du
// jour : "à jour aujourd'hui" est vrai tous les jours et n'informe de rien
// sur quand ce document a réellement été revu. Même convention que
// DATE_MISE_A_JOUR_CGU dans CGU.tsx.
const DATE_MISE_A_JOUR = '15 septembre 2026'

export default function Confidentialite() {
  return (
    <PageDocument titre="Politique de confidentialité">
      <p className="text-sm" style={{ color: 'var(--texte-doux)' }}>
        Dernière mise à jour : {DATE_MISE_A_JOUR}.
      </p>

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
          (IndexedDB, et localStorage pour la seule préférence de thème) :
        </p>
        <ul className="flex flex-col gap-2 pl-5 list-disc">
          <li>votre préférence de thème (clair, sombre ou automatique) ;</li>
          <li>la liste des fiches que vous avez mises en favori ;</li>
          <li>la liste des dernières fiches que vous avez consultées ;</li>
          <li>la date d'acceptation de l'avertissement d'usage ;</li>
          <li>la date à laquelle la présentation de l'application vous a été montrée ;</li>
          <li>le nombre de fois où vous avez ouvert l'application ;</li>
          <li>le fait que vous ayez fermé la proposition d'installation ;</li>
          <li>
            la version du catalogue de fiches installée sur votre appareil, sa date de publication,
            et le résultat de la demande de conservation hors ligne.
          </li>
        </ul>
        <p>
          Ces données ne quittent jamais votre appareil et ne sont accessibles à personne d'autre
          que vous. Elles ne sont jamais transmises, ni à l'éditrice, ni à un tiers.
        </p>
      </SectionDocument>

      <SectionDocument titre="Mesure d'audience">
        <p>
          Bolus utilise Vercel Analytics, une mesure d'audience sans cookie et sans identifiant
          individuel. Aucune donnée permettant de vous identifier n'est collectée, c'est la
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
          ci-dessus.
        </p>
        <p>
          Pour toute question : {EDITEUR.email}.
        </p>
      </SectionDocument>

    </PageDocument>
  )
}
