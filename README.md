# Vitae Ascend — MVP (Strength v3: absolute strength model)

A character-sheet app for physical stats. Strength is now the fully worked
example of the design philosophy the rest of the stats will follow.

## Run it

```bash
npm install
npm run dev
```

## The core idea

**One fixed scale, no age or sex adjustment.** Score 10 = a genuinely
average untrained adult. Score 20 = elite / near the practical ceiling of
drug-free human performance. Once every sub-test reads 20, Strength is
maxed — further specialization should go into Dexterity or another stat.

**Push-ups and pull-ups are converted into an estimated absolute load
(kg), not scored on reps directly.** This is the fix for the "a small
person shouldn't out-score a bigger, stronger person just by doing more
reps" problem:

- A push-up loads ~69–75% of bodyweight through the rep (force-plate data,
  Suprak et al. 2011) — we use 70%.
- A pull-up loads ~100% of bodyweight (you lift your whole mass).
- The Epley formula (`1RM = load × (1 + reps/30)`), standard in strength
  training, extrapolates a rep count into an estimated one-rep max.

```
Estimated push strength (kg) = bodyweight × 0.70 × (1 + reps/30)
Estimated pull strength (kg) = bodyweight × (1 + reps/30)
```

A heavier, genuinely stronger person can now out-score a lighter person
doing more reps — verified in testing: a 110kg person doing 25 push-ups
(score 16) outscores a 75kg person doing 40 push-ups (score 14).

Broad jump, grip, bench, and deadlift are scored on their own raw units
directly — those tests don't have the "reps let you game the scale"
problem, so no conversion is applied there.

## The Strength battery

| Test | Required? | Input |
|---|---|---|
| Push-Ups | Core | reps (converted via formula above) |
| Pull-Ups | Core | reps (converted via formula above) |
| Standing Broad Jump | Core | distance in cm |
| Grip Strength | Core (pick one) | dynamometer kg **or** dead-hang seconds (in-app stopwatch) |
| Bench Press 1RM | Optional | kg — refines the score if you have a barbell |
| Deadlift 1RM | Optional | kg — refines the score if you have a barbell |

The composite Strength score is the average of every logged test's score
(min the 3 core tests + one grip method; bench/deadlift blend in if you
have them). Each sub-test independently caps at score 20 — since the
composite is an average, it structurally can't exceed 20 either. That's
the "max" you asked for, and it falls out of the design rather than being
a special case.

## Files

- **`src/types.ts`** — data model: `Profile` (just `bodyweightKg` now),
  `TestDef`, `StatTestGroup` (core / alternatives / bonus tests per stat).
- **`src/benchmarks.ts`** — all fixed anchor tables (raw value → score,
  3–20) and the push/pull estimation formulas. This is the file to tune as
  you playtest — see the big comment block at the top for the full
  scoring philosophy and sources.
- **`src/composite.ts`** — combines a stat's core + alternative + bonus
  test scores into the single displayed number.
- **`src/components/TestModal.tsx`** — renders the right input per test
  (number field with live kg preview for push/pull, plain number for
  distance/load, in-app stopwatch for dead hang).
- **`src/components/StatCard.tsx`** — shows the composite plus every
  sub-test's status; DEX and CON currently render as locked "coming soon"
  cards since they haven't been redesigned with this same rigor yet.
- Sheet persists to `localStorage` under `vitae-ascend:sheet`.

## Sources

- Push-up load %: Suprak, Dawes & Stephenson, *J Strength Cond Res* 2011
  (~69% up position, ~75% down position of bodyweight supported)
- Epley formula: standard 1RM estimation used throughout strength training
- Grip strength: Ranganathan et al. global systematic review (2.4M
  adults, 69 countries); NIH Toolbox U.S. norms
- Bench/deadlift bodyweight-multiple standards: Strength Level, ExRx.net,
  and other aggregated community strength-standard datasets
- Broad jump and dead-hang benchmarks: the thinnest data in the battery —
  compiled estimates, flagged as such in the UI (`dataQuality: 'thin'`)

## What to playtest first

1. Do the anchor values feel right against your own numbers, and against
   a few friends of different sizes? This is the most important thing to
   pressure-test — the whole point of the redesign was fairness across
   body sizes.
2. Is requiring all 3 core tests + a grip method before revealing a score
   too much friction, or does it feel appropriately like "you don't get a
   verdict until you've actually done the work"?
3. Does the optional bench/deadlift refinement meaningfully change the
   score for people who have that equipment, or is it redundant with the
   bodyweight tests?

## Known gaps

- DEX and CON are placeholder "coming soon" cards — not yet redesigned
  with the same absolute, multi-test approach.
- No Training → Retest loop yet.
- Broad jump doesn't get the same bodyweight-reward treatment as
  push/pull — it's scored on raw distance, since explosive power is a
  genuinely different quality (power-to-weight) than max strength, not an
  oversight. Worth revisiting if that feels wrong once you've tested it.
