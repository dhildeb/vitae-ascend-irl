import { useState } from 'react'
import type { Profile } from '../types'
import type { WeightUnit } from '../units'
import { toKg, fromKg, loadUnitPref, saveUnitPref } from '../units'

interface ProfileSetupProps {
  onComplete: (profile: Profile) => void
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [unit, setUnit] = useState<WeightUnit>(loadUnitPref)
  const [weight, setWeight] = useState('')

  const numeric = Number(weight)
  const kgValue = weight !== '' && !Number.isNaN(numeric) ? toKg(numeric, unit) : null
  const canSubmit = kgValue !== null && kgValue > 20 && kgValue < 300

  const handleUnitChange = (next: WeightUnit) => {
    if (kgValue !== null) {
      setWeight(fromKg(kgValue, next).toFixed(1))
    }
    setUnit(next)
    saveUnitPref(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (kgValue === null || !canSubmit) return
    onComplete({ bodyweightKg: Math.round(kgValue * 10) / 10 })
  }

  return (
    <div className="profile-setup">
      <span className="page-eyebrow">Before we begin</span>
      <h2>What&apos;s your bodyweight?</h2>
      <p className="profile-explainer">
        No age, no sex — one fixed scale for everyone. Your bodyweight is only used to convert push-up and pull-up
        reps into an estimated absolute load, so a heavier, stronger person isn&apos;t out-scored by a lighter person
        doing more reps. Nothing is sent anywhere.
      </p>
      <form onSubmit={handleSubmit} className="profile-form">
        <label htmlFor="weight">Bodyweight</label>
        <div className="weight-input-row">
          <input
            id="weight"
            type="number"
            min={unit === 'kg' ? 20 : 44}
            max={unit === 'kg' ? 300 : 660}
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === 'kg' ? 'e.g. 90' : 'e.g. 199'}
            autoFocus
          />
          <div className="unit-toggle">
            <button
              type="button"
              className={`unit-option ${unit === 'kg' ? 'unit-option--active' : ''}`}
              onClick={() => handleUnitChange('kg')}
            >
              kg
            </button>
            <button
              type="button"
              className={`unit-option ${unit === 'lb' ? 'unit-option--active' : ''}`}
              onClick={() => handleUnitChange('lb')}
            >
              lb
            </button>
          </div>
        </div>
        {kgValue !== null && (
          <p className="weight-preview">
            = {unit === 'kg' ? `${fromKg(kgValue, 'lb').toFixed(1)} lb` : `${kgValue.toFixed(1)} kg`}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          Start testing
        </button>
      </form>
    </div>
  )
}
