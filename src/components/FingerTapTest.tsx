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
    <div className="flex flex-col items-center gap-[14px] pt-4">
      {phase !== 'done' ? (
        <button
          type="button"
          className={`h-[140px] w-full rounded-[4px] border-none bg-[#9c7a3c] text-[18px] font-bold text-[#efe7d8] transition-transform duration-75 ${
            phase === 'running' ? 'bg-[#a33b2e]' : 'bg-[#9c7a3c]'
          } active:scale-[0.97]`}
          onClick={handleTap}
        >
          {phase === 'idle' ? 'Tap to start' : 'TAP!'}
        </button>
      ) : (
        <div className="flex h-[140px] w-full items-center justify-center rounded-[4px] bg-[#3f7a4f] text-[18px] font-bold text-[#efe7d8]">
          Done
        </div>
      )}
      <div className="flex gap-4 font-mono text-[14px] text-[#26221c]">
        <span>{taps} taps</span>
        <span>{(msLeft / 1000).toFixed(1)}s left</span>
      </div>
      {phase === 'done' && (
        <button type="button" className="rounded-[3px] border border-[#26221c] bg-transparent px-[18px] py-[11px] text-sm font-semibold text-[#26221c]" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  )
}
