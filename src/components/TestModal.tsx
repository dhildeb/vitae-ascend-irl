import { useState } from 'react'
import type { TestDef } from '../types'
import { scoreTest, estimatePushKg, estimatePullKg } from '../benchmarks'
import type { WeightUnit } from '../units'
import { toKg, fromKg, loadUnitPref, saveUnitPref } from '../units'
import Stopwatch from './Stopwatch'
import ReactionTest from './ReactionTest'
import FingerTapTest from './FingerTapTest'

interface TestModalProps {
  def: TestDef
  bodyweightKg: number
  onClose: () => void
  onSubmit: (rawValue: number, score: number, derivedKg?: number) => void
}

export default function TestModal({ def, bodyweightKg, onClose, onSubmit }: TestModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [unit, setUnit] = useState<WeightUnit>(loadUnitPref)

  const isRepBased = def.inputType === 'reps_bw_push' || def.inputType === 'reps_bw_pull'
  const isDistance = def.inputType === 'distance_cm'
  const isLoad = def.inputType === 'load_kg'
  const isDuration = def.inputType === 'duration_s'
  const isCount = def.inputType === 'count'
  const isReactionGame = def.inputType === 'duration_ms'
  const isTapGame = def.inputType === 'tap_count'

  const commit = (rawKg: number) => {
    const { score, derivedKg } = scoreTest(def.id, rawKg, bodyweightKg)
    onSubmit(rawKg, score, derivedKg)
  }

  const handleUnitChange = (next: WeightUnit) => {
    if (isLoad && inputValue !== '' && !Number.isNaN(Number(inputValue))) {
      const kg = toKg(Number(inputValue), unit)
      setInputValue(fromKg(kg, next).toFixed(1))
    }
    setUnit(next)
    saveUnitPref(next)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const entered = Number(inputValue)
    if (Number.isNaN(entered) || entered < 0) return
    // Reps and distances are unit-agnostic (reps are reps, cm is cm);
    // only load_kg fields need lb->kg conversion before scoring.
    const raw = isLoad ? toKg(entered, unit) : entered
    commit(raw)
  }

  const repsPreview = () => {
    if (!isRepBased || inputValue === '') return null
    const reps = Number(inputValue)
    if (Number.isNaN(reps)) return null
    return def.inputType === 'reps_bw_push' ? estimatePushKg(bodyweightKg, reps) : estimatePullKg(bodyweightKg, reps)
  }

  const loadPreviewKg = () => {
    if (!isLoad || inputValue === '' || unit !== 'lb') return null
    const entered = Number(inputValue)
    if (Number.isNaN(entered)) return null
    return toKg(entered, 'lb')
  }

  const preview = repsPreview()
  const loadPreview = loadPreviewKg()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-eyebrow">
            {def.label} test {def.optional && <span className="modal-optional-tag">optional</span>}
          </span>
          <h2>{def.label}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="modal-hint">{def.hint}</p>

        {def.dataQuality === 'thin' && (
          <p className="modal-caveat">
            Heads up: this test's benchmarks are the least well-established in the battery — treat the score as a
            rough estimate.
          </p>
        )}

        {(isRepBased || isDistance || isLoad || isCount) && (
          <form className="modal-form" onSubmit={handleManualSubmit}>
            <label htmlFor="raw-value">
              Result <span className="modal-unit">({isLoad ? unit : def.unit})</span>
            </label>
            <div className={isLoad ? 'weight-input-row' : undefined}>
              <input
                id="raw-value"
                type="number"
                min={0}
                step={isLoad ? 0.5 : 1}
                inputMode="decimal"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
              />
              {isLoad && (
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
              )}
            </div>
            {preview !== null && (
              <p className="modal-derived">
                ≈ <strong>{preview.toFixed(1)} kg</strong> estimated absolute load
              </p>
            )}
            {loadPreview !== null && (
              <p className="modal-derived">
                = <strong>{loadPreview.toFixed(1)} kg</strong>
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={inputValue === ''}>
              Save Score
            </button>
          </form>
        )}

        {isDuration && <Stopwatch onCapture={commit} />}
        {isReactionGame && <ReactionTest onComplete={commit} />}
        {isTapGame && <FingerTapTest onComplete={commit} />}

        <p className="modal-source">Source: {def.source}</p>
      </div>
    </div>
  )
}
