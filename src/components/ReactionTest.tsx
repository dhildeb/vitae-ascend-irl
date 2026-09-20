import { useCallback, useEffect, useRef, useState } from 'react'

const TRIALS_NEEDED = 3
const MIN_DELAY_MS = 1000
const MAX_DELAY_MS = 3000

type Phase = 'idle' | 'waiting' | 'go' | 'too-soon'

interface ReactionTestProps {
  onComplete: (averageMs: number) => void
}

export default function ReactionTest({ onComplete }: ReactionTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [trials, setTrials] = useState<number[]>([])
  const goAtRef = useRef<number>(0)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const startTrial = useCallback(() => {
    setPhase('waiting')
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
    timeoutRef.current = window.setTimeout(() => {
      goAtRef.current = performance.now()
      setPhase('go')
    }, delay)
  }, [])

  const handleClick = () => {
    if (phase === 'idle') {
      startTrial()
      return
    }
    if (phase === 'waiting') {
      window.clearTimeout(timeoutRef.current)
      setPhase('too-soon')
      return
    }
    if (phase === 'go') {
      const elapsed = performance.now() - goAtRef.current
      const nextTrials = [...trials, elapsed]
      setTrials(nextTrials)
      if (nextTrials.length >= TRIALS_NEEDED) {
        const avg = nextTrials.reduce((a, b) => a + b, 0) / nextTrials.length
        onComplete(Math.round(avg))
        setPhase('idle')
      } else {
        setPhase('idle')
      }
      return
    }
    if (phase === 'too-soon') {
      setPhase('idle')
    }
  }

  const label =
    phase === 'idle'
      ? trials.length === 0
        ? 'Click to start'
        : `Trial ${trials.length + 1} of ${TRIALS_NEEDED} — click when ready`
      : phase === 'waiting'
        ? 'Wait for green...'
        : phase === 'go'
          ? 'Click now!'
          : 'Too soon — click to retry this trial'

  return (
    <div className="reaction-test">
      <button
        type="button"
        className={`reaction-pad reaction-pad--${phase}`}
        onClick={handleClick}
      >
        {label}
      </button>
      <div className="reaction-trials">
        {Array.from({ length: TRIALS_NEEDED }).map((_, i) => (
          <span key={i} className={`reaction-pip ${i < trials.length ? 'reaction-pip--done' : ''}`}>
            {i < trials.length ? `${Math.round(trials[i])}ms` : '—'}
          </span>
        ))}
      </div>
    </div>
  )
}
