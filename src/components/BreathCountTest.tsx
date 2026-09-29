import { useEffect, useRef, useState } from 'react'

const DURATION_S = 180 // 3 minutes
const CYCLE_LENGTH = 9
const PULSE_MIN_MS = 900
const PULSE_MAX_MS = 1600
const PULSE_FLASH_MS = 450
const MAX_BREATH_MS = 5000
const MIN_BREATH_MS = 500

type Phase = 'idle' | 'running' | 'done'

interface Breakdown {
  accuracyPct: number
  selfMonitoringPct: number
  impulseControlPct: number
  composite: number
}

interface BreathCountTestProps {
  onComplete: (composite: number) => void
}

export default function BreathCountTest({ onComplete }: BreathCountTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(DURATION_S)
  const [position, setPosition] = useState(1) // where we think the participant is in the 1-9 cycle
  const [pulseActive, setPulseActive] = useState(false)
  const [usePulseVisualization, setPulseVisualization] = useState(true)
  const [successfulCycles, setSuccessfulCycles] = useState(0)
  const [missedNinth, setMissedNinth] = useState(0) // silent miscount: blew past 9 without noticing
  const [earlyNinth, setEarlyNinth] = useState(0) // impulse-control failure: pressed 9th too soon
  const [selfCaughtResets, setSelfCaughtResets] = useState(0) // voluntary "Lost Count" — good self-monitoring
  const [badBreathCount, setBadBreathCount] = useState(0)
  const [lastBreath, setLastBreath] = useState<number | null>(null)
  const [result, setResult] = useState<Breakdown | null>(null)

  const intervalRef = useRef<number | undefined>(undefined)
  const pulseTimeoutRef = useRef<number | undefined>(undefined)
  const flashTimeoutRef = useRef<number | undefined>(undefined)

  // Refs mirror state so timer/pulse closures (captured once, at start()) read live values
  // rather than the stale values from when they were scheduled.
  const phaseRef = useRef<Phase>('idle')
  const successfulCyclesRef = useRef(0)
  const missedNinthRef = useRef(0)
  const earlyNinthRef = useRef(0)
  const selfCaughtResetsRef = useRef(0)
  const badBreathCountRef = useRef(0)
  const lastBreathRef = useRef<number | null>(null)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    successfulCyclesRef.current = successfulCycles
  }, [successfulCycles])
  useEffect(() => {
    missedNinthRef.current = missedNinth
  }, [missedNinth])
  useEffect(() => {
    earlyNinthRef.current = earlyNinth
  }, [earlyNinth])
  useEffect(() => {
    selfCaughtResetsRef.current = selfCaughtResets
  }, [selfCaughtResets])
  useEffect(() => {
    badBreathCountRef.current = badBreathCount
  }, [badBreathCount])
  useEffect(() => {
    lastBreathRef.current = lastBreath
  }, [lastBreath])

  useEffect(
    () => () => {
      window.clearInterval(intervalRef.current)
      window.clearTimeout(pulseTimeoutRef.current)
      window.clearTimeout(flashTimeoutRef.current)
    },
    [],
  )

  const schedulePulse = () => {
    const delay = PULSE_MIN_MS + Math.random() * (PULSE_MAX_MS - PULSE_MIN_MS)
    pulseTimeoutRef.current = window.setTimeout(() => {
      if (phaseRef.current !== 'running') return
      setPulseActive(true)
      flashTimeoutRef.current = window.setTimeout(() => setPulseActive(false), PULSE_FLASH_MS)
      schedulePulse()
    }, delay)
  }

  const finish = () => {
    window.clearInterval(intervalRef.current)
    window.clearTimeout(pulseTimeoutRef.current)
    window.clearTimeout(flashTimeoutRef.current)
    setPhase('done')

    const cycles = successfulCyclesRef.current
    const missed = missedNinthRef.current
    const early = earlyNinthRef.current
    const caught = selfCaughtResetsRef.current
    const badBreaths = badBreathCountRef.current

    const totalAttempts = cycles + missed + early + caught + badBreaths
    const accuracyPct = totalAttempts > 0 ? Math.round((cycles / totalAttempts) * 100) : 0

    // Of every time they genuinely lost track (silently or caught), what fraction did they notice themselves?
    const lostTrackEvents = missed + caught
    const selfMonitoringPct = lostTrackEvents > 0 ? Math.round((caught / lostTrackEvents) * 100) : 100

    // How often did they jump the gun on "9th" relative to total cycle attempts?
    const impulseControlPct = totalAttempts > 0 ? Math.round(100 - (early / totalAttempts) * 100) : 100

    const composite = Math.round((accuracyPct + selfMonitoringPct + impulseControlPct) / 3)

    setResult({ accuracyPct, selfMonitoringPct, impulseControlPct, composite })
    // min cycles should be considered for the composite score if total attempts are less than 4 then individual might have cheated or done poorly enough to be docked points
    onComplete(totalAttempts < 4 ? Math.round(composite / 2) : composite)
  }

  const start = () => {
    setSuccessfulCycles(0)
    setMissedNinth(0)
    setEarlyNinth(0)
    setBadBreathCount(0)
    setSelfCaughtResets(0)
    setPosition(1)
    setSecondsLeft(DURATION_S)
    setResult(null)
    setPhase('running')
    schedulePulse()
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

  const pressContinue = () => {
    if (phase !== 'running') return
    if (lastBreathRef.current === null) {
      setLastBreath(Date.now())
    } else {
      const breathInterval = lastBreathRef.current ? Date.now() - lastBreathRef.current : 0
      if (breathInterval < MIN_BREATH_MS || breathInterval > MAX_BREATH_MS) {
        setBadBreathCount((b) => b + 1)
      }
      setLastBreath(Date.now())
    }
    if (position === CYCLE_LENGTH) {
      // Should have pressed "9th" instead — silent miscount, an attention lapse they didn't catch
      setMissedNinth((m) => m + 1)
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
      // Pressed "9th" early — an impulse-control failure, not an attention lapse
      setEarlyNinth((e) => e + 1)
    }
    setPosition(1)
    setLastBreath(Date.now())
  }

  const pressLostCount = () => {
    if (phase !== 'running') return
    // Self-caught error — they noticed and voluntarily reset. Good metacognitive monitoring.
    setSelfCaughtResets((c) => c + 1)
    setPosition(1)
    setLastBreath(Date.now())
  }

  function setUsePulseVisualization(checked: boolean): void {
    setPulseVisualization(checked)
  }

  return (
    <div className="breath-test">
      {phase === 'idle' && (
        <>
          <p className="breath-instructions">
            A soft pulse will appear at irregular intervals — no need to breathe in any particular rhythm, just
            watch for it. Tap <strong>Continue</strong> for each pulse except the 9th in a row — tap{' '}
            <strong>9th</strong> for that one instead, then it resets to 1. Tap <strong>Lost Count</strong> any time
            you notice you've drifted.
          </p>
          <div className="mb-2">
            <input type="checkbox" className="form-control mb-2" checked={usePulseVisualization} onChange={(e) => setUsePulseVisualization(e.target.checked)} />
            <label>Use Pulse visualization</label>
          </div>
          <button type="button" className="btn btn-primary" onClick={start}>
            Start (3 min)
          </button>
        </>
      )}
      {phase === 'running' && (
        <>
          <div className="breath-timer">{secondsLeft}s left</div>
          {usePulseVisualization && (
            <div className={`breath-pulse ${pulseActive ? 'breath-pulse--active' : ''}`} aria-hidden="true" />
          )}
          <div className="breath-buttons">
            <button type="button" className="btn btn-primary breath-btn breath-btn--main" onClick={pressContinue}>
              Continue
            </button>
            <button type="button" className="btn btn-primary breath-btn breath-btn--ninth" onClick={pressNinth}>
              9th
            </button>
          </div>
          <button type="button" className="btn btn-primary breath-lost-btn" onClick={pressLostCount}>
            Lost Count
          </button>
          <p className="breath-stats">
            {successfulCycles} cycles complete · {missedNinth + earlyNinth + selfCaughtResets + badBreathCount} errors
          </p>
        </>
      )}
      {phase === 'done' && result && (
        <div className="breath-results">
          <p className="breath-stats">
            {successfulCycles} complete cycles · {missedNinth} missed · {earlyNinth} early · {selfCaughtResets}{' '}
            self-caught
          </p>
          <div className="breath-breakdown">
            <span>Accuracy: {result.accuracyPct}%</span>
            <span>Self-monitoring: {result.selfMonitoringPct}%</span>
            <span>Impulse control: {result.impulseControlPct}%</span>
          </div>
        </div>
      )}
    </div>
  )
}