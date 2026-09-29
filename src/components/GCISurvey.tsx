import { useState } from 'react'

interface Item {
  text: string
  reverse: boolean
}

const ITEMS: Item[] = [
  { text: 'People tend to look to me for direction when a group needs to make a decision.', reverse: false },
  { text: 'I can usually get people on board with an idea, even if they were skeptical at first.', reverse: false },
  { text: 'When I speak up in a group, conversation tends to quiet down so people can listen.', reverse: false },
  { text: 'People often feel comfortable opening up to me shortly after we meet.', reverse: false },
  { text: 'I tend to make people feel at ease in social situations.', reverse: false },
  { text: 'I sometimes struggle to make a good first impression.', reverse: true },
]

interface GCISurveyProps {
  mode: 'self' | 'peer'
  onComplete: (avgScore: number) => void
}

export default function GCISurvey({ mode, onComplete }: GCISurveyProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(ITEMS.length).fill(null))

  const setAnswer = (index: number, value: number) => {
    const next = [...answers]
    next[index] = value
    setAnswers(next)
  }

  const allAnswered = answers.every((a) => a !== null && a >= 1 && a <= 7)

  const handleSubmit = () => {
    if (!allAnswered) return
    const adjusted = answers.map((a, i) => (ITEMS[i].reverse ? 8 - (a as number) : (a as number)))
    const avg = adjusted.reduce((sum, v) => sum + v, 0) / adjusted.length
    onComplete(Math.round(avg * 10) / 10)
  }

  return (
    <div className="likert-survey">
      {mode === 'peer' && (
        <p className="pitch-instructions">
          Send these 6 statements to 3-5 people who know you. For each one, enter the AVERAGE rating they gave
          (decimals are fine, e.g. 5.4).
        </p>
      )}
      {ITEMS.map((item, i) => (
        <div key={i} className="likert-item">
          <p className="likert-text">{item.text}</p>
          {mode === 'self' ? (
            <>
              <div className="likert-scale">
                {[1, 2, 3, 4, 5, 6, 7].map((v) => (
                  <button
                    key={v}
                    className={`likert-option ${answers[i] === v ? 'likert-option--selected' : ''}`}
                    onClick={() => setAnswer(i, v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="likert-labels">
                <span>Strongly disagree</span>
                <span>Strongly agree</span>
              </div>
            </>
          ) : (
            <input
              type="number"
              min={1}
              max={7}
              step={0.1}
              className="likert-peer-input"
              value={answers[i] ?? ''}
              onChange={(e) => setAnswer(i, Number(e.target.value))}
              placeholder="Average rating (1-7)"
            />
          )}
        </div>
      ))}
      <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered}>
        Save Score
      </button>
    </div>
  )
}