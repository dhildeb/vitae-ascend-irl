import { useEffect, useRef, useState } from 'react'

const LETTERS = ['B', 'C', 'D', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T']
const TRIAL_COUNT = 24
const EXPOSURE_MS = 2000
const N_BACK = 2

function generateSequence(): string[] {
  const seq: string[] = []
  for (let i = 0; i < TRIAL_COUNT; i++) {
    if (i >= N_BACK && Math.random() < 0.3) {
      seq.push(seq[i - N_BACK])
    } else {
      seq.push(LETTERS[Math.floor(Math.random() * LETTERS.length)])
    }
  }
  return seq
}

type Phase = 'idle' | 'running' | 'done'

interface NBackTestProps {
  onComplete: (accuracyPct: number) => void
}

export default function NBackTest({ onComplete }: NBackTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [index, setIndex] = useState(0)
  const sequenceRef = useRef<string[]>([])
  const userSaidMatchRef = useRef(false)
  const correctRef = useRef(0)
  const judgedRef = useRef(0)
  const timeoutRef = useRef<number | undefined>(undefined)

  const advance = (i: number) => {
    const seq = sequenceRef.current
    if (i >= N_BACK) {
      const actualMatch = seq[i] === seq[i - N_BACK]
      judgedRef.current += 1
      if (actualMatch === userSaidMatchRef.current) correctRef.current += 1
    }
    userSaidMatchRef.current = false

    if (i + 1 >= TRIAL_COUNT) {
      timeoutRef.current = window.setTimeout(() => {
        setPhase('done')
        const pct = judgedRef.current > 0 ? Math.round((correctRef.current / judgedRef.current) * 100) : 0
        onComplete(pct)
      }, EXPOSURE_MS)
      return
    }
    timeoutRef.current = window.setTimeout(() => {
      setIndex(i + 1)
      advance(i + 1)
    }, EXPOSURE_MS)
  }

  const start = () => {
    sequenceRef.current = generateSequence()
    correctRef.current = 0
    judgedRef.current = 0
    userSaidMatchRef.current = false
    setIndex(0)
    setPhase('running')
    timeoutRef.current = window.setTimeout(() => advance(0), EXPOSURE_MS)
  }

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  const handleMatch = () => {
    if (phase === 'running') userSaidMatchRef.current = true
  }

  const canJudge = phase === 'running' && index >= N_BACK

  return (
    <div className="nback-test">
      {phase === 'idle' && (
        <button type="button" className="btn btn-primary" onClick={start}>
          Start 2-Back
        </button>
      )}
      {phase === 'running' && (
        <>
          <div className="nback-letter">{sequenceRef.current[index]}</div>
          <p className="nback-hint">{canJudge ? 'Match the letter from 2 back?' : 'Get ready...'}</p>
          <button type="button" className="btn btn-primary nback-match-btn" onClick={handleMatch} disabled={!canJudge}>
            Match!
          </button>
          <p className="nback-progress">
            {index + 1} / {TRIAL_COUNT}
          </p>
        </>
      )}
      {phase === 'done' && <div className="nback-letter">Done</div>}
    </div>
  )
}
