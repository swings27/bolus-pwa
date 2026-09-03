import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import type { IRcpSource } from '../../types'

interface ISourcesRcpProps {
  sources: IRcpSource[]
  statut: string
  dateRevision: string
  perimetreValidation: string[]
  prochaineRevision: string | null
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

// Trigger discret ("Sources RCP (3) · JJ/MM/AAAA") + feuille de fond
// listant chaque source, à la place d'un bloc de texte toujours visible :
// ce détail n'a pas besoin d'occuper de la place en permanence, seulement
// d'être consultable à la demande.
export default function SourcesRcp({
  sources,
  statut,
  dateRevision,
  perimetreValidation,
  prochaineRevision,
}: ISourcesRcpProps) {
  const [ouvert, setOuvert] = useState(false)
  const conteneurRef = useRef<HTMLDivElement>(null)

  useFocusTrap(ouvert, conteneurRef)

  useEffect(() => {
    if (!ouvert) return
    function gererEchap(event: KeyboardEvent) {
      if (event.key === 'Escape') setOuvert(false)
    }
    document.addEventListener('keydown', gererEchap)
    return () => document.removeEventListener('keydown', gererEchap)
  }, [ouvert])

  // Garde-fou : une fiche dont le statut de validation n'est pas "valide"
  // ne doit jamais pouvoir être confondue avec une fiche validée, y compris
  // si elle finit par atterrir en production par erreur.
  const aVerifier = statut !== 'valide'

  const aPiedDePage = perimetreValidation.length > 0 || prochaineRevision !== null

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="tactile pt-3 text-left text-[11px] italic text-texte-doux/70"
      >
        Sources RCP ({sources.length}) · {formatDateFr(dateRevision)} ›
      </button>

      {ouvert && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-texte/50"
          onClick={() => setOuvert(false)}
        >
          <div
            ref={conteneurRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sources-rcp-titre"
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl px-5 pb-6 pt-5 shadow-xl"
            style={{ backgroundColor: 'var(--surface)' }}
            onClick={(evenement) => evenement.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span id="sources-rcp-titre" className="text-[15px] font-semibold text-texte">
                RCP consultés
              </span>
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer"
                className="-m-1.5 flex h-11 w-11 items-center justify-center rounded-full text-texte-doux"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mb-3.5 text-[11px] text-texte-doux/70">
              Dernière veille : {formatDateFr(dateRevision)}
            </p>

            {aVerifier && (
              <div className="mb-3 rounded-lg border border-alerte bg-alerte/[0.18] px-3 py-2 text-xs font-medium text-texte">
                ⚠ Statut « {statut} » — à vérifier avant utilisation clinique
              </div>
            )}

            <ul className="flex flex-col">
              {sources.map((source, index) => (
                <li
                  key={`${source.specialite}-${index}`}
                  className={`py-2.5 text-[13px] text-texte ${
                    index < sources.length - 1 ? 'border-b border-texte/10' : ''
                  }`}
                >
                  <div className="font-semibold">{source.specialite}</div>
                  {(source.titulaire || source.date_maj) && (
                    <div className="mt-0.5 text-[11px] text-texte-doux">
                      {[source.titulaire, source.date_maj && `MAJ ${source.date_maj}`].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  {source.url_ansm && (
                    <a
                      href={source.url_ansm}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[11px] underline"
                      style={{ color: 'var(--interactif)' }}
                    >
                      Voir sur la BDPM ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {aPiedDePage && (
              <div className="mt-3 border-t border-texte/10 pt-3 text-[11px] text-texte-doux">
                {perimetreValidation.length > 0 && <p>Périmètre validé : {perimetreValidation.join(', ')}</p>}
                {prochaineRevision && <p>Prochaine révision : {formatDateFr(prochaineRevision)}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
