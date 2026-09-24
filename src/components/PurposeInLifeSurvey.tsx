import { useState } from 'react'

interface Item {
  text: string
  reverse: boolean
}

const ITEMS: Item[] = [
  { text: 'My life has a clear sense of direction or purpose.', reverse: false },
  { text: 'I feel that what I do matters, beyond just myself.', reverse: false },
  { text: 'I often feel disconnected from any larger meaning in my life.', reverse: true },
  { text: 'I regularly take time to reflect on my values and what matters most to me.', reverse: false },
  {
    text: 'I feel a sense of connection to something greater than myself (community, nature, faith, or similar).',
    reverse: false,
  },
  { text: 'I rarely feel like my daily actions align with my deeper values.', reverse: true },
]

interface PurposeInLifeSurveyProps {
  onComplete: (avgScore: number) => void
}

export default function PurposeInLifeSurvey({ onComplete }: PurposeInLifeSurveyProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(ITEMS.length).fill(null))

  const setAnswer = (index: number, value: number) => {
    const next = [...answers]
    next[index] = value
    setAnswers(next)
  }

  const allAnswered = answers.every((a) => a !== null)

  const handleSubmit = () => {
    if (!allAnswered) return
    const adjusted = answers.map((a, i) => (ITEMS[i].reverse ? 8 - (a as number) : (a as number)))
    const avg = adjusted.reduce((sum, v) => sum + v, 0) / adjusted.length
    onComplete(Math.round(avg * 10) / 10)
  }

  return (
    <div className="likert-survey">
      {ITEMS.map((item, i) => (
        <div key={i} className="likert-item">
          <p className="likert-text">{item.text}</p>
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
        </div>
      ))}
      <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered}>
        Save Score
      </button>
    </div>
  )
}
