import type { StatKey, TestId, TestsState } from './types'
import { STAT_TEST_GROUPS } from './benchmarks'

export interface CompositeResult {
  composite: number | null
  loggedScores: number[]
  coreComplete: boolean
  missingCore: TestId[]
}

function latestScore(tests: TestsState, id: TestId): number | null {
  const h = tests[id].history
  return h.length > 0 ? h[h.length - 1].score : null
}

export function computeComposite(statKey: StatKey, tests: TestsState): CompositeResult {
  const group = STAT_TEST_GROUPS[statKey]
  if (!group) return { composite: null, loggedScores: [], coreComplete: false, missingCore: [] }

  const scores: number[] = []
  const missingCore: TestId[] = []

  for (const id of group.core) {
    const s = latestScore(tests, id)
    if (s !== null) scores.push(s)
    else missingCore.push(id)
  }

  for (const altGroup of group.alternatives ?? []) {
    const altScores = altGroup.map((id) => latestScore(tests, id)).filter((s): s is number => s !== null)
    if (altScores.length > 0) {
      scores.push(Math.max(...altScores))
    } else {
      missingCore.push(altGroup[0])
    }
  }

  for (const id of group.bonus ?? []) {
    const s = latestScore(tests, id)
    if (s !== null) scores.push(s)
  }

  const coreComplete = missingCore.length === 0
  const composite = coreComplete && scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  return { composite, loggedScores: scores, coreComplete, missingCore }
}
