import { useEffect, useState } from 'react'
import type { CharacterSheet, Profile, TestId } from './types'
import { emptySheet, STAT_ORDER, STAT_LABELS } from './types'
import { TEST_DEFS } from './benchmarks'
import StatCard from './components/StatCard'
import TestModal from './components/TestModal'
import ProfileSetup from './components/ProfileSetup'

const STORAGE_KEY = 'vitae-ascend:sheet'

function loadSheet(): CharacterSheet {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptySheet()
    const parsed = JSON.parse(raw) as CharacterSheet
    return { ...emptySheet(), ...parsed, tests: { ...emptySheet().tests, ...parsed.tests } }
  } catch {
    return emptySheet()
  }
}

export default function App() {
  const [sheet, setSheet] = useState<CharacterSheet>(loadSheet)
  const [activeTest, setActiveTest] = useState<TestId | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sheet))
  }, [sheet])

  const setProfile = (profile: Profile) => {
    setSheet((prev) => ({ ...prev, profile }))
  }

  const handleSubmit = (rawValue: number, score: number, derivedKg?: number) => {
    if (!activeTest) return
    setSheet((prev) => ({
      ...prev,
      tests: {
        ...prev.tests,
        [activeTest]: {
          history: [...prev.tests[activeTest].history, { rawValue, score, derivedKg, date: new Date().toISOString() }],
        },
      },
    }))
    setActiveTest(null)
  }

  if (!sheet.profile) {
    return (
      <div className="page page--narrow">
        <ProfileSetup onComplete={setProfile} />
      </div>
    )
  }

  const implementedStats = STAT_ORDER.filter((k) => STAT_LABELS[k].implemented)

  return (
    <div className="page">
      <header className="page-header">
        <span className="page-eyebrow">Character Sheet</span>
        <h1>Vitae Ascend</h1>
        <p className="page-subtitle">
          Bodyweight: {sheet.profile.bodyweightKg}kg · Testing {implementedStats.length} of {STAT_ORDER.length} stats
          so far
        </p>
      </header>

      <main className="stat-grid">
        {STAT_ORDER.map((key) => (
          <StatCard key={key} statKey={key} tests={sheet.tests} onTakeTest={(id) => setActiveTest(id)} />
        ))}
      </main>

      {activeTest && (
        <TestModal
          def={TEST_DEFS[activeTest]}
          bodyweightKg={sheet.profile.bodyweightKg}
          onClose={() => setActiveTest(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
