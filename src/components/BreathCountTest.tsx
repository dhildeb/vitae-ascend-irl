import { useEffect, useRef, useState } from 'react'

const DURATION_S = 180 // 3 minutes
const CYCLE_LENGTH = 9

type Phase = 'idle' | 'running' | 'done'

interface BreathCountTestProps {
  onComplete: (accuracyPct: number) => void
}

export default function BreathCountTest({ onComplete }: BreathCountTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(DURATION_S)
  const [position, setPosition] = useState(1) // where we think the participant is in the 1-9 cycle
  const [successfulCycles, setSuccessfulCycles] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const intervalRef = useRef<number | undefined>(undefined)

  // Refs mirror the counters so the interval closure (captured once, at start()) can read
  // live values when the timer expires, rather than the stale values from when it began.
  const successfulCyclesRef = useRef(0)
  const errorCountRef = useRef(0)
  useEffect(() => {
    successfulCyclesRef.current = successfulCycles
  }, [successfulCycles])
  useEffect(() => {
    errorCountRef.current = errorCount
  }, [errorCount])

  useEffect(() => () => window.clearInterval(intervalRef.current), [])

  const finish = () => {
    window.clearInterval(intervalRef.current)
    setPhase('done')
    const cycles = successfulCyclesRef.current
    const errors = errorCountRef.current
    const attempts = cycles + errors
    const pct = attempts > 0 ? Math.round((cycles / attempts) * 100) : 0
    onComplete(pct)
  }

  const start = () => {
    setSuccessfulCycles(0)
    setErrorCount(0)
    setPosition(1)
    setSecondsLeft(DURATION_S)
    setPhase('running')
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          finish()
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  const pressBreath = () => {
    if (phase !== 'running') return
    if (position === CYCLE_LENGTH) {
      // Should have pressed "9th breath" instead — miscount (error without awareness)
      setErrorCount((e) => e + 1)
      setPosition(1)
    } else {
      setPosition((p) => p + 1)
    }
  }

  const pressNinth = () => {
    if (phase !== 'running') return
    if (position === CYCLE_LENGTH) {
      setSuccessfulCycles((c) => c + 1)
    } else {
      // Pressed "9th" early — also a miscount
      setErrorCount((e) => e + 1)
    }
    setPosition(1)
  }

  const pressLostCount = () => {
    if (phase !== 'running') return
    // Self-caught error (reset) — a different failure mode than a miscount
    setErrorCount((e) => e + 1)
    setPosition(1)
  }

  return (
    <div className="breath-test">
      {phase === 'idle' && (
        <>
          <p className="breath-instructions">
            Close your eyes or soften your gaze. Breathe normally. Tap <strong>Breath</strong> on every exhale except
            the 9th of each cycle — tap <strong>9th Breath</strong> for that one instead, then it resets to 1. Tap{' '}
            <strong>Lost Count</strong> any time you notice you've drifted.
          </p>
          <button type="button" className="btn btn-primary" onClick={start}>
            Start (3 min)
          </button>
        </>
      )}
      {phase === 'running' && (
        <>
          <div className="breath-timer">{secondsLeft}s left</div>
          <div className="breath-buttons">
            <button type="button" className="breath-btn breath-btn--main" onClick={pressBreath}>
              Breath
            </button>
            <button type="button" className="breath-btn breath-btn--ninth" onClick={pressNinth}>
              9th Breath
            </button>
          </div>
          <button type="button" className="breath-lost-btn" onClick={pressLostCount}>
            Lost Count
          </button>
          <p className="breath-stats">
            {successfulCycles} cycles complete · {errorCount} errors
          </p>
        </>
      )}
      {phase === 'done' && (
        <p className="breath-stats">
          Done — {successfulCycles} complete cycles, {errorCount} errors
        </p>
      )}
    </div>
  )
}
