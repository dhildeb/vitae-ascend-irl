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
    <div className="flex flex-col items-center gap-4 pt-2">
      <div className="font-mono text-[44px] font-bold text-[#26221c]">{seconds.toFixed(1)}s</div>
      <div className="flex gap-2.5">
        {!running && elapsedMs === 0 && (
          <button type="button" className="rounded-[3px] bg-[#a33b2e] px-[18px] py-[11px] text-sm font-semibold text-[#efe7d8] transition-colors hover:bg-[#832d22]" onClick={start}>
            Start
          </button>
        )}
        {running && (
          <button type="button" className="rounded-[3px] bg-[#a33b2e] px-[18px] py-[11px] text-sm font-semibold text-[#efe7d8] transition-colors hover:bg-[#832d22]" onClick={stop}>
            Stop
          </button>
        )}
        {!running && elapsedMs > 0 && (
          <>
            <button type="button" className="rounded-[3px] border border-[#26221c] bg-transparent px-[18px] py-[11px] text-sm font-semibold text-[#26221c]" onClick={reset}>
              Reset
            </button>
            <button type="button" className="rounded-[3px] bg-[#a33b2e] px-[18px] py-[11px] text-sm font-semibold text-[#efe7d8] transition-colors hover:bg-[#832d22]" onClick={() => onCapture(seconds)}>
              Use {seconds.toFixed(1)}s
            </button>
          </>
        )}
      </div>
    </div>
  )
}
