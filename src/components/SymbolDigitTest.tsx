import { useEffect, useRef, useState } from 'react'

const SYMBOLS = ['\u2660', '\u2663', '\u2665', '\u2666', '\u2605', '\u2600', '\u2601', '\u26A1', '\u25C6']
const DURATION_S = 90

function shuffledDigits(): number[] {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[digits[i], digits[j]] = [digits[j], digits[i]]
  }
  return digits
}

type Phase = 'idle' | 'running' | 'done'

interface SymbolDigitTestProps {
  onComplete: (correctCount: number) => void
}

export default function SymbolDigitTest({ onComplete }: SymbolDigitTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(DURATION_S)
  const [currentSymbol, setCurrentSymbol] = useState('')
  const [correctCount, setCorrectCount] = useState(0)
  const keyRef = useRef<Record<string, number>>({})
  const intervalRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(intervalRef.current), [])

  const nextSymbol = () => {
    setCurrentSymbol(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
  }

  const start = () => {
    const digits = shuffledDigits()
    const key: Record<string, number> = {}
    SYMBOLS.forEach((s, i) => (key[s] = digits[i]))
    keyRef.current = key
    setCorrectCount(0)
    setSecondsLeft(DURATION_S)
    setPhase('running')
    nextSymbol()
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

  const handleDigit = (digit: number) => {
    if (phase !== 'running') return
    if (keyRef.current[currentSymbol] === digit) setCorrectCount((c) => c + 1)
    nextSymbol()
  }

  useEffect(() => {
    if (phase === 'done') onComplete(correctCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <div className="symbol-digit-test">
      {phase === 'idle' && (
        <button type="button" className="btn btn-primary" onClick={start}>
          Start (90s)
        </button>
      )}
      {phase !== 'idle' && (
        <>
          <div className="symbol-digit-key">
            {SYMBOLS.map((s) => (
              <div key={s} className="symbol-digit-key-pair">
                <span className="symbol-digit-symbol">{s}</span>
                <span className="symbol-digit-arrow">→</span>
                <span className="symbol-digit-digit">{keyRef.current[s]}</span>
              </div>
            ))}
          </div>
          {phase === 'running' && (
            <>
              <div className="symbol-digit-current">{currentSymbol}</div>
              <div className="symbol-digit-buttons">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <button key={d} className="symbol-digit-btn" onClick={() => handleDigit(d)}>
                    {d}
                  </button>
                ))}
              </div>
              <p className="symbol-digit-stats">
                {secondsLeft}s left · {correctCount} correct
              </p>
            </>
          )}
          {phase === 'done' && <p className="symbol-digit-stats">Done — {correctCount} correct</p>}
        </>
      )}
    </div>
  )
}
