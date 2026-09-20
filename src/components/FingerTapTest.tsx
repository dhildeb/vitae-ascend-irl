import { useEffect, useRef, useState } from 'react'

const TEST_DURATION_MS = 10000

type Phase = 'idle' | 'running' | 'done'

interface FingerTapTestProps {
  onComplete: (taps: number) => void
}

export default function FingerTapTest({ onComplete }: FingerTapTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [taps, setTaps] = useState(0)
  const [msLeft, setMsLeft] = useState(TEST_DURATION_MS)
  const endAtRef = useRef<number>(0)
  const rafRef = useRef<number | undefined>(undefined)
  const finalTapsRef = useRef(0)

  useEffect(() => {
    if (phase !== 'running') return
    const tick = () => {
      const remaining = endAtRef.current - performance.now()
      if (remaining <= 0) {
        setMsLeft(0)
        setPhase('done')
        onComplete(finalTapsRef.current)
        return
      }
      setMsLeft(remaining)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const handleTap = () => {
    if (phase === 'idle') {
      endAtRef.current = performance.now() + TEST_DURATION_MS
      finalTapsRef.current = 0
      setTaps(0)
      setPhase('running')
      return
    }
    if (phase === 'running') {
      finalTapsRef.current += 1
      setTaps(finalTapsRef.current)
    }
  }

  const retry = () => {
    setPhase('idle')
    setTaps(0)
    setMsLeft(TEST_DURATION_MS)
  }

  return (
    <div className="tap-test">
      {phase !== 'done' ? (
        <button type="button" className={`tap-pad tap-pad--${phase}`} onClick={handleTap}>
          {phase === 'idle' ? 'Tap to start' : 'TAP!'}
        </button>
      ) : (
        <div className="tap-pad tap-pad--done">Done</div>
      )}
      <div className="tap-stats">
        <span>{taps} taps</span>
        <span>{(msLeft / 1000).toFixed(1)}s left</span>
      </div>
      {phase === 'done' && (
        <button type="button" className="btn btn-outline" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  )
}
