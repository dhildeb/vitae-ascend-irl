export type WeightUnit = 'kg' | 'lb'

const KG_PER_LB = 0.45359237

export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value * KG_PER_LB
}

export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kg / KG_PER_LB
}

const UNIT_STORAGE_KEY = 'vitae-ascend:unit-pref'

export function loadUnitPref(): WeightUnit {
  try {
    const raw = localStorage.getItem(UNIT_STORAGE_KEY)
    return raw === 'lb' ? 'lb' : 'kg'
  } catch {
    return 'kg'
  }
}

export function saveUnitPref(unit: WeightUnit) {
  try {
    localStorage.setItem(UNIT_STORAGE_KEY, unit)
  } catch {
    // ignore
  }
}
