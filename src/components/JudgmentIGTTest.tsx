import { useMemo, useRef, useState } from 'react'

const TRIAL_COUNT = 25
type Deck = 1 | 2 | 3 | 4
const DECKS: Deck[] = [1, 2, 3, 4]

// Classic Bechara et al. shape: disadvantageous decks pay a bigger reward per draw but lose
// more over a 10-draw cycle (net -25/10), advantageous decks pay less but lose less (net
// +25/10). Which decks are advantageous, and exactly which draws within the cycle carry the
// loss, are both re-randomized every attempt below — nothing about deck identity or timing is
// memorizable. See CLAUDE.md: "every test must resist gaming."
const DISADV_REWARD = 100
const ADV_REWARD = 50
const DISADV_LOSS_TOTAL = 1250 // over 10 draws: 100*10 - 1250 = net -250
const ADV_LOSS_TOTAL = 250 // over 10 draws: 50*10 - 250 = net +250

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Distributes `total` loss across a random subset of the 10 slots in a cycle, honoring the
 * aggregate net for the deck type while randomizing which specific draws hurt and by how much. */
function buildLossSchedule(total: number, hitCount: number): number[] {
  const schedule = new Array(10).fill(0)
  const hitSlots = shuffle(Array.from({ length: 10 }, (_, i) => i)).slice(0, hitCount)
  // random weights that sum to `total`, so amounts vary between attempts too
  const weights = hitSlots.map(() => 0.4 + Math.random())
  const weightSum = weights.reduce((a, b) => a + b, 0)
  let allocated = 0
  hitSlots.forEach((slot, i) => {
    const isLast = i === hitSlots.length - 1
    const amount = isLast ? total - allocated : Math.round((weights[i] / weightSum) * total)
    schedule[slot] = amount
    allocated += amount
  })
  return schedule
}

interface DeckConfig {
  advantageous: boolean
  reward: number
  lossSchedule: number[]
}

function buildDecks(): Record<Deck, DeckConfig> {
  const advDecks = new Set(shuffle(DECKS).slice(0, 2))
  const config = {} as Record<Deck, DeckConfig>
  DECKS.forEach((d) => {
    const advantageous = advDecks.has(d)
    config[d] = {
      advantageous,
      reward: advantageous ? ADV_REWARD : DISADV_REWARD,
      // advantageous: 5 small losses summing to 250 (net +50*10 - 250 = +250 over 10 draws)
      // disadvantageous: 1-3 big losses summing to 1250 (net +100*10 - 1250 = -250 over 10 draws)
      lossSchedule: advantageous
        ? buildLossSchedule(ADV_LOSS_TOTAL, 5)
        : buildLossSchedule(DISADV_LOSS_TOTAL, 1 + Math.floor(Math.random() * 3)),
    }
  })
  return config
}

interface JudgmentIGTTestProps {
  onComplete: (netAdvantage: number) => void
}

export default function JudgmentIGTTest({ onComplete }: JudgmentIGTTestProps) {
  const decks = useMemo(buildDecks, [])
  const [total, setTotal] = useState(0)
  const [drawCount, setDrawCount] = useState(0)
  const [lastOutcome, setLastOutcome] = useState<string | null>(null)
  const deckCounts = useRef<Record<Deck, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 })
  const advPicks = useRef(0)
  const disadvPicks = useRef(0)

  const draw = (deck: Deck) => {
    if (drawCount >= TRIAL_COUNT) return
    const cfg = decks[deck]
    const n = deckCounts.current[deck]
    const loss = cfg.lossSchedule[n % 10]
    deckCounts.current[deck] += 1
    if (cfg.advantageous) advPicks.current += 1
    else disadvPicks.current += 1

    const net = cfg.reward - loss
    setTotal((t) => t + net)
    setLastOutcome(loss > 0 ? `+${cfg.reward}, −${loss}` : `+${cfg.reward}`)

    const nextDrawCount = drawCount + 1
    setDrawCount(nextDrawCount)

    if (nextDrawCount >= TRIAL_COUNT) {
      onComplete(advPicks.current - disadvPicks.current)
    }
  }

  return (
    <div className="igt-test">
      <div className="igt-header">
        <span>
          Draw {drawCount} / {TRIAL_COUNT}
        </span>
        <span className="igt-total">Score: {total}</span>
      </div>
      <div className="igt-decks">
        {DECKS.map((d) => (
          <button key={d} className="igt-deck" onClick={() => draw(d)} disabled={drawCount >= TRIAL_COUNT}>
            Deck {d}
          </button>
        ))}
      </div>
      {lastOutcome && <p className="igt-outcome">{lastOutcome}</p>}
    </div>
  )
}
