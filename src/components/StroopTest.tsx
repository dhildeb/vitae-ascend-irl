import { useEffect, useRef, useState } from 'react'

const COLORS: { name: string; hex: string }[] = [
  { name: 'RED', hex: '#c0392b' },
  { name: 'BLUE', hex: '#2c5aa0' },
  { name: 'GREEN', hex: '#3f7a4f' },
  { name: 'YELLOW', hex: '#c9a227' },
  { name: 'PURPLE', hex: '#7a4fa0' },
]
const DURATION_S = 45

type Phase = 'idle' | 'running' | 'done'

interface StroopTestProps {
  onComplete: (correctCount: number) => void
}

export default function StroopTest({ onComplete }: StroopTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(DURATION_S)
  const [correctCount, setCorrectCount] = useState(0)
  const [trial, setTrial] = useState<{ word: string; inkHex: string } | null>(null)
  const intervalRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(intervalRef.current), [])

  const nextTrial = () => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)].name
    const ink = COLORS[Math.floor(Math.random() * COLORS.length)]
    setTrial({ word, inkHex: ink.hex })
  }

  const start = () => {
    setCorrectCount(0)
    setSecondsLeft(DURATION_S)
    setPhase('running')
    nextTrial()
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(intervalRef.current)
          setPhase('done')
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  const handleAnswer = (hex: string) => {
    if (phase !== 'running' || !trial) return
    if (hex === trial.inkHex) setCorrectCount((c) => c + 1)
    nextTrial()
  }

  useEffect(() => {
    if (phase === 'done') onComplete(correctCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <div className="stroop-test">
      {phase === 'idle' && (
        <button type="button" className="btn btn-primary" onClick={start}>
          Start (45s)
        </button>
      )}
      {phase === 'running' && trial && (
        <>
          <div className="stroop-word" style={{ color: trial.inkHex }}>
            {trial.word}
          </div>
          <div className="stroop-buttons">
            {COLORS.map((c) => (
              <button
                key={c.name}
                className="stroop-btn"
                style={{ borderColor: c.hex, color: c.hex }}
                onClick={() => handleAnswer(c.hex)}
              >
                {c.name}
              </button>
            ))}
          </div>
          <p className="stroop-stats">
            {secondsLeft}s left · {correctCount} correct
          </p>
        </>
      )}
      {phase === 'done' && <p className="stroop-stats">Done — {correctCount} correct</p>}
    </div>
  )
}
