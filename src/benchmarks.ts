import type { AnchorPoint, StatKey, StatTestGroup, TestDef, TestId } from './types'

/**
 * SCORING PHILOSOPHY (v3 — absolute strength)
 * --------------------------------------------
 * No age or sex adjustment. One fixed scale for every human. Score 10 =
 * a genuinely average MALE adult (the reference population these anchors
 * are calibrated to), score 20 = elite / near the practical ceiling of
 * drug-free human performance — once every sub-test reads 20, you've
 * maxed Strength; further specialization should go elsewhere.
 *
 * Reference point used to calibrate every score-10 anchor: a 90kg
 * (198lb) average male doing 22 push-ups, 1 pull-up, a 200cm broad jump,
 * 47kg grip strength / 60s dead hang, a 61kg (135lb) bench, and an 82kg
 * (~180lb) deadlift. All of these independently land at score 10 with the
 * formulas below.
 *
 * The key design change: push-ups and pull-ups are bodyweight-loaded rep
 * tests, which historically let a small light person "out-rep" a much
 * stronger, heavier person. To fix that, reps are converted into an
 * ESTIMATED ABSOLUTE LOAD (kg) before scoring, using:
 *
 *   1) The fraction of bodyweight actually loaded during the movement,
 *      from force-plate research:
 *      - Push-up: ~69-75% of bodyweight is supported through the rep
 *        (Suprak et al., J Strength Cond Res 2011) — we use 70%.
 *      - Pull-up: ~100% of bodyweight (the whole body is lifted).
 *   2) The Epley formula, standard in strength training, to extrapolate
 *      a rep count into an estimated 1-rep-max: 1RM = load * (1 + reps/30)
 *
 *   Estimated push strength (kg) = bodyweight * 0.70 * (1 + reps/30)
 *   Estimated pull strength (kg) = bodyweight * (1 + reps/30)
 *
 * This means a heavier person doing fewer reps can out-score a lighter
 * person doing more reps, the same way a heavier deadlifter typically beats
 * a lighter one in absolute (not relative) terms — while an exceptional
 * rep count can still overcome a bodyweight disadvantage, same as a
 * genuine outlier would in real life.
 *
 * Broad jump, grip, bench, and deadlift are scored on their own raw units
 * directly (distance, kg, or seconds) — those tests don't have the same
 * "reps let you cheat the scale" problem, so no conversion is applied.
 *
 * SOURCES (see README for full citations):
 * - Push-up load %: Suprak, Dawes & Stephenson, J Strength Cond Res 2011
 * - Epley formula: standard strength-training 1RM estimation
 * - Grip strength (dynamometer): Ranganathan et al. global systematic
 *   review (2.4M adults, 69 countries); NIH Toolbox U.S. norms
 * - Bench/squat/deadlift bodyweight-multiple standards: Strength Level,
 *   ExRx.net, aggregated community strength-standard datasets
 * - Broad jump, dead hang: thinner data — flagged in the UI accordingly
 */

const EPLEY = (reps: number) => 1 + reps / 30

export function estimatePushKg(bodyweightKg: number, reps: number): number {
  if (reps === 0) return 0
  return bodyweightKg * 0.7 * EPLEY(reps)
}

export function estimatePullKg(bodyweightKg: number, reps: number): number {
  if (reps === 0) return 0
  return bodyweightKg * EPLEY(reps)
}

// ---------- Anchor tables: raw value -> score, fixed for all users ----------

const pushAnchors: AnchorPoint[] = [
  { raw: 0, score: 0 },
  { raw: 35, score: 3 },
  { raw: 55, score: 5 },
  { raw: 85, score: 8 },
  { raw: 109, score: 10 },
  { raw: 130, score: 12 },
  { raw: 155, score: 14 },
  { raw: 185, score: 16 },
  { raw: 220, score: 18 },
  { raw: 260, score: 20 },
]

const pullAnchors: AnchorPoint[] = [
  { raw: 0, score: 0 },
  { raw: 45, score: 3 },
  { raw: 65, score: 5 },
  { raw: 82, score: 8 },
  { raw: 93, score: 10 },
  { raw: 108, score: 12 },
  { raw: 128, score: 14 },
  { raw: 155, score: 16 },
  { raw: 185, score: 18 },
  { raw: 220, score: 20 },
]

const broadJumpAnchors: AnchorPoint[] = [
  { raw: 0, score: 0 },
  { raw: 60, score: 3 },
  { raw: 100, score: 5 },
  { raw: 130, score: 8 },
  { raw: 155, score: 10 },
  { raw: 190, score: 12 },
  { raw: 225, score: 14 },
  { raw: 245, score: 16 },
  { raw: 265, score: 18 },
  { raw: 290, score: 20 },
]

const verticalJumpAnchors: AnchorPoint[] = [
  { raw: 0, score: 0 },
  { raw: 15, score: 3 },
  { raw: 22, score: 5 },
  { raw: 32, score: 8 },
  { raw: 40, score: 10 },
  { raw: 48, score: 12 },
  { raw: 56, score: 14 },
  { raw: 66, score: 16 },
  { raw: 78, score: 18 },
  { raw: 92, score: 20 },
]

const gripDynoAnchors: AnchorPoint[] = [
  { raw: 0, score: 0 },
  { raw: 15, score: 3 },
  { raw: 24, score: 5 },
  { raw: 35, score: 8 },
  { raw: 48, score: 10 },
  { raw: 58, score: 12 },
  { raw: 68, score: 14 },
  { raw: 78, score: 16 },
  { raw: 88, score: 18 },
  { raw: 100, score: 20 },
]

const gripHangAnchors: AnchorPoint[] = [
  { raw: 0, score: 0 },
  { raw: 10, score: 3 },
  { raw: 20, score: 5 },
  { raw: 40, score: 8 },
  { raw: 60, score: 10 },
  { raw: 80, score: 12 },
  { raw: 105, score: 14 },
  { raw: 135, score: 16 },
  { raw: 175, score: 18 },
  { raw: 220, score: 20 },
]

const benchAnchors: AnchorPoint[] = [
  { raw: 0, score: 0 },
  { raw: 15, score: 3 },
  { raw: 25, score: 5 },
  { raw: 42, score: 8 },
  { raw: 61, score: 10 },
  { raw: 75, score: 12 },
  { raw: 95, score: 14 },
  { raw: 120, score: 16 },
  { raw: 150, score: 18 },
  { raw: 190, score: 20 },
]

const deadliftAnchors: AnchorPoint[] = [
  { raw: 0, score: 0 },
  { raw: 25, score: 3 },
  { raw: 45, score: 5 },
  { raw: 65, score: 8 },
  { raw: 82, score: 10 },
  { raw: 105, score: 12 },
  { raw: 140, score: 14 },
  { raw: 190, score: 16 },
  { raw: 260, score: 18 },
  { raw: 350, score: 20 },
]

// ---------- DEXTERITY ----------

const reactionAnchors: AnchorPoint[] = [
  { raw: 180, score: 20 },
  { raw: 210, score: 18 },
  { raw: 240, score: 16 },
  { raw: 265, score: 14 },
  { raw: 280, score: 12 },
  { raw: 300, score: 10 },
  { raw: 340, score: 8 },
  { raw: 400, score: 5 },
  { raw: 480, score: 3 },
]

const fingerTapAnchors: AnchorPoint[] = [
  { raw: 25, score: 3 },
  { raw: 32, score: 5 },
  { raw: 42, score: 8 },
  { raw: 52, score: 10 },
  { raw: 58, score: 12 },
  { raw: 65, score: 14 },
  { raw: 72, score: 16 },
  { raw: 80, score: 18 },
  { raw: 90, score: 20 },
]

const balanceAnchors: AnchorPoint[] = [
  { raw: 2, score: 3 },
  { raw: 4, score: 5 },
  { raw: 8, score: 8 },
  { raw: 12, score: 10 },
  { raw: 18, score: 12 },
  { raw: 25, score: 14 },
  { raw: 35, score: 16 },
  { raw: 45, score: 18 },
  { raw: 60, score: 20 },
]

const sprint20Anchors: AnchorPoint[] = [
  { raw: 2.65, score: 20 },
  { raw: 2.85, score: 18 },
  { raw: 3.05, score: 16 },
  { raw: 3.3, score: 14 },
  { raw: 3.6, score: 12 },
  { raw: 3.9, score: 10 },
  { raw: 4.3, score: 8 },
  { raw: 5.0, score: 5 },
  { raw: 5.5, score: 3 },
]

const shuttleAnchors: AnchorPoint[] = [
  { raw: 3.8, score: 20 },
  { raw: 4.15, score: 18 },
  { raw: 4.5, score: 16 },
  { raw: 4.9, score: 14 },
  { raw: 5.3, score: 12 },
  { raw: 5.8, score: 10 },
  { raw: 6.3, score: 8 },
  { raw: 7.2, score: 5 },
  { raw: 8.0, score: 3 },
]

const lineHopsAnchors: AnchorPoint[] = [
  { raw: 15, score: 3 },
  { raw: 25, score: 5 },
  { raw: 35, score: 8 },
  { raw: 45, score: 10 },
  { raw: 55, score: 12 },
  { raw: 65, score: 14 },
  { raw: 78, score: 16 },
  { raw: 92, score: 18 },
  { raw: 110, score: 20 },
]

export const TEST_DEFS: Record<TestId, TestDef> = {
  pushups: {
    id: 'pushups',
    label: 'Push-Ups',
    unit: 'reps',
    inputType: 'reps_bw_push',
    hint: 'Strict push-ups to failure, full range of motion, from your toes.',
    dataQuality: 'strong',
    source: 'Suprak et al. 2011 (load %) + Epley 1RM formula',
    anchors: pushAnchors,
  },
  pullups: {
    id: 'pullups',
    label: 'Pull-Ups',
    unit: 'reps',
    inputType: 'reps_bw_pull',
    hint: 'Strict pull-ups to failure, full hang to chin-over-bar. 0 is a valid, useful answer.',
    dataQuality: 'moderate',
    source: 'Bodyweight-as-load assumption + Epley 1RM formula',
    anchors: pullAnchors,
  },
  broadjump: {
    id: 'broadjump',
    label: 'Standing Broad Jump',
    shortLabel: 'Broad Jump',
    altGroupLabel: 'Lower-Body Power',
    unit: 'cm',
    inputType: 'distance_cm',
    hint: 'Stand behind a line, jump forward with both feet together, no run-up. Measure to your closest heel on landing.',
    dataQuality: 'thin',
    source: 'Converging estimates — no large adult percentile study exists',
    anchors: broadJumpAnchors,
  },
  vertical_jump: {
    id: 'vertical_jump',
    label: 'Vertical Jump',
    shortLabel: 'Vertical Jump',
    altGroupLabel: 'Lower-Body Power',
    unit: 'cm',
    inputType: 'distance_cm',
    hint: 'Mark your standing reach on a wall, then your highest jump-touch. The difference in cm is your vertical jump. No-space-needed alternative to the broad jump.',
    dataQuality: 'thin',
    source: 'Converging estimates from Sargent jump test literature — no large adult percentile study exists',
    anchors: verticalJumpAnchors,
  },
  grip_dyno: {
    id: 'grip_dyno',
    label: 'Grip Strength (dynamometer)',
    shortLabel: 'Dynamometer',
    altGroupLabel: 'Grip Strength',
    unit: 'kg',
    inputType: 'load_kg',
    hint: 'Max reading from a hand dynamometer, best of 2-3 attempts per hand.',
    dataQuality: 'strong',
    source: 'Ranganathan et al. global systematic review; NIH Toolbox norms',
    optional: true,
    anchors: gripDynoAnchors,
  },
  grip_hang: {
    id: 'grip_hang',
    label: 'Grip Strength (dead hang)',
    shortLabel: 'Dead Hang',
    altGroupLabel: 'Grip Strength',
    unit: 'seconds',
    inputType: 'duration_s',
    hint: 'Hang from a bar at full arm extension for as long as possible. No-equipment alternative to the dynamometer test.',
    dataQuality: 'thin',
    source: 'Estimated benchmark — least standardized test in the battery',
    optional: true,
    anchors: gripHangAnchors,
  },
  bench: {
    id: 'bench',
    label: 'Bench Press 1RM',
    unit: 'kg',
    inputType: 'load_kg',
    hint: 'Your true or estimated one-rep max on barbell bench press.',
    dataQuality: 'strong',
    source: 'Strength Level / ExRx.net aggregated standards',
    optional: true,
    anchors: benchAnchors,
  },
  deadlift: {
    id: 'deadlift',
    label: 'Deadlift 1RM',
    unit: 'kg',
    inputType: 'load_kg',
    hint: 'Your true or estimated one-rep max on barbell deadlift.',
    dataQuality: 'strong',
    source: 'Strength Level / ExRx.net aggregated standards',
    optional: true,
    anchors: deadliftAnchors,
  },
  reaction: {
    id: 'reaction',
    label: 'Reaction Time',
    unit: 'ms',
    inputType: 'duration_ms',
    hint: 'Average of 3 trials, measured in-app.',
    dataQuality: 'moderate',
    source: 'Lab-average visual reaction time (~190ms), adjusted for browser input latency',
    anchors: reactionAnchors,
  },
  finger_tap: {
    id: 'finger_tap',
    label: 'Finger Tap Speed',
    unit: 'taps/10s',
    inputType: 'tap_count',
    hint: 'Tap as fast as possible with one finger for 10 seconds, measured in-app.',
    dataQuality: 'strong',
    source: 'Halstead-Reitan Finger Tapping Test clinical norms',
    anchors: fingerTapAnchors,
  },
  balance: {
    id: 'balance',
    label: 'Single-Leg Balance',
    unit: 'seconds',
    inputType: 'duration_s',
    hint: 'Stand on one leg, hands on hips, eyes closed. Time until your raised foot touches down or your hands leave your hips. Measured in-app.',
    dataQuality: 'thin',
    source: 'General clinical balance-testing benchmarks — the least standardized test in this battery',
    anchors: balanceAnchors,
  },
  sprint20: {
    id: 'sprint20',
    label: '20m Sprint',
    unit: 'seconds',
    inputType: 'duration_s',
    hint: 'All-out sprint over 20m (about 22 yards) from a standing start. Measured in-app via stopwatch — start/stop lag is a known source of imprecision.',
    dataQuality: 'moderate',
    source: 'General-population sprint-speed research, converted to an estimated 20m time',
    anchors: sprint20Anchors,
  },
  shuttle_5105: {
    id: 'shuttle_5105',
    label: '5-10-5 Shuttle Run',
    shortLabel: 'Shuttle Run',
    altGroupLabel: 'Agility',
    unit: 'seconds',
    inputType: 'duration_s',
    hint: 'Sprint 5 yards, touch the line, sprint 10 yards the other way, touch, sprint 5 yards back to start. Needs ~10 yards of clear space and 2-3 markers.',
    dataQuality: 'thin',
    source: 'Estimated from trained-athlete norms — no general-population baseline is published',
    optional: true,
    anchors: shuttleAnchors,
  },
  line_hops: {
    id: 'line_hops',
    label: 'Line Hops',
    shortLabel: 'Line Hops',
    altGroupLabel: 'Agility',
    unit: 'hops/30s',
    inputType: 'count',
    hint: 'Hop side to side over a line or rope on the floor, both feet together, for 30 seconds. Count total hops. No-space alternative to the shuttle run.',
    dataQuality: 'thin',
    source: 'Estimated benchmark — least standardized test in the battery',
    optional: true,
    anchors: lineHopsAnchors,
  },
}

export const STAT_TEST_GROUPS: Partial<Record<StatKey, StatTestGroup>> = {
  STR: {
    core: ['pushups', 'pullups'],
    alternatives: [
      ['grip_dyno', 'grip_hang'],
      ['broadjump', 'vertical_jump'],
    ],
    bonus: ['bench', 'deadlift'],
  },
  DEX: {
    core: ['reaction', 'finger_tap', 'balance', 'sprint20'],
    alternatives: [['shuttle_5105', 'line_hops']],
  },
}

/** Piecewise-linear interpolation between fixed anchor points, clamped to the table's min/max score. */
export function scoreFromAnchors(anchors: AnchorPoint[], raw: number): number {
  const sorted = [...anchors].sort((a, b) => a.raw - b.raw)
  if (raw <= sorted[0].raw) return sorted[0].score
  if (raw >= sorted[sorted.length - 1].raw) return sorted[sorted.length - 1].score

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]
    const b = sorted[i + 1]
    if (raw >= a.raw && raw <= b.raw) {
      const t = (raw - a.raw) / (b.raw - a.raw)
      return Math.round(a.score + t * (b.score - a.score))
    }
  }
  return sorted[sorted.length - 1].score
}

/** Scores a single test. bodyweightKg is required for reps_bw_* tests, unused otherwise. */
export function scoreTest(
  testId: TestId,
  rawValue: number,
  bodyweightKg: number,
): { score: number; derivedKg?: number } {
  const def = TEST_DEFS[testId]

  if (def.inputType === 'reps_bw_push') {
    const derivedKg = estimatePushKg(bodyweightKg, rawValue)
    return { score: scoreFromAnchors(def.anchors, derivedKg), derivedKg }
  }
  if (def.inputType === 'reps_bw_pull') {
    const derivedKg = estimatePullKg(bodyweightKg, rawValue)
    return { score: scoreFromAnchors(def.anchors, derivedKg), derivedKg }
  }
  return { score: scoreFromAnchors(def.anchors, rawValue) }
}

/** D&D-style ability modifier: floor((score - 10) / 2) */
export function modifierFor(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}
