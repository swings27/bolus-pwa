interface ISourcesFicheProps {
  sources: string[]
  dateRevision: string
}

// Reformate une date ISO ("2026-08-13") en JJ/MM/AAAA par découpage de
// chaîne plutôt que via `new Date(...).getDate()` : ce dernier interprète
// la date comme UTC minuit puis relit le jour dans le fuseau local, ce qui
// peut faire glisser le jour affiché d'une unité selon le fuseau de
// l'utilisateur. Une date de révision clinique doit rester exacte.
function formatDateFr(iso: string): string {
  const correspondance = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!correspondance) return iso
  const [, aaaa, mm, jj] = correspondance
  return `${jj}/${mm}/${aaaa}`
}

export default function SourcesFiche({ sources, dateRevision }: ISourcesFicheProps) {
  // Garde-fou : une fiche encore marquée MOCK dans ses sources ne doit
  // jamais pouvoir être confondue avec une fiche validée, y compris si
  // elle finit par atterrir en production par erreur.
  const estMock = sources.some((source) => source.includes('MOCK'))

  return (
    <div className="flex flex-col gap-3">
      {estMock && (
        <div className="rounded-lg border border-alerte bg-alerte/[0.18] px-3 py-2 text-xs font-medium text-texte">
          ⚠ Données de développement — non validées cliniquement
        </div>
      )}
      <p className="text-xs leading-relaxed text-texte-doux">
        Sources : {sources.join(' · ')}
        <br />
        Dernière révision : {formatDateFr(dateRevision)}
      </p>
    </div>
  )
}
