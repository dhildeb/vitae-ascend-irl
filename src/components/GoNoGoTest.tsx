import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Adaptive Go/No-Go inhibition test.
 *
 * What it measures:
 * - Go accuracy
 * - No-Go accuracy
 * - Reaction time
 * - Premature responses
 *
 * The component returns a 0–100 RAW performance score.
 * The benchmark/stat conversion should happen elsewhere.
 *
 * IMPORTANT:
 * This is an inhibition sub-test, not a complete measure of Wisdom.
 */

const GO_LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'K',
  'L',
  'M',
  'N',
  'P',
  'R',
  'S',
  'T',
  'V',
  'W',
]

const STOP_LETTER = 'X'

const TOTAL_TRIALS = 60
const NO_GO_TRIALS = 15
const GO_TRIALS = TOTAL_TRIALS - NO_GO_TRIALS

// Difficulty range.
// Lower = harder.
const START_EXPOSURE_MS = 600
const MIN_EXPOSURE_MS = 300
const MAX_EXPOSURE_MS = 800

// A response after this amount of time is still accepted,
// but becomes increasingly poor from a speed perspective.
// const SPEED_TARGET_MS = 400

// How many recent trials determine the next difficulty.
const ADAPTIVE_WINDOW = 10

// Difficulty changes in these increments.
const DIFFICULTY_STEP_MS = 50

type Phase = 'idle' | 'running' | 'done'

interface Trial {
  letter: string
  isNoGo: boolean
}

interface TrialResult {
  isNoGo: boolean
  responded: boolean
  reactionTime: number | null
  premature: boolean
}

interface GoNoGoTestProps {
  onComplete: (rawScore: number) => void
}

/**
 * Creates an exactly balanced test:
 * 45 Go + 15 No-Go.
 *
 * Also prevents No-Go trials from appearing consecutively.
 */
function generateSequence(): Trial[] {
  const trials: Trial[] = []

  for (let i = 0; i < GO_TRIALS; i++) {
    trials.push({
      letter: GO_LETTERS[Math.floor(Math.random() * GO_LETTERS.length)],
      isNoGo: false,
    })
  }

  for (let i = 0; i < NO_GO_TRIALS; i++) {
    trials.push({
      letter: STOP_LETTER,
      isNoGo: true,
    })
  }

  // Fisher-Yates shuffle.
  for (let i = trials.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[trials[i], trials[j]] = [trials[j], trials[i]]
  }

  // Repair adjacent No-Go trials.
  // This avoids long runs that don't meaningfully test inhibition.
  for (let i = 1; i < trials.length; i++) {
    if (trials[i].isNoGo && trials[i - 1].isNoGo) {
      let swapIndex = i + 1

      while (
        swapIndex < trials.length &&
        trials[swapIndex].isNoGo
      ) {
        swapIndex++
      }

      if (swapIndex < trials.length) {
        ;[trials[i], trials[swapIndex]] = [
          trials[swapIndex],
          trials[i],
        ]
      }
    }
  }

  return trials
}

/**
 * Converts reaction time into a 0–1 speed score.
 *
 * <= 250ms  => 1.00
 * 400ms     => ~0.83
 * 600ms     => ~0.50
 * 800ms+    => 0
 *
 * This deliberately rewards speed without allowing speed
 * to overpower inhibition accuracy.
 */
function reactionTimeScore(reactionTime: number): number {
  if (reactionTime <= 250) return 1

  if (reactionTime >= 800) return 0

  return 1 - (reactionTime - 250) / 550
}

/**
 * Adaptive difficulty.
 *
 * Strong recent performance -> faster.
 * Poor recent performance -> slower.
 */
function calculateNextExposure(
  currentExposure: number,
  recentResults: TrialResult[],
): number {
  if (recentResults.length < ADAPTIVE_WINDOW) {
    return currentExposure
  }

  const window = recentResults.slice(-ADAPTIVE_WINDOW)

  let correct = 0
  let noGoErrors = 0
  let goMisses = 0
  let prematureResponses = 0

  for (const result of window) {
    if (result.premature) {
      prematureResponses++
      continue
    }

    if (result.isNoGo) {
      if (!result.responded) {
        correct++
      } else {
        noGoErrors++
      }
    } else {
      if (result.responded) {
        correct++
      } else {
        goMisses++
      }
    }
  }

  const accuracy = correct / window.length

  // Excellent performance:
  // make the next block harder.
  if (
    accuracy >= 0.9 &&
    noGoErrors <= 1 &&
    goMisses <= 1 &&
    prematureResponses === 0
  ) {
    return Math.max(
      MIN_EXPOSURE_MS,
      currentExposure - DIFFICULTY_STEP_MS,
    )
  }

  // Poor performance:
  // give the participant more time.
  if (
    accuracy < 0.7 ||
    noGoErrors >= 3 ||
    goMisses >= 3 ||
    prematureResponses >= 2
  ) {
    return Math.min(
      MAX_EXPOSURE_MS,
      currentExposure + DIFFICULTY_STEP_MS,
    )
  }

  return currentExposure
}

/**
 * Calculates the final raw 0–100 score.
 *
 * Weighting:
 *   40% No-Go inhibition
 *   35% Go accuracy
 *   25% reaction speed
 *
 * Accuracy intentionally dominates speed.
 */
function calculateRawScore(results: TrialResult[]): number {
  const goResults = results.filter((r) => !r.isNoGo)
  const noGoResults = results.filter((r) => r.isNoGo)

  if (
    goResults.length === 0 ||
    noGoResults.length === 0
  ) {
    return 0
  }

  // GO:
  // Must respond.
  const goAccuracy =
    goResults.filter(
      (r) => r.responded && !r.premature,
    ).length / goResults.length

  // NO-GO:
  // Must NOT respond.
  const noGoAccuracy =
    noGoResults.filter(
      (r) => !r.responded && !r.premature,
    ).length / noGoResults.length

  // Only legitimate Go responses contribute to reaction speed.
  const reactionTimes = goResults
    .filter(
      (r): r is TrialResult & { reactionTime: number } =>
        r.responded &&
        !r.premature &&
        r.reactionTime !== null,
    )
    .map((r) => r.reactionTime)

  const speedScore =
    reactionTimes.length > 0
      ? reactionTimes.reduce(
        (sum, time) => sum + reactionTimeScore(time),
        0,
      ) / reactionTimes.length
      : 0

  const rawScore =
    goAccuracy * 35 +
    noGoAccuracy * 40 +
    speedScore * 25

  return Math.round(Math.max(0, Math.min(100, rawScore)))
}

export default function GoNoGoTest({
  onComplete,
}: GoNoGoTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [index, setIndex] = useState(0)
  const [exposureMs, setExposureMs] = useState(
    START_EXPOSURE_MS,
  )

  const sequenceRef = useRef<Trial[]>([])
  const resultsRef = useRef<TrialResult[]>([])

  const trialStartRef = useRef<number | null>(null)
  const respondedRef = useRef(false)
  const prematureRef = useRef(false)

  const timeoutRef = useRef<number | null>(null)

  /**
   * Clears the current timer safely.
   */
  const clearCurrentTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  /**
   * Finish the test.
   */
  const finish = useCallback(() => {
    clearCurrentTimer()

    const results = resultsRef.current
    const score = calculateRawScore(results)

    setPhase('done')
    onComplete(score)
  }, [clearCurrentTimer, onComplete])

  /**
   * Evaluate the current trial.
   */
  const evaluateCurrentTrial = useCallback(
    (trialIndex: number) => {
      const trial = sequenceRef.current[trialIndex]

      if (!trial) return

      const reactionTime =
        respondedRef.current &&
          trialStartRef.current !== null
          ? performance.now() - trialStartRef.current
          : null

      const result: TrialResult = {
        isNoGo: trial.isNoGo,
        responded: respondedRef.current,
        reactionTime,
        premature: prematureRef.current,
      }

      resultsRef.current.push(result)

      // Update difficulty every block.
      const nextExposure = calculateNextExposure(
        exposureMs,
        resultsRef.current,
      )

      if (nextExposure !== exposureMs) {
        setExposureMs(nextExposure)
      }
    },
    [exposureMs],
  )

  /**
   * Advance to the next trial.
   */
  const advance = useCallback(
    (currentIndex: number) => {
      evaluateCurrentTrial(currentIndex)

      if (currentIndex + 1 >= TOTAL_TRIALS) {
        finish()
        return
      }

      const nextIndex = currentIndex + 1

      respondedRef.current = false
      prematureRef.current = false
      trialStartRef.current = performance.now()

      setIndex(nextIndex)

      timeoutRef.current = window.setTimeout(
        () => {
          advance(nextIndex)
        },
        exposureMs,
      )
    },
    [evaluateCurrentTrial, finish, exposureMs],
  )

  /**
   * Begin a fresh test.
   */
  const start = () => {
    clearCurrentTimer()

    sequenceRef.current = generateSequence()
    resultsRef.current = []

    respondedRef.current = false
    prematureRef.current = false

    setIndex(0)
    setExposureMs(START_EXPOSURE_MS)
    setPhase('running')

    // Give React a frame to render the first stimulus before
    // starting the timing clock.
    requestAnimationFrame(() => {
      trialStartRef.current = performance.now()

      timeoutRef.current = window.setTimeout(
        () => {
          advance(0)
        },
        START_EXPOSURE_MS,
      )
    })
  }

  /**
   * User presses Go.
   */
  const handleRespond = () => {
    if (phase !== 'running') return

    // Only the first response counts.
    if (respondedRef.current) return

    const now = performance.now()

    if (trialStartRef.current === null) return

    const reactionTime = now - trialStartRef.current

    respondedRef.current = true

    /**
     * A response in the first 80ms is treated as premature.
     *
     * This catches people effectively pre-clicking / mashing
     * the button rather than actually processing the stimulus.
     */
    if (reactionTime < 80) {
      prematureRef.current = true
    }
  }

  /**
   * Keyboard support:
   * Spacebar acts as Go.
   */
  useEffect(() => {
    if (phase !== 'running') return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return

      event.preventDefault()
      handleRespond()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [phase])

  /**
   * Cleanup when component unmounts.
   */
  useEffect(() => {
    return () => {
      clearCurrentTimer()
    }
  }, [clearCurrentTimer])

  const currentTrial =
    sequenceRef.current[index]

  return (
    <div className="gonogo-test">
      {phase === 'idle' && (
        <>
          <p className="gonogo-hint">
            Press <strong>Go</strong> for every letter except{' '}
            <strong>{STOP_LETTER}</strong>.
            <br />
            Respond as quickly as you can without pressing on X.
          </p>

          <p className="gonogo-hint">
            {TOTAL_TRIALS} trials • {GO_TRIALS} Go •{' '}
            {NO_GO_TRIALS} No-Go
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={start}
          >
            Start
          </button>
        </>
      )}

      {phase === 'running' && currentTrial && (
        <>
          <div
            className={`gonogo-letter 
              ${index > (TOTAL_TRIALS / 2) && Math.random() < 0.25 ? 'gonogo-letter--stop' : currentTrial.isNoGo
                ? 'gonogo-letter--stop'
                : ''
              }`}
            aria-live="off"
          >
            {currentTrial.letter}
          </div>

          <button
            type="button"
            className="btn btn-primary gonogo-go-btn"
            onClick={handleRespond}
            autoFocus
          >
            Go!
          </button>

          <p className="nback-progress">
            {index + 1} / {TOTAL_TRIALS}
          </p>

          <p className="gonogo-difficulty">
            Difficulty: {exposureMs}ms
          </p>
        </>
      )}

      {phase === 'done' && (
        <div className="gonogo-letter">
          Done
        </div>
      )}
    </div>
  )
}