# Vitae Ascend — IRL Character Sheet

A front-end-only app that turns you into a D&D-style character sheet. Your
stats — **STR, DEX, CON, INT, WIS** — aren't self-reported or XP-for-checking-
boxes; each one is derived from real tests (timed, counted, or measured
in-browser) mapped onto a fixed 3–20 scale, same feel as a 5e ability score.

## Run it

```bash
npm install
npm run dev
```

## Core idea

**A stat has to mean something because it came from a real measurement.**
That's the one rule everything else here serves. See [CLAUDE.md](CLAUDE.md)
for the full design philosophy — scoring rules, anti-gaming constraints, and
the standard this project holds every test to before it's allowed to exist.

**One fixed scale, no age or sex adjustment.** Score 10 = a genuinely average
untrained adult. Score 20 = elite / near the practical ceiling of drug-free
human performance, for physical stats, or nearing test ceiling, for
cognitive ones.

## The stats and their tests

| Stat | Domain | Core tests |
|---|---|---|
| **STR** | Absolute strength | Push-ups, Pull-ups *(reps converted to estimated kg — see below)*, Grip (dynamometer or dead-hang), Broad Jump / Vertical Jump; Bench/Deadlift 1RM as optional refinement |
| **DEX** | Speed, reflex, coordination | Reaction Time, Finger Tap, Balance, 20m Sprint; Shuttle Run / Line Hops as alternatives |
| **CON** | Endurance, stamina, resilience | Plank Hold, 60s Squats, Breath Hold, Heart-Rate Recovery; Run/Step test, Beep test/Burpees, Resting HR as alternatives; Farmer's Carry, illness frequency, cold tolerance as bonus |
| **INT** | Reasoning, memory, processing speed | Matrix Reasoning (procedural puzzles), N-Back (working memory), Symbol-Digit Substitution, Stroop |
| **WIS** | Judgment, perception, self-control | Visual Search, Reading the Room (D&D-scenario insight/deception judgment), Iowa Gambling Task (randomized per attempt), Self-Control / delay-discounting |

Push-ups and pull-ups are converted into an **estimated absolute load (kg)**,
not scored on reps directly — a push-up loads ~70% of bodyweight, a pull-up
~100%, and the Epley formula (`1RM = load × (1 + reps/30)`) extrapolates rep
count into estimated one-rep max. This is why a heavier, genuinely stronger
person out-scores a lighter person doing more reps, instead of the reverse.

Several tests (Reaction, Finger Tap, N-Back, Stroop, Matrix Reasoning, the
Gambling Task, Visual Search) run as in-app mini-games rather than
self-reported numbers — the app measures them directly. This is the
preferred pattern going forward: prefer an in-app measured test over a
self-reported one wherever the domain allows it.

The composite score for a stat is the average of its logged core tests
(alternatives are interchangeable slots, bonus tests refine but aren't
required). Each sub-test independently caps at 20, so the composite
structurally can't exceed it either.

## Files

- **`src/types.ts`** — data model: `StatKey`, `TestId`, `InputType` per
  test, `CharacterSheet` (profile + per-test history), persisted to
  `localStorage` under `vitae-ascend:sheet`.
- **`src/benchmarks.ts`** — every test's anchor table (raw value → 3–20
  score), the push/pull estimation formulas, and `STAT_TEST_GROUPS` (which
  tests are core/alternative/bonus per stat). This is the file to tune as
  you playtest.
- **`src/composite.ts`** — combines a stat's core + alternative + bonus test
  scores into the single displayed number.
- **`src/components/TestModal.tsx`** — routes to the right input/mini-game
  per test.
- **`src/components/StatCard.tsx`** — the stat block UI: composite score,
  modifier, and per-test status.
- **`src/components/*Test.tsx`** — one component per in-app mini-game
  (reaction time, N-Back, Stroop, matrix reasoning, gambling task, visual
  search, insight scenarios, self-control, etc).

## Known gaps / open playtest questions

- No Training → Retest loop yet — this covers Test → Score only. Raising a
  stat via structured practice, then re-testing to confirm real movement,
  is the next major piece.
- No cooldown on retesting yet (you can currently spam-retest core tests).
- The WIS Insight scenario bank and Perception Search are the newest/least
  playtested content — watch for repeat-scenario memorization and whether
  plausible-but-wrong answers are actually tempting rather than obviously
  wrong.
- Anchor tables for anything past core strength lifts are compiled
  estimates, not clinically normed instruments — expect to retune breakpoints
  as you playtest against real people.

## Sources (strength anchors)

- Push-up load %: Suprak, Dawes & Stephenson, *J Strength Cond Res* 2011
- Epley formula: standard 1RM estimation used throughout strength training
- Grip strength: Ranganathan et al. global systematic review; NIH Toolbox
  U.S. norms
- Bench/deadlift bodyweight-multiple standards: Strength Level, ExRx.net
- Broad jump / dead-hang benchmarks: thinnest data in the battery —
  compiled estimates, flagged as such in the UI (`dataQuality: 'thin'`)
