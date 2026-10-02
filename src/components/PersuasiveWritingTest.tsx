import { useEffect, useRef, useState } from 'react'

import {
  PERSUASION_PROMPTS,
  type PersuasionPrompt,
} from '../data/persuasionPompts'

const DURATION_S = 240
const MIN_WORDS_TO_SUBMIT_EARLY = 40
const MIN_WORDS_TO_SCORE = 15

type Phase = 'idle' | 'writing' | 'done'

interface PersuasiveWritingTestProps {
  onComplete: (score: number) => void
}

/*
 * ─────────────────────────────────────────────
 * PERSUASION LANGUAGE
 * ─────────────────────────────────────────────
 *
 * These detect argument structures, not "good vocabulary."
 */

const POSITION_PATTERNS = [
  /\bwe should\b/i,
  /\bwe must\b/i,
  /\bwe need to\b/i,
  /\bwe ought to\b/i,
  /\bi (?:think|believe|argue|recommend|suggest)\b/i,
  /\bi would\b/i,
  /\bthe best (?:choice|option|course)\b/i,
  /\bthe right (?:choice|decision|thing)\b/i,
  /\bthe answer is\b/i,
  /\bmy recommendation\b/i,
  /\bmy position\b/i,
  /\bthe solution is\b/i,
  /\bshould be\b/i,
  /\bmust be\b/i,
]

const REASON_PATTERNS = [
  /\bbecause\b/i,
  /\bsince\b/i,
  /\bthe reason\b/i,
  /\bthis means\b/i,
  /\bthis would\b/i,
  /\bthis will\b/i,
  /\bwhich means\b/i,
  /\bwhich would\b/i,
  /\bthat means\b/i,
  /\bgiven that\b/i,
  /\bconsider that\b/i,
  /\bthe advantage\b/i,
  /\bthe benefit\b/i,
  /\bthe danger\b/i,
  /\bthe problem\b/i,
  /\bthe risk\b/i,
]

const EVIDENCE_PATTERNS = [
  /\bfor example\b/i,
  /\bfor instance\b/i,
  /\bsuch as\b/i,
  /\bconsider\b/i,
  /\bremember when\b/i,
  /\blast time\b/i,
  /\bwe saw\b/i,
  /\bwe've seen\b/i,
  /\bwe have seen\b/i,
  /\bin the past\b/i,
  /\bpreviously\b/i,
  /\bspecifically\b/i,
  /\bimagine\b/i,
]

const COUNTERARGUMENT_PATTERNS = [
  /\bsome (?:may|might|would) (?:argue|say|think|believe)\b/i,
  /\byou might (?:think|say|argue)\b/i,
  /\byou may (?:think|say|argue)\b/i,
  /\bsomeone might\b/i,
  /\bsome people (?:may|might)\b/i,
  /\bthe obvious (?:concern|objection)\b/i,
  /\bthe main (?:concern|objection)\b/i,
  /\bone objection\b/i,
  /\ba possible objection\b/i,
  /\bit may seem\b/i,
  /\bat first glance\b/i,
  /\bit is true that\b/i,
  /\bit's true that\b/i,
  /\balthough\b/i,
  /\beven if\b/i,
  /\beven though\b/i,
  /\bgranted\b/i,
  /\badmittedly\b/i,
]

const REBUTTAL_PATTERNS = [
  /\bhowever\b/i,
  /\bbut\b/i,
  /\bnevertheless\b/i,
  /\bnonetheless\b/i,
  /\bstill\b/i,
  /\beven so\b/i,
  /\bthat said\b/i,
  /\bdespite\b/i,
  /\beven then\b/i,
  /\bthe problem with that\b/i,
  /\bthe important point\b/i,
  /\bmore importantly\b/i,
  /\bultimately\b/i,
  /\bthe reality is\b/i,
  /\bin reality\b/i,
]

const CONSEQUENCE_PATTERNS = [
  /\bif\b/i,
  /\bunless\b/i,
  /\botherwise\b/i,
  /\bthen\b/i,
  /\bwill\b/i,
  /\bwould\b/i,
  /\bcould\b/i,
  /\bmay result\b/i,
  /\blead to\b/i,
  /\bresult in\b/i,
  /\bmeans that\b/i,
  /\bso that\b/i,
  /\bas a result\b/i,
  /\bwhich means\b/i,
  /\bthe consequence\b/i,
  /\bthe result\b/i,
  /\bthat would mean\b/i,
]

const CALL_TO_ACTION_PATTERNS = [
  /\bwe should\b/i,
  /\bwe must\b/i,
  /\bwe need to\b/i,
  /\bwe ought to\b/i,
  /\bi recommend\b/i,
  /\bi urge\b/i,
  /\bi ask you to\b/i,
  /\byou should\b/i,
  /\byou need to\b/i,
  /\blet us\b/i,
  /\blet's\b/i,
  /\bthe answer is\b/i,
  /\bthe best course\b/i,
  /\bthe right thing\b/i,
  /\btherefore\b/i,
  /\bin conclusion\b/i,
  /\bultimately\b/i,
]

const COHESION_PATTERNS = [
  /\bhowever\b/i,
  /\btherefore\b/i,
  /\bfurthermore\b/i,
  /\bmoreover\b/i,
  /\bin addition\b/i,
  /\bfor example\b/i,
  /\bin contrast\b/i,
  /\bon the other hand\b/i,
  /\bas a result\b/i,
  /\bconsequently\b/i,
  /\balthough\b/i,
  /\bmeanwhile\b/i,
  /\bsimilarly\b/i,
  /\bultimately\b/i,
]

function countPatternMatches(
  text: string,
  patterns: RegExp[],
): number {
  return patterns.filter((pattern) => pattern.test(text)).length
}

function wordsIn(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w'\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

/*
 * ─────────────────────────────────────────────
 * POSITION
 * ─────────────────────────────────────────────
 *
 * A persuasive response should establish what it wants
 * the audience to believe/do, preferably early, and reinforce
 * that position at the end.
 */

function calculatePositionScore(
  sentences: string[],
): number {
  if (sentences.length === 0) return 0

  const openingEnd = Math.max(
    1,
    Math.ceil(sentences.length * 0.3),
  )

  const closingStart = Math.floor(
    sentences.length * 0.7,
  )

  const opening = sentences
    .slice(0, openingEnd)
    .join(' ')

  const closing = sentences
    .slice(closingStart)
    .join(' ')

  const openingPosition = POSITION_PATTERNS.some(
    (pattern) => pattern.test(opening),
  )

  const closingPosition = POSITION_PATTERNS.some(
    (pattern) => pattern.test(closing),
  )

  if (openingPosition && closingPosition) return 100
  if (openingPosition || closingPosition) return 65

  return 0
}

/*
 * ─────────────────────────────────────────────
 * REASONS
 * ─────────────────────────────────────────────
 *
 * We score sentences containing reasoning structures,
 * with diminishing returns after three.
 */

function calculateReasonScore(
  sentences: string[],
): number {
  const reasonSentences = sentences.filter((sentence) =>
    REASON_PATTERNS.some((pattern) =>
      pattern.test(sentence),
    ),
  )

  const count = Math.min(3, reasonSentences.length)

  return [0, 40, 70, 100][count]
}

/*
 * ─────────────────────────────────────────────
 * EVIDENCE / EXAMPLES
 * ─────────────────────────────────────────────
 */

function calculateEvidenceScore(
  text: string,
  sentences: string[],
): number {
  const explicitEvidence = countPatternMatches(
    text,
    EVIDENCE_PATTERNS,
  )

  const concreteSentences = sentences.filter(
    (sentence) => {
      const hasExample =
        EVIDENCE_PATTERNS.some((pattern) =>
          pattern.test(sentence),
        )

      const hasSpecificDetail =
        /\b(last|yesterday|today|tomorrow|before|after|when|once|twice|first|second|third)\b/i.test(
          sentence,
        )

      const hasConditional =
        /\bif\b|\bunless\b|\bwould\b|\bcould\b|\bwill\b/i.test(
          sentence,
        )

      return (
        hasExample ||
        hasSpecificDetail ||
        hasConditional
      )
    },
  )

  let score = Math.min(
    50,
    explicitEvidence * 20,
  )

  if (concreteSentences.length >= 2) {
    score += 50
  } else if (concreteSentences.length === 1) {
    score += 25
  }

  return Math.min(100, score)
}

/*
 * ─────────────────────────────────────────────
 * COUNTERARGUMENT + REBUTTAL
 * ─────────────────────────────────────────────
 */

function calculateCounterargumentScore(
  sentences: string[],
): number {
  const counterIndices: number[] = []

  sentences.forEach((sentence, index) => {
    if (
      COUNTERARGUMENT_PATTERNS.some((pattern) =>
        pattern.test(sentence),
      )
    ) {
      counterIndices.push(index)
    }
  })

  if (counterIndices.length === 0) return 0

  /*
   * Acknowledging another side = partial credit.
   * Addressing it and then rebutting it = full credit.
   */
  for (const index of counterIndices) {
    const nearbyText = sentences
      .slice(index, Math.min(sentences.length, index + 3))
      .join(' ')

    if (
      REBUTTAL_PATTERNS.some((pattern) =>
        pattern.test(nearbyText),
      )
    ) {
      return 100
    }
  }

  return 40
}

/*
 * ─────────────────────────────────────────────
 * CONSEQUENCES
 * ─────────────────────────────────────────────
 */

function calculateConsequenceScore(
  sentences: string[],
): number {
  const consequenceSentences = sentences.filter(
    (sentence) =>
      CONSEQUENCE_PATTERNS.some((pattern) =>
        pattern.test(sentence),
      ),
  )

  const count = Math.min(
    3,
    consequenceSentences.length,
  )

  return [0, 40, 70, 100][count]
}

/*
 * ─────────────────────────────────────────────
 * AUDIENCE AWARENESS
 * ─────────────────────────────────────────────
 *
 * Each prompt supplies several audience concerns.
 *
 * Example:
 *
 * [
 *   ["justice", "fair", "law", "trial"],
 *   ["war", "army", "battle", "enemy"],
 *   ["information", "secret", "knowledge"]
 * ]
 *
 * Addressing one word from a concern group counts as
 * addressing that underlying concern.
 */

function calculateAudienceScore(
  text: string,
  prompt: PersuasionPrompt,
): number {
  const lower = text.toLowerCase()

  if (prompt.audience.concerns.length === 0) {
    return 0
  }

  const addressed = prompt.audience.concerns.filter(
    (concernGroup: string[]) =>
      concernGroup.some((keyword) => {
        const escaped = keyword.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&',
        )

        return new RegExp(
          `\\b${escaped}\\b`,
          'i',
        ).test(lower)
      }),
  ).length

  return Math.round(
    (addressed / prompt.audience.concerns.length) *
    100,
  )
}

/*
 * ─────────────────────────────────────────────
 * CALL TO ACTION
 * ─────────────────────────────────────────────
 */

function calculateCallToActionScore(
  text: string,
  sentences: string[],
): number {
  if (sentences.length === 0) return 0

  const finalSection = sentences
    .slice(Math.floor(sentences.length * 0.65))
    .join(' ')

  const finalCall = CALL_TO_ACTION_PATTERNS.some(
    (pattern) => pattern.test(finalSection),
  )

  if (finalCall) return 100

  if (
    POSITION_PATTERNS.some((pattern) =>
      pattern.test(text),
    )
  ) {
    return 40
  }

  return 0
}

/*
 * ─────────────────────────────────────────────
 * CLARITY
 * ─────────────────────────────────────────────
 *
 * Only 5% of the total.
 *
 * We want reasonably readable prose, but don't want
 * sentence length to dominate the CHA score.
 */

function calculateClarityScore(
  words: string[],
  sentences: string[],
): number {
  if (
    words.length === 0 ||
    sentences.length === 0
  ) {
    return 0
  }

  const avgSentenceLen =
    words.length / sentences.length

  let sentenceScore = 100

  if (avgSentenceLen < 7) {
    sentenceScore = 55
  } else if (avgSentenceLen < 10) {
    sentenceScore = 80
  } else if (avgSentenceLen <= 24) {
    sentenceScore = 100
  } else if (avgSentenceLen <= 32) {
    sentenceScore = 80
  } else {
    sentenceScore = 55
  }

  const cohesionCount = countPatternMatches(
    words.join(' '),
    COHESION_PATTERNS,
  )

  const cohesionScore = Math.min(
    100,
    cohesionCount * 25,
  )

  return (
    sentenceScore * 0.75 +
    cohesionScore * 0.25
  )
}

/*
 * ─────────────────────────────────────────────
 * PROMPT EXPECTATIONS
 * ─────────────────────────────────────────────
 *
 * These are small adjustments rather than another major
 * scoring system. The main score remains behavioral.
 */

function applyPromptExpectations(
  score: number,
  prompt: PersuasionPrompt,
  actualReasons: number,
  hasCounterargument: boolean,
  consequenceCount: number,
): number {
  let adjustment = 0

  if (
    actualReasons < prompt.expected.reasons
  ) {
    adjustment -= Math.min(
      10,
      (prompt.expected.reasons - actualReasons) *
      3,
    )
  }

  if (
    prompt.expected.counterargument &&
    !hasCounterargument
  ) {
    adjustment -= 5
  }

  if (
    consequenceCount <
    prompt.expected.consequences
  ) {
    adjustment -= Math.min(
      8,
      (prompt.expected.consequences -
        consequenceCount) *
      2,
    )
  }

  return Math.max(
    0,
    Math.min(100, score + adjustment),
  )
}

export default function PersuasiveWritingTest({
  onComplete,
}: PersuasiveWritingTestProps) {
  const [phase, setPhase] =
    useState<Phase>('idle')

  const [secondsLeft, setSecondsLeft] =
    useState(DURATION_S)

  const [text, setText] = useState('')

  const [prompt] = useState<PersuasionPrompt>(
    () =>
      PERSUASION_PROMPTS[
      Math.floor(
        Math.random() *
        PERSUASION_PROMPTS.length,
      )
      ],
  )

  const countdownRef =
    useRef<number | undefined>(undefined)

  const textRef = useRef('')

  useEffect(() => {
    textRef.current = text
  }, [text])

  useEffect(() => {
    return () => {
      window.clearInterval(
        countdownRef.current,
      )
    }
  }, [])

  const wordCount = text
    .trim()
    ? text
      .trim()
      .split(/\s+/)
      .filter(Boolean).length
    : 0

  const scoreAndFinish = () => {
    window.clearInterval(
      countdownRef.current,
    )

    setPhase('done')

    const finalText =
      textRef.current.trim()

    const words = wordsIn(finalText)
    const sentences =
      splitSentences(finalText)

    if (
      words.length < MIN_WORDS_TO_SCORE
    ) {
      onComplete(0)
      return
    }

    /*
     * ─────────────────────────────────────────
     * FINAL PERSUASION MODEL
     * ─────────────────────────────────────────
     *
     * Position              10%
     * Reasons               20%
     * Evidence              10%
     * Audience              20%
     * Counterargument       15%
     * Consequences          10%
     * Call to action        10%
     * Clarity                5%
     *
     * TOTAL                 100%
     */

    const positionScore =
      calculatePositionScore(sentences)

    const reasonScore =
      calculateReasonScore(sentences)

    const evidenceScore =
      calculateEvidenceScore(
        finalText,
        sentences,
      )

    const audienceScore =
      calculateAudienceScore(
        finalText,
        prompt,
      )

    const counterargumentScore =
      calculateCounterargumentScore(
        sentences,
      )

    const consequenceScore =
      calculateConsequenceScore(
        sentences,
      )

    const callToActionScore =
      calculateCallToActionScore(
        finalText,
        sentences,
      )

    const clarityScore =
      calculateClarityScore(
        words,
        sentences,
      )

    const actualReasons = Math.min(
      3,
      sentences.filter((sentence) =>
        REASON_PATTERNS.some((pattern) =>
          pattern.test(sentence),
        ),
      ).length,
    )

    const hasCounterargument =
      counterargumentScore > 0

    const consequenceCount = Math.min(
      3,
      sentences.filter((sentence) =>
        CONSEQUENCE_PATTERNS.some(
          (pattern) =>
            pattern.test(sentence),
        ),
      ).length,
    )

    let composite =
      positionScore * 0.10 +
      reasonScore * 0.20 +
      evidenceScore * 0.10 +
      audienceScore * 0.20 +
      counterargumentScore * 0.15 +
      consequenceScore * 0.10 +
      callToActionScore * 0.10 +
      clarityScore * 0.05

    composite =
      applyPromptExpectations(
        composite,
        prompt,
        actualReasons,
        hasCounterargument,
        consequenceCount,
      )

    /*
     * Word count is no longer a quality metric.
     *
     * It only limits the amount of evidence the test can reasonably
     * extract from extremely short answers.
     */
    let opportunityMultiplier = 1

    if (words.length < 30) {
      opportunityMultiplier = 0.65
    } else if (words.length < 45) {
      opportunityMultiplier = 0.80
    } else if (words.length < 60) {
      opportunityMultiplier = 0.90
    }

    composite *= opportunityMultiplier

    const finalScore = Math.round(
      Math.max(
        0,
        Math.min(100, composite),
      ),
    )

    onComplete(finalScore)
  }

  const start = () => {
    setText('')
    textRef.current = ''
    setSecondsLeft(DURATION_S)
    setPhase('writing')

    countdownRef.current =
      window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            window.clearInterval(
              countdownRef.current,
            )

            scoreAndFinish()

            return 0
          }

          return s - 1
        })
      }, 1000)
  }

  return (
    <div className="writing-test">
      {phase === 'idle' && (
        <>
          <p className="pitch-prompt-preview">
            Prompt: "{prompt.text}"
          </p>

          <p className="pitch-instructions">
            4 minutes to write a persuasive
            response. Your response is analyzed
            locally for argument structure,
            reasoning, audience awareness,
            counterarguments, consequences,
            and clarity. No AI is involved and
            nothing leaves your browser.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={start}
          >
            Start (4 min)
          </button>
        </>
      )}

      {phase === 'writing' && (
        <>
          <p className="pitch-prompt-active">
            "{prompt.text}"
          </p>

          <textarea
            className="writing-textarea"
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            placeholder="Write your response here..."
            autoFocus
          />

          <div className="writing-stats">
            <span>
              {secondsLeft}s left
            </span>

            <span>
              {wordCount} words
            </span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={scoreAndFinish}
            disabled={
              wordCount <
              MIN_WORDS_TO_SUBMIT_EARLY
            }
          >
            {wordCount <
              MIN_WORDS_TO_SUBMIT_EARLY
              ? `Write ${MIN_WORDS_TO_SUBMIT_EARLY -
              wordCount
              } more words to submit early`
              : 'Submit Now'}
          </button>
        </>
      )}

      {phase === 'done' && (
        <p className="pitch-instructions">
          Done — analysis complete.
        </p>
      )}
    </div>
  )
}