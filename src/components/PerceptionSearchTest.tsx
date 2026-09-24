import { useMemo, useState } from 'react'

const CONFUSABLE_PAIRS: [string, string][] = [
  ['O', 'Q'],
  ['E', 'F'],
  ['P', 'R'],
  ['C', 'G'],
  ['V', 'Y'],
  ['M', 'N'],
]
const GRID_SIZES = [16, 25, 36, 49, 64, 81] // 4x4 up to 9x9
const WRONG_CLICK_PENALTY_MS = 4000

interface Round {
  cells: string[]
  targetIndex: number
  cols: number
}

function generateRound(size: number): Round {
  const cols = Math.round(Math.sqrt(size))
  const [a, b] = CONFUSABLE_PAIRS[Math.floor(Math.random() * CONFUSABLE_PAIRS.length)]
  const [distractor, target] = Math.random() < 0.5 ? [a, b] : [b, a]
  const cells = Array(size).fill(distractor)
  const targetIndex = Math.floor(Math.random() * size)
  cells[targetIndex] = target
  return { cells, targetIndex, cols }
}

interface PerceptionSearchTestProps {
  onComplete: (avgMs: number) => void
}

export default function PerceptionSearchTest({ onComplete }: PerceptionSearchTestProps) {
  const [roundIndex, setRoundIndex] = useState(-1)
  const [times, setTimes] = useState<number[]>([])
  const [startedAt, setStartedAt] = useState<number>(() => performance.now())

  const round = useMemo(() => generateRound(GRID_SIZES[roundIndex]), [roundIndex])

  const handleNext = () => {
    setRoundIndex(roundIndex + 1)
    setStartedAt(performance.now())
  }

  const handleClick = (index: number) => {
    const isCorrect = index === round.targetIndex
    const elapsed = performance.now() - startedAt
    const scoredTime = isCorrect
      ? elapsed
      : elapsed + WRONG_CLICK_PENALTY_MS
    const nextTimes = [...times, scoredTime]

    if (roundIndex + 1 >= GRID_SIZES.length) {
      const avg = Math.round(nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length)
      onComplete(avg)
      return
    }
    setTimes(nextTimes)
    handleNext()
  }

  return (
    <div className="perception-test">
      <p className="matrix-progress">
        Round {roundIndex + 1} of {GRID_SIZES.length} — find the different letter
      </p>
      {roundIndex < 0 ? (
        <button type="button" className="btn btn-primary" onClick={handleNext}>Start</button>
      ) : (
        <div className="perception-grid" style={{ gridTemplateColumns: `repeat(${round.cols}, 1fr)` }}>
          {round.cells.map((letter, i) => (
            <button key={i} className="perception-cell" onClick={() => handleClick(i)}>
              {letter}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
