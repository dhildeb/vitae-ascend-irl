import { useEffect, useRef, useState } from 'react'

const DURATION_S = 240 // 4 minutes
const MIN_WORDS_TO_SUBMIT_EARLY = 40

const IDEAL_WORD_COUNT_FOR_FULL_CREDIT = 130
const IDEAL_SENTENCE_LEN = 16
const SENTENCE_LEN_SPREAD = 8

export const PERSUASION_PROMPTS = [
  // ─────────────────────────────────────────────
  // ADVENTURING PARTY
  // ─────────────────────────────────────────────

  "Your party has found a mysterious door covered in magical runes. Your companions want to open it immediately, but you believe it should remain sealed. Convince the party to follow your plan.",

  "Your party has been offered a large reward to escort a wealthy merchant through dangerous territory. You suspect the merchant is hiding something. Convince your companions either to accept the job despite your suspicions or refuse it.",

  "Your party has captured a goblin who claims to know where a legendary treasure is hidden. Some companions want to kill it, while others want to interrogate it. Convince the party what should be done.",

  "Your party is exhausted after a difficult battle, but you have discovered a trail that may lead directly to the villain you have been hunting. Convince your companions whether to pursue the trail immediately or rest first.",

  "Your party has only enough gold to purchase one magical item: a powerful weapon or an item that can heal the entire party. Convince your companions which one they should choose.",

  "Your party has discovered that one of your companions secretly took an item from a temple. The temple guards have not noticed. Convince the party what should happen next.",

  "Your party has been offered safe passage through a dangerous kingdom if you agree to surrender one of your magical weapons at the border. Convince your companions whether to accept the deal.",

  // ─────────────────────────────────────────────
  // TAVERN & EVERYDAY D&D
  // ─────────────────────────────────────────────

  "The local tavern has banned adventurers from entering after too many fights. Convince the tavern owner to make an exception for your party.",

  "A notoriously terrible bard has asked you to convince the town that they deserve to perform at the royal festival. Make the best case you can for giving them the opportunity.",

  "You have accidentally destroyed part of a farmer's fence while fighting a monster. You cannot afford to pay for the damage. Convince the farmer to forgive you.",

  "The town guard has accused your party of causing trouble in the market, but you believe the accusation is unfair. Convince the captain of the guard to release your party.",

  "A wealthy noble wants to hire your party, but the offered payment is insultingly low. Convince the noble to substantially increase the reward.",

  "The owner of a magical shop refuses to sell you an extremely powerful item because they believe adventurers cannot be trusted. Convince them to sell it to you.",

  "Your party has been banned from the best tavern in town because of something one member did. Convince the tavern owner to lift the ban.",

  // ─────────────────────────────────────────────
  // GUILDS & POLITICS
  // ─────────────────────────────────────────────

  "Two guilds are about to start a violent feud over control of a valuable mine. You have been asked to propose a compromise that both sides can accept. Convince them to agree to it.",

  "The town council wants to spend its limited treasury repairing the city walls. You believe the money should instead be spent feeding the poor. Convince the council to adopt your proposal.",

  "A kingdom is preparing to execute a captured enemy commander. You believe the prisoner should be spared and put on trial instead. Convince the king or queen to change their decision.",

  "A powerful guild has demanded that your adventuring party join them. Membership would bring wealth and protection, but you would lose some independence. Convince your party whether to join or remain independent.",

  "The mayor wants to ban magic within the city after a magical accident killed several people. Convince the mayor to reconsider the proposal.",

  "A city is divided over whether adventurers should be allowed to carry weapons inside the city walls. Convince the city council to adopt your preferred policy.",

  // ─────────────────────────────────────────────
  // MORAL DILEMMAS
  // ─────────────────────────────────────────────

  "You discover that a dragon has been protecting a village in exchange for receiving a small tribute each year. Some villagers want the dragon driven away because they believe no creature should demand tribute. Convince the villagers what they should do.",

  "Your party discovers a powerful magical artifact that could save thousands of lives, but using it would permanently destroy the memories of one innocent person. Convince your companions what should be done.",

  "A thief steals food because their family is starving. The law demands punishment, but you believe the circumstances matter. Convince the local judge what punishment, if any, is appropriate.",

  "Your party learns that a trusted ally has committed a serious crime to protect the kingdom. Revealing the truth could cause political chaos. Convince your companions whether the truth should be revealed.",

  "A powerful wizard offers to resurrect one dead member of your party, but only if you agree to perform a dangerous favor that could put an entire town at risk. Convince your companions whether to accept.",

  // ─────────────────────────────────────────────
  // NEGOTIATION
  // ─────────────────────────────────────────────

  "A dragon has blocked the only road through a mountain pass and demands a payment from every traveler. Your party cannot afford the demanded price. Convince the dragon to let you pass for less.",

  "A merchant has the final healing potion in town, but knows you desperately need it and demands an outrageous price. Convince the merchant to give you a fair deal.",

  "A captured enemy offers valuable information in exchange for their freedom. Your companions do not trust them. Convince the party to accept or reject the bargain.",

  "A powerful wizard agrees to help your party defeat a monster, but demands that you give them a rare magical artifact afterward. Convince the wizard to accept different terms.",

  "Your party needs a ship, but the captain refuses to take adventurers aboard. Convince the captain to give your party passage.",

  "A rival adventuring party claims they discovered a treasure first and demands that you leave. You believe you have an equal claim. Convince them to share the treasure.",

  // ─────────────────────────────────────────────
  // LEADERSHIP
  // ─────────────────────────────────────────────

  "Your party has just suffered a humiliating defeat. Everyone is discouraged and wants to abandon the quest. Give a speech convincing them to continue.",

  "Your adventuring party must choose between three dangerous routes to reach its destination. You have incomplete information about each route. Convince the party to trust your choice.",

  "You have been chosen to lead a group of inexperienced adventurers into a dangerous dungeon. Convince them that they should trust your leadership.",

  "Your town is about to be attacked by an army of monsters. The townspeople are terrified and preparing to flee. Give a speech convincing them to stay and defend their home.",

  "Your party is arguing and blaming one another after a mission goes badly. Give a speech that convinces them to stop fighting and work together.",

  // ─────────────────────────────────────────────
  // FUN / UNEXPECTED
  // ─────────────────────────────────────────────

  "A wizard has accidentally polymorphed your party's fighter into a chicken. The wizard claims the spell will wear off eventually, but your party wants immediate action. Convince everyone what should be done.",

  "Your party's bard insists that they should be allowed to name the group's new magical sword. Everyone else thinks this is a terrible idea. Convince the party why the bard should—or should not—be allowed to choose the name.",

  "A dragon claims that adventurers have unfairly ruined its reputation and demands that your party publicly apologize. Convince the dragon why it should—or should not—receive an apology.",

  "Your party discovers a mimic disguised as a treasure chest. Instead of attacking it, you believe it could become a valuable companion. Convince your companions to give the mimic a chance.",

  "Your party's wizard insists that wearing a ridiculous wizard hat makes them more powerful. Nobody believes them. Convince the party that the hat really is essential equipment.",

  "A goblin has challenged your party to a formal debate instead of a fight. The goblin gets to choose the topic. Convince the goblin that your side of the argument is correct.",

  // ─────────────────────────────────────────────
  // HIGHER DIFFICULTY / NUANCED
  // ─────────────────────────────────────────────

  "You know that a dangerous dungeon contains enormous treasure, but you also know that one member of your party is not prepared for the danger. Convince the party whether the expedition should continue.",

  "A noble offers your party an enormous reward to complete a quest, but refuses to explain why the task is necessary. You suspect there is more to the story. Convince your companions whether to accept the offer.",

  "Your party has two choices: save a small village from an immediate threat or pursue a villain who will escape if you delay. Convince your companions which responsibility should come first.",

  "A powerful magical weapon could make your party dramatically stronger, but using it slowly corrupts its wielder. Convince your companions whether the weapon should be used.",

  "You have evidence that your most trusted ally has betrayed the party, but the evidence is circumstantial. Convince your companions whether they should confront the ally or wait for more proof.",

  "A kingdom offers your party wealth and titles if you publicly support its ruler. You suspect the ruler is abusing their power, but refusing could put your party in danger. Convince your companions what they should do.",

  "Your party can complete its quest quickly by abandoning a group of strangers who are trapped nearby. Helping them will cost valuable time and may allow your enemy to escape. Convince your companions what they should do.",

  "You are given one opportunity to convince a powerful dragon, king, lich, or archmage to grant your party a single favor. Choose the favor and make the strongest possible case for why it should be granted.",
]

// Transition/cohesion markers — real signal from coherence research (higher
// quality essays use more cohesive ties). Counting DISTINCT types used
// rather than raw occurrences discourages spamming one word for free score.
const TRANSITION_MARKERS = [
  'however', 'therefore', 'furthermore', 'moreover', 'in addition',
  'for example', 'for instance', 'in contrast', 'on the other hand',
  'as a result', 'consequently', 'thus', 'because', 'since', 'although',
  'additionally', 'meanwhile', 'similarly', 'in fact', 'indeed',
  'ultimately', 'in conclusion', 'finally', 'specifically', 'notably',
]

// Claim/assertiveness markers — the literature specifically calls out
// "therefore/thus/consequently" and first-person claim framing as
// detectable proxies for argument-component presence (claims).
const CLAIM_MARKERS = [
  'i believe', 'i argue', 'in my view', 'clearly', 'obviously',
  'without question', 'the evidence shows', 'research shows',
  'it is clear that', 'undoubtedly', 'surely', 'the fact is',
  'make no mistake',
]

type Phase = 'idle' | 'writing' | 'done'

interface PersuasiveWritingTestProps {
  onComplete: (score: number) => void
}

function countDistinctMarkers(text: string, markers: string[]): number {
  const lower = text.toLowerCase()
  let distinct = 0
  for (const marker of markers) {
    const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`\\b${escaped}\\b`).test(lower)) distinct += 1
  }
  return distinct
}

export default function PersuasiveWritingTest({ onComplete }: PersuasiveWritingTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(DURATION_S)
  const [text, setText] = useState('')
  const [prompt] = useState(() => PERSUASION_PROMPTS[Math.floor(Math.random() * PERSUASION_PROMPTS.length)])

  const countdownRef = useRef<number | undefined>(undefined)
  const textRef = useRef('')

  useEffect(() => {
    textRef.current = text
  }, [text])

  useEffect(() => () => window.clearInterval(countdownRef.current), [])

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0

  const scoreAndFinish = () => {
    window.clearInterval(countdownRef.current)
    setPhase('done')

    const finalText = textRef.current.trim()
    const words = finalText
      .toLowerCase()
      .replace(/[^\w'\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)

    if (words.length < 15) {
      onComplete(0)
      return
    }

    const sentences = finalText.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)
    const sentenceCount = Math.max(1, sentences.length)
    const avgSentenceLen = words.length / sentenceCount

    // 1. Content volume — length alone predicted 30% of variance in quality
    // in the Crossley & Kim persuasive-essay corpus study.
    const contentVolumeScore = Math.min(100, (words.length / IDEAL_WORD_COUNT_FOR_FULL_CREDIT) * 100)

    // 2. Lexical sophistication — richer vocabulary was POSITIVELY
    // associated with quality in the same study.
    const avgWordLen = words.reduce((sum, w) => sum + w.length, 0) / words.length
    const sophisticatedRatio = words.filter((w) => w.length >= 7).length / words.length
    const avgWordLenScore = Math.max(0, Math.min(100, ((avgWordLen - 3.0) / 3.0) * 100))
    const sophisticationScore = Math.max(0, Math.min(100, sophisticatedRatio * 400))
    const lexicalScore = avgWordLenScore * 0.5 + sophisticationScore * 0.5

    // 3. Sentence-length simplicity — syntactic complexity was NEGATIVELY
    // associated with quality in the same study (shorter, clearer sentences
    // scored higher). Gaussian-shaped: reward a clear-but-not-choppy range.
    const sentenceClarityScore =
      100 * Math.exp(-((avgSentenceLen - IDEAL_SENTENCE_LEN) ** 2) / (2 * SENTENCE_LEN_SPREAD ** 2))

    // 4. Cohesion — transition/connector density predicts quality in the
    // coherence literature. Distinct types used, not raw count, to resist
    // trivial repetition-spam gaming.
    const distinctTransitions = countDistinctMarkers(finalText, TRANSITION_MARKERS)
    const cohesionScore = Math.min(100, distinctTransitions * 15)

    // 5. Claim/assertiveness markers — a shallow but literature-cited proxy
    // for argument-component (claim) presence.
    const distinctClaims = countDistinctMarkers(finalText, CLAIM_MARKERS)
    const claimScore = Math.min(100, distinctClaims * 20)

    const composite =
      contentVolumeScore * 0.25 +
      lexicalScore * 0.2 +
      sentenceClarityScore * 0.2 +
      cohesionScore * 0.2 +
      claimScore * 0.15

    onComplete(Math.round(Math.max(0, Math.min(100, composite))))
  }

  const start = () => {
    setText('')
    textRef.current = ''
    setSecondsLeft(DURATION_S)
    setPhase('writing')
    countdownRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(countdownRef.current)
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
          <p className="pitch-prompt-preview">Prompt: "{prompt}"</p>
          <p className="pitch-instructions">
            4 minutes to write a persuasive response. Scored locally on content volume, vocabulary, sentence
            clarity, and use of cohesive/argumentative language — no AI involved, nothing leaves your browser.
          </p>
          <button type="button" className="btn btn-primary" onClick={start}>
            Start (4 min)
          </button>
        </>
      )}
      {phase === 'writing' && (
        <>
          <p className="pitch-prompt-active">"{prompt}"</p>
          <textarea
            className="writing-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your response here..."
            autoFocus
          />
          <div className="writing-stats">
            <span>{secondsLeft}s left</span>
            <span>{wordCount} words</span>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={scoreAndFinish}
            disabled={wordCount < MIN_WORDS_TO_SUBMIT_EARLY}
          >
            {wordCount < MIN_WORDS_TO_SUBMIT_EARLY
              ? `Write ${MIN_WORDS_TO_SUBMIT_EARLY - wordCount} more words to submit early`
              : 'Submit Now'}
          </button>
        </>
      )}
      {phase === 'done' && <p className="pitch-instructions">Done — analysis complete.</p>}
    </div>
  )
}