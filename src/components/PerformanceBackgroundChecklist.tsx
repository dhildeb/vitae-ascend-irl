import { useState } from 'react'

const OPTIONS = [
  'Plays a musical instrument',
  'Public speaking or debate experience',
  'Theater, improv, or performance experience',
  'Sales or persuasion-heavy work',
  'Teaching, coaching, or training others',
  'Podcasting, streaming, or content creation',
]

interface PerformanceBackgroundChecklistProps {
  onComplete: (count: number) => void
}

export default function PerformanceBackgroundChecklist({ onComplete }: PerformanceBackgroundChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(Array(OPTIONS.length).fill(false))

  const toggle = (i: number) => {
    const next = [...checked]
    next[i] = !next[i]
    setChecked(next)
  }

  const handleSubmit = () => {
    onComplete(checked.filter(Boolean).length)
  }

  return (
    <div className="checklist-test">
      {OPTIONS.map((opt, i) => (
        <label key={i} className="checklist-item">
          <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} />
          <span>{opt}</span>
        </label>
      ))}
      <button type="button" className="btn btn-primary" onClick={handleSubmit}>
        Save Score
      </button>
    </div>
  )
}