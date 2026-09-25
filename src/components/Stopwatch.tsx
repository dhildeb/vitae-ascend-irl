import { useEffect, useRef, useState } from 'react'

interface StopwatchProps {
  onCapture: (seconds: number) => void
}

export default function Stopwatch({ onCapture }: StopwatchProps) {
  const [running, setRunning] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const startedAtRef = useRef<number>(0)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!running) return
    const tick = () => {
      setElapsedMs(performance.now() - startedAtRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [running])

  const start = () => {
    startedAtRef.current = performance.now()
    setElapsedMs(0)
    setRunning(true)
  }

  const stop = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setElapsedMs(0)
  }

  const seconds = elapsedMs / 1000

  return (
    <div className="stopwatch">
      {!running && (
        <div className="manual-time">
          <input
            className="manual-time-input"
            type="number"
            step="0.1"
            value={seconds.toFixed(1)}
            onChange={(e) => setElapsedMs(parseFloat(e.target.value) * 1000)}
          />
        </div>
      )}
      <div className="stopwatch-display">{seconds.toFixed(1)}s</div>
      <div className="stopwatch-controls">
        {!running && elapsedMs === 0 && (
          <button type="button" className="btn btn-primary" onClick={start}>
            Start
          </button>
        )}
        {running && (
          <button type="button" className="btn btn-primary" onClick={stop}>
            Stop
          </button>
        )}
        {!running && elapsedMs > 0 && (
          <>
            <button type="button" className="btn btn-outline" onClick={reset}>
              Reset
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onCapture(seconds)}>
              Use {seconds.toFixed(1)}s
            </button>
          </>
        )}
      </div>
    </div>
  )
}
