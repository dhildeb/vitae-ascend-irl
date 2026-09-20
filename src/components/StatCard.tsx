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
      <div className="stat-card stat-card--locked">
        <div className="stat-card-top">
          <span className="stat-key">{statKey}</span>
          <span className="stat-tagline">{tagline}</span>
        </div>
        <div className="stat-score-row">
          <span className="stat-score stat-score--locked">?</span>
        </div>
        <h3 className="stat-label">{label}</h3>
        <p className="stat-incomplete">Redesigning this stat with the same rigor as Strength — coming soon.</p>
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
              <div key={id} className="subtest-row subtest-row--alt">
                <div className="subtest-info">
                  <span className="subtest-name">{groupLabel}</span>
                  <span className="subtest-result subtest-result--empty">Choose one:</span>
                </div>
                <div className="subtest-alt-buttons">
                  {isAlternativeSet.map((altId) => {
                    const log = latest(tests, altId)
                    return (
                      <button
                        key={altId}
                        className={`btn btn-outline btn-small ${log ? 'btn-outline--done' : ''}`}
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
            <div key={id} className="subtest-row">
              <div className="subtest-info">
                <span className="subtest-name">{def.label}</span>
                {log ? (
                  <span className="subtest-result">
                    {log.rawValue} {def.unit}
                    {log.derivedKg ? ` (≈${log.derivedKg.toFixed(0)}kg)` : ''} → score {log.score}
                  </span>
                ) : (
                  <span className="subtest-result subtest-result--empty">Not tested</span>
                )}
              </div>
              <button className="btn btn-outline btn-small" onClick={() => onTakeTest(id)}>
                {log ? 'Retest' : 'Test'}
              </button>
            </div>
          )
        })}

        {bonusRows.length > 0 && (
          <>
            <div className="subtest-divider">Optional — refines the score if you have the equipment</div>
            {bonusRows.map((id) => {
              const def = TEST_DEFS[id]
              const log = latest(tests, id)
              return (
                <div key={id} className="subtest-row">
                  <div className="subtest-info">
                    <span className="subtest-name">{def.label}</span>
                    {log ? (
                      <span className="subtest-result">
                        {log.rawValue} {def.unit} → score {log.score}
                      </span>
                    ) : (
                      <span className="subtest-result subtest-result--empty">Not tested</span>
                    )}
                  </div>
                  <button className="btn btn-outline btn-small" onClick={() => onTakeTest(id)}>
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
