import { useEffect, useRef, useState } from 'react'

const BEAT_COUNT = 20
const BEAT_INTERVAL_MS = 600 // 100 BPM
const LEAD_IN_BEATS = 4 // establishes tempo before scoring starts

type Phase = 'idle' | 'running' | 'done'

interface RhythmTimingTestProps {
  onComplete: (avgErrorMs: number) => void
}

export default function RhythmTimingTest({ onComplete }: RhythmTimingTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [pulseActive, setPulseActive] = useState(false)
  const [beatIndex, setBeatIndex] = useState(0)

  const startTimeRef = useRef(0)
  const beatTimeoutRef = useRef<number | undefined>(undefined)
  const flashTimeoutRef = useRef<number | undefined>(undefined)
  const tapTimesRef = useRef<number[]>([])

  useEffect(
    () => () => {
      window.clearTimeout(beatTimeoutRef.current)
      window.clearTimeout(flashTimeoutRef.current)
    },
    [],
  )

  const finish = () => {
    setPhase('done')
    const start = startTimeRef.current
    const taps = tapTimesRef.current
    const scoredBeatTimes: number[] = []
    for (let i = LEAD_IN_BEATS; i < BEAT_COUNT; i++) {
      scoredBeatTimes.push(start + i * BEAT_INTERVAL_MS)
    }
    if (taps.length === 0 || scoredBeatTimes.length === 0) {
      onComplete(999)
      return
    }
    const errors = scoredBeatTimes.map((beatTime) => {
      let closest = Infinity
      for (const t of taps) {
        const diff = Math.abs(t - beatTime)
        if (diff < closest) closest = diff
      }
      return closest
    })
    const avgError = Math.round(errors.reduce((a, b) => a + b, 0) / errors.length)
    onComplete(avgError)
  }

  const scheduleBeat = (index: number) => {
    if (index >= BEAT_COUNT) {
      finish()
      return
    }
    beatTimeoutRef.current = window.setTimeout(() => {
      setPulseActive(true)
      setBeatIndex(index)
      flashTimeoutRef.current = window.setTimeout(() => setPulseActive(false), 150)
      scheduleBeat(index + 1)
    }, BEAT_INTERVAL_MS)
  }

  const start = () => {
    tapTimesRef.current = []
    setBeatIndex(0)
    setPhase('running')
    startTimeRef.current = performance.now() + BEAT_INTERVAL_MS
    scheduleBeat(0)
  }

  const handleTap = () => {
    if (phase !== 'running') return
    tapTimesRef.current.push(performance.now())
  }

  return (
    <div className="rhythm-test">
      {phase === 'idle' && (
        <>
          <p className="matrix-progress">Tap along with the pulse, right on the beat.</p>
          <button type="button" className="btn btn-primary" onClick={start}>
            Start
          </button>
        </>
      )}
      {phase === 'running' && (
        <>
          <button
            type="button"
            className={`rhythm-pulse ${pulseActive ? 'rhythm-pulse--active' : ''}`}
            onClick={handleTap}
            aria-label="Tap on the beat"
          />
          <p className="matrix-progress">
            Beat {beatIndex + 1} of {BEAT_COUNT}
          </p>
        </>
      )}
      {phase === 'done' && <p className="matrix-progress">Done</p>}
    </div>
  )
}