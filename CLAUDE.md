# Vitae Ascend — project philosophy

Read this before adding or modifying any test, stat, or scoring logic. It
captures decisions made during design discussion that aren't obvious from
the code alone.

## The one non-negotiable rule

**A stat has to mean something because it came from a real measurement.**
This is the entire differentiator versus every other gamified habit app
(Habitica, Finch, etc.), which award XP for self-reported task completion
with no ground truth. If a proposed test degenerates into a glorified
survey, or into "pick the label that sounds most self-improving," it has
failed and needs a different design, not a ship-it-anyway.

Corollary: prefer an **in-app measured test** over a self-reported number
whenever the domain allows it (reaction time, tap count, N-Back accuracy,
Stroop, matrix reasoning, gambling-task choices, visual search timing are
all measured directly rather than typed in). Self-report is the fallback
for things that genuinely can't be measured in-browser (push-up count,
plank duration), not the default.

## Every test must resist gaming

Before a test is considered done, ask: **can this be beaten with a static
memorized strategy instead of the trait it claims to measure?** History in
this project:

- The Iowa Gambling Task originally had fixed deck identities and fixed
  loss positions — after two playthroughs it became "recall a fact," not
  judgment. Fix: randomize which decks are advantageous *and* the internal
  loss pattern independently, every attempt, while preserving the
  aggregate net payoff that makes the task meaningful.
- The original delay-discounting self-control test offered "larger reward
  later" with **zero real cost to waiting** — a rational chooser always
  picks "later," so it measured nothing. It was replaced with genuine
  inhibition/risk mechanics rather than patched.
- Insight/judgment scenarios must have **every answer option sound
  plausible**, including wrong ones built on stretched-but-tempting
  misreadings of a real detail (e.g., "the stall owner won't meet your eyes"
  should plausibly read as *grief*, not just "obviously the tell") — not
  one obviously-right answer surrounded by filler.
- A small scenario bank that gets reshuffled and reworded is a weaker fix
  than procedural generation (see Matrix Reasoning) — flag bank size as a
  known gap rather than pretending reshuffling solves memorization.

If a test comes back from playtesting as "I got a perfect score on the
first try" or "there's a dominant strategy," that's a design failure to
fix, not a balance nit.

## Scoring conventions

- Fixed 3–20 scale, no age/sex adjustment. 10 = average untrained adult,
  20 = elite / near practical human ceiling. This is intentional — the
  point is a believable, D&D-flavored character sheet, not clinical
  precision.
- Where a raw count/rep number would let a bigger or smaller body cheese
  the scale (push-ups, pull-ups), convert to an estimated absolute load in
  kg first, then score the load — not the raw rep count. Document the
  conversion formula and its source inline in `benchmarks.ts`.
- Every sub-test independently caps at 20; composites are an average of
  core (+ alternative/bonus) sub-tests, so the composite structurally can't
  exceed 20 either — don't special-case a max, let it fall out of the
  averaging.
- Mark thin/compiled-estimate anchor data explicitly (`dataQuality: 'thin'`)
  rather than presenting it with the same confidence as a sourced,
  peer-reviewed benchmark.

## Scope discipline

- This is a front-end-only MVP: no backend, `localStorage` persistence
  under `vitae-ascend:sheet`. Don't introduce a backend/auth/sync layer
  unless explicitly asked.
- Ship one pillar/stat at a time with real rigor rather than five pillars
  shallowly. STR was built first as the fully-worked example other stats
  should match in rigor before being marked `implemented: true`.
- The Training → Retest loop (structured practice that raises a stat,
  confirmed by retesting) is intentionally not built yet — Test → Score
  works first. Don't build training content until asked; when you do,
  keep retest-gating in mind so stats can't be grinded by spamming the
  cheapest qualifying action.
- No retest cooldown exists yet. Don't add one preemptively, but don't
  make a new test's design *depend* on unlimited spam-retesting being fine
  either.

## Known ongoing tensions — don't "solve" these unilaterally

- **Fun/RPG framing vs. genuine accountability.** The character sheet
  metaphor is meant to be the hook that makes real self-tracking
  approachable, not the point in itself. If a change makes the app feel
  more like a toy and less like an honest measurement, flag it rather than
  just shipping it.
- **Mental/spiritual stats are inherently harder to test objectively than
  physical ones.** WIS content in particular is original/adapted, not
  drawn from clinically normed instruments — say so in comments/UI
  (`dataQuality`) rather than implying more rigor than it has.
