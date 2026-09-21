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
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-[rgba(15,16,24,0.72)] p-6" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-[3px] border-t-[4px] border-[#a33b2e] bg-[#efe7d8] p-7 text-[#26221c]" onClick={(e) => e.stopPropagation()}>
        <div className="relative mb-1.5">
          <span className="font-mono text-[12px] font-bold tracking-[0.06em] text-[#a33b2e]">
            {def.label} test {def.optional && <span className="ml-1.5 rounded-full bg-[#9c7a3c] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.04em] text-[#efe7d8]">optional</span>}
          </span>
          <h2 className="mt-1 text-[26px] text-[#26221c]" style={{ fontFamily: '"Spectral", Georgia, serif', fontWeight: 500 }}>{def.label}</h2>
          <button className="absolute -right-1.5 -top-1.5 text-[26px] leading-none text-[#26221c]" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="mb-[22px] text-[14px] leading-6 text-[#574f40]">{def.hint}</p>

        {def.dataQuality === 'thin' && (
          <p className="mb-4 border-l-2 border-[#a33b2e] bg-[rgba(163,59,46,0.08)] px-2.5 py-2 text-[12.5px] leading-5 text-[#832d22]">
            Heads up: this test&apos;s benchmarks are the least well-established in the battery — treat the score as a
            rough estimate.
          </p>
        )}

        {(isRepBased || isDistance || isLoad || isCount) && (
          <form className="flex flex-col gap-2" onSubmit={handleManualSubmit}>
            <label htmlFor="raw-value" className="text-[13px] font-semibold text-[#26221c]">
              Result <span className="font-normal text-[#7a705d]">({isLoad ? unit : def.unit})</span>
            </label>
            <div className={isLoad ? 'flex items-stretch gap-2' : ''}>
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
                className="w-full rounded-[3px] border border-[#cdbd98] bg-[#fbf8f1] px-[12px] py-[10px] font-mono text-[20px] text-[#26221c] focus:outline-none focus:ring-2 focus:ring-[#a33b2e] focus:ring-offset-2"
              />
              {isLoad && (
                <div className="flex shrink-0 overflow-hidden rounded-[3px] border border-[#cdbd98]">
                  <button
                    type="button"
                    className={`px-[14px] py-[10px] font-mono text-[13px] font-bold ${
                      unit === 'kg' ? 'bg-[#a33b2e] text-[#efe7d8]' : 'bg-[#fbf8f1] text-[#8a7f68]'
                    }`}
                    onClick={() => handleUnitChange('kg')}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    className={`px-[14px] py-[10px] font-mono text-[13px] font-bold ${
                      unit === 'lb' ? 'bg-[#a33b2e] text-[#efe7d8]' : 'bg-[#fbf8f1] text-[#8a7f68]'
                    }`}
                    onClick={() => handleUnitChange('lb')}
                  >
                    lb
                  </button>
                </div>
              )}
            </div>
            {preview !== null && (
              <p className="-mt-1 mb-3 font-mono text-[13px] text-[#6b6153]">
                ≈ <strong className="text-[#26221c]">{preview.toFixed(1)} kg</strong> estimated absolute load
              </p>
            )}
            {loadPreview !== null && (
              <p className="-mt-1 mb-3 font-mono text-[13px] text-[#6b6153]">
                = <strong className="text-[#26221c]">{loadPreview.toFixed(1)} kg</strong>
              </p>
            )}
            <button
              type="submit"
              className="mt-1 rounded-[3px] bg-[#a33b2e] px-[18px] py-[11px] text-sm font-semibold text-[#efe7d8] transition-colors hover:bg-[#832d22] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={inputValue === ''}
            >
              Save Score
            </button>
          </form>
        )}

        {isHrRecovery && (
          <form className="flex flex-col gap-2" onSubmit={handleHrRecoverySubmit}>
            <label htmlFor="hr-peak" className="text-[13px] font-semibold text-[#26221c]">
              Peak pulse, right after stopping <span className="font-normal text-[#7a705d]">(bpm)</span>
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
              className="w-full rounded-[3px] border border-[#cdbd98] bg-[#fbf8f1] px-[12px] py-[10px] font-mono text-[20px] text-[#26221c] focus:outline-none focus:ring-2 focus:ring-[#a33b2e] focus:ring-offset-2"
            />
            <label htmlFor="hr-recovery" className="text-[13px] font-semibold text-[#26221c]">
              Pulse 60 seconds later <span className="font-normal text-[#7a705d]">(bpm)</span>
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
              className="w-full rounded-[3px] border border-[#cdbd98] bg-[#fbf8f1] px-[12px] py-[10px] font-mono text-[20px] text-[#26221c] focus:outline-none focus:ring-2 focus:ring-[#a33b2e] focus:ring-offset-2"
            />
            {hrDrop !== null && (
              <p className="-mt-1 mb-3 font-mono text-[13px] text-[#6b6153]">
                = <strong className="text-[#26221c]">{hrDrop} bpm</strong> drop
              </p>
            )}
            <button
              type="submit"
              className="mt-1 rounded-[3px] bg-[#a33b2e] px-[18px] py-[11px] text-sm font-semibold text-[#efe7d8] transition-colors hover:bg-[#832d22] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={inputValue === '' || recoveryValue === ''}
            >
              Save Score
            </button>
          </form>
        )}

        {isDuration && <Stopwatch onCapture={commit} />}
        {isReactionGame && <ReactionTest onComplete={commit} />}
        {isTapGame && <FingerTapTest onComplete={commit} />}

        <p className="mt-5 text-[11px] text-[#948965]">Source: {def.source}</p>
      </div>
    </div>
  )
}
