import { useMemo, useState } from 'react'

type ShapeType = 'circle' | 'triangle' | 'square' | 'pentagon' | 'star'
type Fill = 'solid' | 'outline'

interface CellSpec {
  shape: ShapeType
  rotation: number
  fill: Fill
}

const SHAPES: ShapeType[] = ['circle', 'triangle', 'square', 'pentagon', 'star']
const ROTATIONS = [0, 120, 240]
const PUZZLE_COUNT = 8

function pickThreeDistinctShapes(): ShapeType[] {
  const pool = [...SHAPES]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 3)
}

function pick<T>(arr: T[], exclude: T[] = []): T {
  const pool = arr.filter((x) => !exclude.includes(x))
  return pool[Math.floor(Math.random() * pool.length)]
}

function shapePath(shape: ShapeType): string {
  switch (shape) {
    case 'circle':
      return 'M 25 5 A 20 20 0 1 1 24.9 5 Z'
    case 'square':
      return 'M 6 6 L 44 6 L 44 44 L 6 44 Z'
    case 'triangle':
      return 'M 25 4 L 46 44 L 4 44 Z'
    case 'pentagon':
      return 'M 25 3 L 46 19 L 38 43 L 12 43 L 4 19 Z'
    case 'star': {
      const pts: string[] = []
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 22 : 9
        const a = (Math.PI / 5) * i - Math.PI / 2
        pts.push(`${25 + r * Math.cos(a)},${25 + r * Math.sin(a)}`)
      }
      return `M ${pts.join(' L ')} Z`
    }
  }
}

function CellSvg({ cell }: { cell: CellSpec }) {
  return (
    <svg viewBox="0 0 50 50" className="matrix-cell-svg">
      <path
        d={shapePath(cell.shape)}
        transform={`rotate(${cell.rotation} 25 25)`}
        fill={cell.fill === 'solid' ? 'var(--ember)' : 'none'}
        stroke="var(--ember)"
        strokeWidth={3}
      />
    </svg>
  )
}

interface Puzzle {
  grid: CellSpec[][]
  options: CellSpec[]
  correctIndex: number
}
function generatePuzzle(level: number): Puzzle {
  const shapes = pickThreeDistinctShapes()
  while (new Set(shapes).size < 3) shapes[2] = pick(SHAPES)
  const rotations = level >= 3 ? ROTATIONS : [0, 0, 0]

  const grid: CellSpec[][] = []
  for (let r = 0; r < 3; r++) {
    const row: CellSpec[] = []
    for (let c = 0; c < 3; c++) {
      const fill: Fill = level >= 6 ? ((r + c) % 2 === 0 ? 'solid' : 'outline') : 'solid'
      row.push({ shape: shapes[c], rotation: rotations[r], fill })
    }
    grid.push(row)
  }

  const correct = grid[2][2]
  const distractors: CellSpec[] = []
  // Wrong shape, right rotation/fill
  distractors.push({ ...correct, shape: pick(SHAPES, [correct.shape]) })
  // Right shape, wrong rotation (only meaningful if rotation varies)
  distractors.push({ ...correct, rotation: pick(ROTATIONS, [correct.rotation]) })
  // Wrong shape AND wrong rotation
  distractors.push({
    shape: pick(SHAPES, [correct.shape]),
    rotation: pick(ROTATIONS, [correct.rotation]),
    fill: correct.fill,
  })

  const options = [correct, ...distractors]
  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
  }

  return { grid, options, correctIndex: options.findIndex((o) => o === correct) }
}

const LEVELS = [1, 1, 2, 2, 3, 3, 6, 6]

interface MatrixReasoningTestProps {
  onComplete: (correctCount: number) => void
}

export default function MatrixReasoningTest({ onComplete }: MatrixReasoningTestProps) {
  const [round, setRound] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const puzzle = useMemo(() => generatePuzzle(LEVELS[round]), [round])

  const handleAnswer = (index: number) => {
    if (feedback) return
    const isCorrect = index === puzzle.correctIndex
    setFeedback(isCorrect ? 'correct' : 'wrong')
    const nextCount = correctCount + (isCorrect ? 1 : 0)
    setCorrectCount(nextCount)
    setTimeout(() => {
      setFeedback(null)
      if (round + 1 >= PUZZLE_COUNT) {
        onComplete(nextCount)
      } else {
        setRound(round + 1)
      }
    }, 700)
  }

  return (
    <div className="matrix-test">
      <p className="matrix-progress">
        Puzzle {round + 1} of {PUZZLE_COUNT}
      </p>
      <div className="matrix-grid">
        {puzzle.grid.map((row, r) =>
          row.map((cell, c) =>
            r === 2 && c === 2 ? (
              <div key="missing" className="matrix-cell matrix-cell--missing">
                ?
              </div>
            ) : (
              <div key={`${r}-${c}`} className="matrix-cell">
                <CellSvg cell={cell} />
              </div>
            ),
          ),
        )}
      </div>
      <div className="matrix-options">
        {puzzle.options.map((opt, i) => (
          <button
            key={i}
            className={`matrix-option ${feedback && i === puzzle.correctIndex ? 'matrix-option--correct' : ''} ${feedback === 'wrong' && i !== puzzle.correctIndex ? '' : ''
              }`}
            onClick={() => handleAnswer(i)}
            disabled={feedback !== null}
          >
            <CellSvg cell={opt} />
          </button>
        ))}
      </div>
    </div>
  )
}
