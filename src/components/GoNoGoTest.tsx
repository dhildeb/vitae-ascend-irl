import { useEffect, useRef, useState } from 'react'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W']
const STOP_LETTER = 'X'
const TRIAL_COUNT = 30
const EXPOSURE_MS = 800
const STOP_PROB = 0.25

function generateSequence(): string[] {
  const seq: string[] = []
  for (let i = 0; i < TRIAL_COUNT; i++) {
    if (Math.random() < STOP_PROB) {
      seq.push(STOP_LETTER)
    } else {
      seq.push(LETTERS[Math.floor(Math.random() * LETTERS.length)])
    }
  }
  return seq
}

type Phase = 'idle' | 'running' | 'done'

interface GoNoGoTestProps {
  onComplete: (compositePct: number) => void
}

// Respond to every letter except the reserved "stop" letter, withholding on that one. Unlike
// a hypothetical choice test, always-respond and never-respond both score ~50% here — there's
// no static strategy that beats actually exercising inhibition. See CLAUDE.md.
export default function GoNoGoTest({ onComplete }: GoNoGoTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [index, setIndex] = useState(0)
  const sequenceRef = useRef<string[]>([])
  const respondedRef = useRef(false)
  const goHitsRef = useRef(0)
  const goTotalRef = useRef(0)
  const noGoHitsRef = useRef(0)
  const noGoTotalRef = useRef(0)
  const timeoutRef = useRef<number | undefined>(undefined)

  const evaluate = (i: number) => {
    const letter = sequenceRef.current[i]
    if (letter === STOP_LETTER) {
      noGoTotalRef.current += 1
      if (!respondedRef.current) noGoHitsRef.current += 1
    } else {
      goTotalRef.current += 1
      if (respondedRef.current) goHitsRef.current += 1
    }
  }

  const advance = (i: number) => {
    evaluate(i)
    respondedRef.current = false

    if (i + 1 >= TRIAL_COUNT) {
      setPhase('done')
      const goPct = goTotalRef.current > 0 ? goHitsRef.current / goTotalRef.current : 0
      const noGoPct = noGoTotalRef.current > 0 ? noGoHitsRef.current / noGoTotalRef.current : 0
      onComplete(Math.round(((goPct + noGoPct) / 2) * 100))
      return
    }
    timeoutRef.current = window.setTimeout(() => {
      setIndex(i + 1)
      advance(i + 1)
    }, EXPOSURE_MS)
  }

  const start = () => {
    sequenceRef.current = generateSequence()
    goHitsRef.current = 0
    goTotalRef.current = 0
    noGoHitsRef.current = 0
    noGoTotalRef.current = 0
    respondedRef.current = false
    setIndex(0)
    setPhase('running')
    timeoutRef.current = window.setTimeout(() => advance(0), EXPOSURE_MS)
  }

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const handleRespond = () => {
    if (phase === 'running') respondedRef.current = true
  }

  return (
    <div className="gonogo-test">
      {phase === 'idle' && (
        <>
          <p className="gonogo-hint">
            Click "Go!" for every letter — except <strong>{STOP_LETTER}</strong>. Withhold on {STOP_LETTER}.
          </p>
          <button type="button" className="btn btn-primary" onClick={start}>
            Start
          </button>
        </>
      )}
      {phase === 'running' && (
        <>
          <div className={`gonogo-letter ${sequenceRef.current[index] === STOP_LETTER ? 'gonogo-letter--stop' : ''}`}>
            {sequenceRef.current[index]}
          </div>
          <button type="button" className="btn btn-primary gonogo-go-btn" onClick={handleRespond}>
            Go!
          </button>
          <p className="nback-progress">
            {index + 1} / {TRIAL_COUNT}
          </p>
        </>
      )}
      {phase === 'done' && <div className="gonogo-letter">Done</div>}
    </div>
  )
}
