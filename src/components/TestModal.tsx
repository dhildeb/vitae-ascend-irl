import { useState } from 'react'
import type { TestDef } from '../types'
import { scoreTest, estimatePushKg, estimatePullKg } from '../benchmarks'
import type { WeightUnit } from '../units'
import { toKg, fromKg, loadUnitPref, saveUnitPref } from '../units'
import Stopwatch from './Stopwatch'
import ReactionTest from './ReactionTest'
import FingerTapTest from './FingerTapTest'
import MatrixReasoningTest from './MatrixReasoningTest'
import NBackTest from './NBackTest'
import SymbolDigitTest from './SymbolDigitTest'
import StroopTest from './StroopTest'
import PerceptionSearchTest from './PerceptionSearchTest'
import InsightScenarioTest from './InsightScenarioTest'
import JudgmentIGTTest from './JudgmentIGTTest'
import GoNoGoTest from './GoNoGoTest'
import SceneRecallTest from './SceneRecallTest'

interface TestModalProps {
  def: TestDef
  bodyweightKg: number
  onClose: () => void
  onSubmit: (rawValue: number, score: number, derivedKg?: number) => void
}

export default function TestModal({ def, bodyweightKg, onClose, onSubmit }: TestModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [recoveryValue, setRecoveryValue] = useState('')
  const [unit, setUnit] = useState<WeightUnit>(loadUnitPref)

  const isRepBased = def.inputType === 'reps_bw_push' || def.inputType === 'reps_bw_pull'
  const isDistance = def.inputType === 'distance_cm'
  const isLoad = def.inputType === 'load_kg'
  const isDuration = def.inputType === 'duration_s'
  const isCount = def.inputType === 'count'
  const isReactionGame = def.inputType === 'duration_ms'
  const isTapGame = def.inputType === 'tap_count'
  const isHrRecovery = def.inputType === 'hr_recovery'
  const isMatrixGame = def.inputType === 'matrix_count'
  const isNBackGame = def.inputType === 'nback_pct'
  const isSymbolDigitGame = def.inputType === 'symbol_digit_count'
  const isStroopGame = def.inputType === 'stroop_count'
  const isPerceptionGame = def.inputType === 'perception_ms'
  const isInsightGame = def.inputType === 'insight_count'
  const isJudgmentGame = def.inputType === 'igt_score'
  const isGoNoGoGame = def.inputType === 'gonogo_pct'
  const isSceneRecallGame = def.inputType === 'recall_count'

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

  const handleHrRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const peak = Number(inputValue)
    const recovery = Number(recoveryValue)
    if (Number.isNaN(peak) || Number.isNaN(recovery) || peak <= 0 || recovery <= 0) return
    commit(Math.max(0, peak - recovery))
  }

  const hrDropPreview = () => {
    if (!isHrRecovery || inputValue === '' || recoveryValue === '') return null
    const peak = Number(inputValue)
    const recovery = Number(recoveryValue)
    if (Number.isNaN(peak) || Number.isNaN(recovery)) return null
    return peak - recovery
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
  const hrDrop = hrDropPreview()

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

        {/* {def.dataQuality === 'thin' && (
          <p className="modal-caveat">
            Heads up: this test's benchmarks are the least well-established in the battery — treat the score as a
            rough estimate.
          </p>
        )} */}

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
                step={isLoad ? 0.5 : def.inputStep ?? 1}
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

        {isHrRecovery && (
          <form className="modal-form" onSubmit={handleHrRecoverySubmit}>
            <label htmlFor="hr-peak">
              Peak pulse, right after stopping <span className="modal-unit">(bpm)</span>
            </label>
            <input
              id="hr-peak"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 150"
            />
            <label htmlFor="hr-recovery">
              Pulse 60 seconds later <span className="modal-unit">(bpm)</span>
            </label>
            <input
              id="hr-recovery"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={recoveryValue}
              onChange={(e) => setRecoveryValue(e.target.value)}
              placeholder="e.g. 122"
            />
            {hrDrop !== null && (
              <p className="modal-derived">
                = <strong>{hrDrop} bpm</strong> drop
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={inputValue === '' || recoveryValue === ''}>
              Save Score
            </button>
          </form>
        )}

        {isDuration && <Stopwatch onCapture={commit} />}
        {isReactionGame && <ReactionTest onComplete={commit} />}
        {isTapGame && <FingerTapTest onComplete={commit} />}
        {isMatrixGame && <MatrixReasoningTest onComplete={commit} />}
        {isNBackGame && <NBackTest onComplete={commit} />}
        {isSymbolDigitGame && <SymbolDigitTest onComplete={commit} />}
        {isStroopGame && <StroopTest onComplete={commit} />}
        {isPerceptionGame && <PerceptionSearchTest onComplete={commit} />}
        {isInsightGame && <InsightScenarioTest onComplete={commit} />}
        {isJudgmentGame && <JudgmentIGTTest onComplete={commit} />}
        {isGoNoGoGame && <GoNoGoTest onComplete={commit} />}
        {isSceneRecallGame && <SceneRecallTest onComplete={commit} />}

        <p className="modal-source">Source: {def.source}</p>
      </div>
    </div>
  )
}
