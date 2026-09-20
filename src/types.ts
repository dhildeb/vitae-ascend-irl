export type StatKey = 'STR' | 'DEX' | 'CON'

export interface Profile {
  bodyweightKg: number
}

export type TestId =
  | 'pushups'
  | 'pullups'
  | 'broadjump'
  | 'vertical_jump'
  | 'grip_dyno'
  | 'grip_hang'
  | 'bench'
  | 'deadlift'
  | 'reaction'
  | 'finger_tap'
  | 'balance'
  | 'sprint20'
  | 'shuttle_5105'
  | 'line_hops'

export type InputType =
  | 'reps_bw_push' // reps, converted to est. kg via bodyweight * 0.70 * (1 + reps/30)
  | 'reps_bw_pull' // reps, converted to est. kg via bodyweight * (1 + reps/30)
  | 'distance_cm'
  | 'duration_s'
  | 'load_kg'
  | 'duration_ms' // in-app reaction-time mini-game
  | 'tap_count' // in-app finger-tap mini-game
  | 'count' // plain manual rep/count entry, no bodyweight formula (e.g. line hops)

export interface TestLog {
  rawValue: number // the value as entered/measured: reps, cm, seconds, or kg
  derivedKg?: number // for reps_bw_* tests, the estimated absolute kg this rep count represents
  score: number
  date: string
}

export interface TestState {
  history: TestLog[]
}

export type TestsState = Record<TestId, TestState>

export interface CharacterSheet {
  profile: Profile | null
  tests: TestsState
}

export interface AnchorPoint {
  raw: number
  score: number
}

export interface TestDef {
  id: TestId
  label: string
  /** Short button text when this test is offered as one of several alternatives, e.g. "Dead Hang". Falls back to label. */
  shortLabel?: string
  /** Shared heading shown above a set of alternative tests, e.g. "Grip Strength". Same on every test in the set. */
  altGroupLabel?: string
  unit: string
  inputType: InputType
  hint: string
  dataQuality: 'strong' | 'moderate' | 'thin'
  source: string
  optional?: boolean
  /** Fixed, non-demographic anchors: raw value -> score, 3 to 20. */
  anchors: AnchorPoint[]
}

export interface StatTestGroup {
  /** All of these must be logged for the stat to reveal a composite score. */
  core: TestId[]
  /** Each inner array is a set of interchangeable tests — the best score among logged ones counts once. */
  alternatives?: TestId[][]
  /** Logged if available, refines the composite, but never required. */
  bonus?: TestId[]
}

export const STAT_LABELS: Record<StatKey, { label: string; tagline: string; implemented: boolean }> = {
  STR: { label: 'Strength', tagline: 'Absolute force & power', implemented: true },
  DEX: { label: 'Dexterity', tagline: 'Speed, reflex & balance', implemented: true },
  CON: { label: 'Constitution', tagline: 'Stamina & endurance', implemented: false },
}

export const STAT_ORDER: StatKey[] = ['STR', 'DEX', 'CON']

export const emptyTestsState = (): TestsState => ({
  pushups: { history: [] },
  pullups: { history: [] },
  broadjump: { history: [] },
  vertical_jump: { history: [] },
  grip_dyno: { history: [] },
  grip_hang: { history: [] },
  bench: { history: [] },
  deadlift: { history: [] },
  reaction: { history: [] },
  finger_tap: { history: [] },
  balance: { history: [] },
  sprint20: { history: [] },
  shuttle_5105: { history: [] },
  line_hops: { history: [] },
})

export const emptySheet = (): CharacterSheet => ({
  profile: null,
  tests: emptyTestsState(),
})
