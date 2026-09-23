import { useEffect, useMemo, useState } from 'react'

interface Item {
  name: string
  emoji: string
}

const ITEM_POOL: Item[] = [
  { name: 'candle', emoji: '\u{1F56F}️' },
  { name: 'key', emoji: '\u{1F5DD}️' },
  { name: 'scroll', emoji: '\u{1F4DC}' },
  { name: 'sword', emoji: '⚔️' },
  { name: 'shield', emoji: '\u{1F6E1}️' },
  { name: 'coin pouch', emoji: '\u{1F4B0}' },
  { name: 'goblet', emoji: '\u{1F377}' },
  { name: 'bow', emoji: '\u{1F3F9}' },
  { name: 'orb', emoji: '\u{1F52E}' },
  { name: 'axe', emoji: '\u{1FA93}' },
  { name: 'potion', emoji: '\u{1F9EA}' },
  { name: 'tome', emoji: '\u{1F4D6}' },
  { name: 'gem', emoji: '\u{1F48E}' },
  { name: 'bone', emoji: '\u{1F9B4}' },
]

const COLORS = ['#b0453a', '#3a6fb0', '#4a8f5c', '#c9a24a', '#7a5aa8', '#7d7d7d']
const SHOWN_COUNT = 6
const ROUND_COUNT = 5
const EXPOSURE_MS = 4000

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

interface PlacedItem extends Item {
  color: string
}

type QuestionType = 'count-color' | 'position' | 'not-shown'

interface Round {
  items: PlacedItem[]
  questionType: QuestionType
  prompt: string
  swatchColor?: string
  options: string[]
  correctIndex: number
}

function buildRound(): Round {
  const shownItems = shuffle(ITEM_POOL).slice(0, SHOWN_COUNT)
  const unshownItems = ITEM_POOL.filter((it) => !shownItems.includes(it))
  const items: PlacedItem[] = shownItems.map((it) => ({ ...it, color: COLORS[Math.floor(Math.random() * COLORS.length)] }))

  const types: QuestionType[] = ['count-color', 'position', 'not-shown']
  const questionType = types[Math.floor(Math.random() * types.length)]

  if (questionType === 'count-color') {
    const color = items[Math.floor(Math.random() * items.length)].color
    const correctCount = items.filter((it) => it.color === color).length
    const candidateCounts = new Set<number>([correctCount])
    while (candidateCounts.size < 4) {
      const c = Math.floor(Math.random() * (SHOWN_COUNT + 1))
      candidateCounts.add(c)
    }
    const options = shuffle(Array.from(candidateCounts)).map(String)
    return {
      items,
      questionType,
      prompt: 'How many items had this color?',
      swatchColor: color,
      options,
      correctIndex: options.indexOf(String(correctCount)),
    }
  }

  if (questionType === 'position') {
    const pos = Math.floor(Math.random() * items.length)
    const correct = items[pos]
    const distractors = shuffle(unshownItems).slice(0, 3)
    const options = shuffle([correct, ...distractors])
    return {
      items,
      questionType,
      prompt: `What was in position ${pos + 1}, counting from the left?`,
      options: options.map((it) => it.emoji),
      correctIndex: options.indexOf(correct),
    }
  }

  // not-shown: 1 unseen item (correct) + 3 items that were actually shown
  const correct = shuffle(unshownItems)[0]
  const distractors = shuffle(items).slice(0, 3)
  const options = shuffle([correct, ...distractors])
  return {
    items,
    questionType,
    prompt: 'Which of these was NOT among the items you saw?',
    options: options.map((it) => it.emoji),
    correctIndex: options.indexOf(correct),
  }
}

type Phase = 'idle' | 'exposure' | 'question' | 'done'

interface SceneRecallTestProps {
  onComplete: (correctCount: number) => void
}

export default function SceneRecallTest({ onComplete }: SceneRecallTestProps) {
  const rounds = useMemo(() => Array.from({ length: ROUND_COUNT }, buildRound), [])
  const [phase, setPhase] = useState<Phase>('idle')
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<number | null>(null)

  const round = rounds[index]

  useEffect(() => {
    if (phase !== 'exposure') return
    const t = window.setTimeout(() => setPhase('question'), EXPOSURE_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  const start = () => setPhase('exposure')

  const handleAnswer = (i: number) => {
    if (feedback !== null) return
    setFeedback(i)
    const isCorrect = i === round.correctIndex
    const nextCount = correctCount + (isCorrect ? 1 : 0)
    setCorrectCount(nextCount)
    setTimeout(() => {
      setFeedback(null)
      if (index + 1 >= ROUND_COUNT) {
        setPhase('done')
        onComplete(nextCount)
      } else {
        setIndex(index + 1)
        setPhase('exposure')
      }
    }, 1200)
  }

  return (
    <div className="scene-recall-test">
      <p className="matrix-progress">
        Round {index + 1} of {ROUND_COUNT}
      </p>

      {phase === 'idle' && (
        <>
          <p className="gonogo-hint">A set of items will flash briefly. Watch closely — you won't know the question until after.</p>
          <button type="button" className="btn btn-primary" onClick={start}>
            Start
          </button>
        </>
      )}

      {phase === 'exposure' && (
        <div className="scene-recall-row">
          {round.items.map((it, i) => (
            <div key={i} className="scene-recall-item" style={{ backgroundColor: it.color }}>
              {it.emoji}
            </div>
          ))}
        </div>
      )}

      {(phase === 'question' || (phase === 'done' && feedback !== null)) && (
        <>
          <p className="insight-text">
            {round.prompt}
            {round.swatchColor && <span className="scene-recall-swatch" style={{ backgroundColor: round.swatchColor }} />}
          </p>
          <div className={round.questionType === 'count-color' ? 'insight-options' : 'scene-recall-emoji-options'}>
            {round.options.map((opt, i) => (
              <button
                key={i}
                className={`insight-option ${feedback !== null && i === round.correctIndex ? 'insight-option--correct' : ''}`}
                onClick={() => handleAnswer(i)}
                disabled={feedback !== null}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'done' && feedback === null && <div className="gonogo-letter">Done</div>}
    </div>
  )
}
