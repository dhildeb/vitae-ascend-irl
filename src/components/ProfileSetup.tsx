import { useState } from 'react'
import type { Profile } from '../types'
import type { WeightUnit } from '../units'
import { toKg, fromKg, loadUnitPref, saveUnitPref } from '../units'

interface ProfileSetupProps {
  onComplete: (profile: Profile) => void
  currentProfile?: Profile | null
}

const profiles: Profile[] = JSON.parse(localStorage.getItem('profiles') || '[]')

export default function ProfileSetup({ onComplete, currentProfile }: ProfileSetupProps) {
  const [unit, setUnit] = useState<WeightUnit>(loadUnitPref)
  const [name, setName] = useState(currentProfile?.name || '')
  const [createNew, setCreateNew] = useState(profiles.length === 0)
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
    if (kgValue === null || name.trim() === '' || !canSubmit) return
    window.localStorage.setItem('profiles', JSON.stringify([...profiles.filter(p => p.name !== name), { name, bodyweightKg: Math.round(kgValue * 10) / 10 }]))
    onComplete({ name: name, bodyweightKg: Math.round(kgValue * 10) / 10 })
  }

  if (profiles.length > 0 && !createNew && currentProfile === null) {
    return (
      <div className="profile-setup">
        <div className="profile-selections">
          <h2>Hale and well met adventurer!</h2>
          {profiles.map((profile) => (
            <button className="btn btn-outline btn-small" key={profile.name} onClick={() => onComplete(profile)}>{profile.name}</button>
          ))}
        </div>
        <button className="btn btn-outline btn-outline--done btn-small" onClick={() => setCreateNew(true)}>Create new profile</button>
      </div>
    )
  }

  return (
    <div className="profile-setup">
      <span className="page-eyebrow">Before we begin</span>
      <h2>What's your name and bodyweight?</h2>
      <p className="profile-explainer">
        Your bodyweight is only used to help determine strength scores.
      </p>
      <form onSubmit={handleSubmit} className="profile-form">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Arthur Pendragon"
          disabled={!createNew}
        />
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
