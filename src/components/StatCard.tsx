import type { StatKey, TestId, TestsState } from '../types'
import { STAT_LABELS } from '../types'
import { TEST_DEFS, STAT_TEST_GROUPS, modifierFor, formatModifier } from '../benchmarks'
import { computeComposite } from '../composite'

interface StatCardProps {
  statKey: StatKey
  tests: TestsState
  onTakeTest: (testId: TestId) => void
}

function latest(tests: TestsState, id: TestId) {
  const h = tests[id].history
  return h.length > 0 ? h[h.length - 1] : null
}

export default function StatCard({ statKey, tests, onTakeTest }: StatCardProps) {
  const { label, tagline, implemented } = STAT_LABELS[statKey]

  if (!implemented) {
    return (
      <div className="flex flex-col rounded-[2px] border-l-[4px] border-[#a33b2e] bg-[#efe7d8] p-7 text-[#26221c] opacity-55 shadow-[0_18px_30px_-18px_rgba(0,0,0,0.55)]">
        <div className="mb-[18px] flex items-baseline justify-between gap-3">
          <span className="font-mono text-[13px] font-bold tracking-[0.06em] text-[#a33b2e]">{statKey}</span>
          <span className="font-serif text-[12px] italic text-[#9c7a3c]" style={{ fontFamily: '"Spectral", Georgia, serif' }}>{tagline}</span>
        </div>
        <div className="mb-[6px] flex items-end gap-3">
          <span className="font-mono text-[52px] font-bold leading-none text-[#b0a488]">?</span>
        </div>
        <h3 className="mb-4 text-[20px] text-[#26221c]" style={{ fontFamily: '"Spectral", Georgia, serif', fontWeight: 500 }}>{label}</h3>
        <p className="-mt-1 text-[12.5px] italic text-[#8a7f68]">
          Redesigning this stat with the same rigor as Strength — coming soon.
        </p>
      </div>
    )
  }

  const group = STAT_TEST_GROUPS[statKey]!
  const { composite, missingCore } = computeComposite(statKey, tests)

  const rows: { id: TestId; isAlternativeSet?: TestId[] }[] = [
    ...group.core.map((id) => ({ id })),
    ...(group.alternatives ?? []).map((altSet) => ({ id: altSet[0], isAlternativeSet: altSet })),
  ]
  const bonusRows = group.bonus ?? []

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-key">{statKey}</span>
        <span className="stat-tagline">{tagline}</span>
      </div>

      <div className="stat-score-row">
        <span className="stat-score">{composite !== null ? composite : '—'}</span>
        {composite !== null && <span className="stat-modifier">{formatModifier(modifierFor(composite))}</span>}
      </div>

      <h3 className="stat-label">{label}</h3>

      {composite === null && (
        <p className="stat-incomplete">
          {missingCore.length === group.core.length + (group.alternatives?.length ?? 0)
            ? `Take all ${rows.length} core tests below to reveal this stat`
            : `${missingCore.length} test${missingCore.length === 1 ? '' : 's'} left to reveal this stat`}
        </p>
      )}

      <div className="stat-subtests">
        {rows.map(({ id, isAlternativeSet }) => {
          if (isAlternativeSet) {
            const groupLabel = TEST_DEFS[isAlternativeSet[0]].altGroupLabel ?? 'Choose one'
            return (
              <div key={id} className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13px] font-semibold text-[#26221c]">{groupLabel}</span>
                  <span className="font-mono text-[11.5px] italic text-[#948965]">Choose one:</span>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  {isAlternativeSet.map((altId) => {
                    const log = latest(tests, altId)
                    return (
                      <button
                        key={altId}
                        className={`rounded-[3px] border px-[12px] py-[7px] text-[12.5px] font-semibold transition-colors ${
                          log
                            ? 'border-[#a33b2e] bg-transparent text-[#a33b2e]'
                            : 'border-[#26221c] bg-transparent text-[#26221c]'
                        }`}
                        onClick={() => onTakeTest(altId)}
                      >
                        {TEST_DEFS[altId].shortLabel ?? TEST_DEFS[altId].label}
                        {log ? ` · ${log.score}` : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          }
          const def = TEST_DEFS[id]
          const log = latest(tests, id)
          return (
            <div key={id} className="flex items-center justify-between gap-2.5">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-[#26221c]">{def.label}</span>
                {log ? (
                  <span className="font-mono text-[11.5px] text-[#6b6153]">
                    {log.rawValue} {def.unit}
                    {log.derivedKg ? ` (≈${log.derivedKg.toFixed(0)}kg)` : ''} → score {log.score}
                  </span>
                ) : (
                  <span className="font-mono text-[11.5px] italic text-[#948965]">Not tested</span>
                )}
              </div>
              <button
                className="rounded-[3px] border border-[#26221c] bg-transparent px-[12px] py-[7px] text-[12.5px] font-semibold text-[#26221c] transition-colors hover:bg-[#26221c] hover:text-[#efe7d8]"
                onClick={() => onTakeTest(id)}
              >
                {log ? 'Retest' : 'Test'}
              </button>
            </div>
          )
        })}

        {bonusRows.length > 0 && (
          <>
            <div className="mt-1 border-t border-dashed border-[#cdbd98] pt-2.5 text-[11px] uppercase tracking-[0.05em] text-[#948965]">
              Optional — refines the score if you have the equipment
            </div>
            {bonusRows.map((id) => {
              const def = TEST_DEFS[id]
              const log = latest(tests, id)
              return (
                <div key={id} className="flex items-center justify-between gap-2.5">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-[#26221c]">{def.label}</span>
                    {log ? (
                      <span className="font-mono text-[11.5px] text-[#6b6153]">
                        {log.rawValue} {def.unit} → score {log.score}
                      </span>
                    ) : (
                      <span className="font-mono text-[11.5px] italic text-[#948965]">Not tested</span>
                    )}
                  </div>
                  <button
                    className="rounded-[3px] border border-[#26221c] bg-transparent px-[12px] py-[7px] text-[12.5px] font-semibold text-[#26221c] transition-colors hover:bg-[#26221c] hover:text-[#efe7d8]"
                    onClick={() => onTakeTest(id)}
                  >
                    {log ? 'Retest' : 'Add'}
                  </button>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
