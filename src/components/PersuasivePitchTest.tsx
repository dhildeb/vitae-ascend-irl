import { useEffect, useRef, useState } from 'react'

const DURATION_S = 30
const SAMPLE_INTERVAL_MS = 100
const FINALIZE_GRACE_MS = 250
const FINALIZATION_TIMEOUT_MS = 2500
const RECOGNITION_RESTART_DELAY_MS = 150

const PROMPTS = [
  // Persuasion
  'Sell me a rusty sword as though it were a legendary weapon.',
  'Convince a skeptical shopkeeper to give you a discount.',
  'Persuade the tavern keeper to let your party stay the night for free.',
  'Convince a noble that your completely ridiculous plan is actually brilliant.',
  'Talk a guard into letting you through a gate without the proper papers.',
  'Convince an adventurer to join your party.',
  'Sell a completely ordinary rock as a rare magical artifact.',
  'Convince the party that your obviously dangerous plan is worth attempting.',
  'Persuade a dragon that you are not worth eating.',
  'Convince a wizard to give you one of their spellbooks.',

  // Deception / Bluffing
  'You accidentally broke the king’s favorite vase. Convince him you did not.',
  'You are caught sneaking into a restricted library. Explain why you belong there.',
  'Pretend you are a powerful wizard who has never actually cast a spell.',
  'You have been mistaken for a famous hero. Play along.',
  'Convince a suspicious guard that your party is part of an official royal inspection.',
  'Explain why you are carrying six identical swords.',
  'You are accused of stealing a magical artifact. Give your defense.',
  'Convince a tavern full of adventurers that you have personally defeated a dragon.',
  'You have no idea what a mysterious magical object does. Convince everyone that you do.',
  'Explain why you were found inside the villain’s castle.',

  // Negotiation
  'A goblin has your favorite weapon and wants something ridiculous in exchange. Negotiate.',
  'A dragon demands a tribute from your village. Convince it to accept something else.',
  'Two members of your party want completely different plans. Convince them to accept yours.',
  'A merchant refuses to sell you an essential item. Make the deal happen.',
  'A powerful wizard offers to help you, but demands an unreasonable price. Negotiate.',
  'You need passage across a dangerous river, but the ferryman wants too much gold.',
  'A rival adventuring party claims your treasure belongs to them. Settle the dispute.',
  'Convince a king to pardon your companion for a crime they absolutely committed.',
  'A dragon and a giant are arguing over territory. Convince them to compromise.',
  'You have one minute to convince an angry monster that everyone can leave peacefully.',

  // Leadership
  'Your party has just realized it is completely lost. Take command.',
  'Your party has 30 seconds to escape a collapsing dungeon. Give everyone instructions.',
  'The party has failed its mission. Give them a speech before the next attempt.',
  'Your party is terrified of the monster ahead. Rally them.',
  'Three adventurers are arguing about who is in charge. Establish leadership.',
  'You have just become the temporary ruler of a tiny kingdom. Address your subjects.',
  'Your party is exhausted, hungry, and ready to quit. Convince them to continue.',
  'You must convince a group of villagers to evacuate before danger arrives.',
  'Your army is badly outnumbered. Give your troops a battle speech.',
  'You accidentally became guild leader. Give your first official announcement.',

  // Improvisation
  'A wizard turns you into a chicken. Explain the situation to the party.',
  'You wake up in a dungeon with no memory of how you got there. Explain what happened.',
  'A talking sword claims you are its destined hero. Respond.',
  'You open a treasure chest and discover something completely unexpected. Describe it.',
  'A ghost appears and asks why it should haunt someone else instead of you.',
  'You accidentally summon a demon during a cooking lesson. Talk your way out of it.',
  'You discover that your horse can talk. Have your first conversation.',
  'A mysterious stranger offers you three wishes, but seems suspicious. Respond.',
  'You are suddenly informed that you are the heir to a kingdom you have never heard of.',
  'You discover that the villain is actually your childhood friend. Address them.',

  // Humor / performance
  'Give a heroic speech about why your party desperately needs more snacks.',
  'Explain why your party’s bard is absolutely not responsible for the tavern fire.',
  'Give a dramatic sales pitch for the worst sword ever made.',
  'Convince everyone that fighting a dragon with a spoon is a reasonable strategy.',
  'Give a tavern announcement for the strangest festival imaginable.',
  'Explain why your party should absolutely adopt the terrifying monster you just fought.',
  'Give a royal speech announcing the most useless new law imaginable.',
  'Convince a group of adventurers that your pet rat is actually a legendary hero.',
  'Give a dramatic eulogy for a completely ordinary potato.',
  'Describe your breakfast as though it were an epic quest.',

  // Character / social presence
  'Introduce yourself to a room full of powerful adventurers.',
  'You meet the king for the first time. Make a strong first impression.',
  'You are invited to a noble’s banquet. Introduce yourself to the guests.',
  'A famous hero asks why they should remember you. Answer.',
  'You meet your greatest rival for the first time. Introduce yourself.',
  'A mysterious stranger asks, “Why should I trust you?”',
  'You are challenged to prove that you belong among the heroes.',
  'A frightened villager asks whether you are really strong enough to protect them.',
  'You encounter someone who clearly dislikes you. Win them over.',
  'Someone insults your adventuring abilities in front of everyone. Respond.',

  // Moral / difficult persuasion
  'A prisoner claims they are innocent. Convince the guards to release them.',
  'Your party wants to kill an enemy who has surrendered. Argue your position.',
  'A desperate villager asks you to steal medicine from a wealthy noble. Respond.',
  'A powerful artifact could save the kingdom but would endanger your party. Convince the others what to do.',
  'Your party must choose between saving one person or protecting an entire village. Make your case.',
  'A monster begs you not to kill it and claims it has changed. Respond.',
  'A noble offers you a fortune to betray your party. Address the offer.',
  'Your companion made a terrible mistake that could doom everyone. Convince the group how to proceed.',
  'A king demands that you punish someone you believe is innocent. Make your case.',
  'You must convince an enemy to work with you against a greater threat.',

  // Pure spontaneous prompts
  'You have 30 seconds to convince me that you are the greatest adventurer alive.',
  'Give a speech that would convince a dragon to become your ally.',
  'Make an ordinary object sound like the most valuable treasure in the world.',
  'Convince me to follow you into a dungeon without telling me what is inside.',
  'Explain why your worst character flaw is actually your greatest strength.',
  'Convince me that your party deserves to become famous.',
  'Give a speech defending the honor of a goblin accused of stealing a chicken.',
  'Convince a suspicious wizard that you are completely trustworthy.',
  'Give me one reason I should let you control the kingdom for a day.',
  'You have ten seconds to make me want to join your adventuring party.',
]

type Phase =
  | 'idle'
  | 'requesting'
  | 'running'
  | 'denied'
  | 'done'

interface PersuasivePitchTestProps {
  onComplete: (score: number) => void
}

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0?: {
    transcript?: string
  }
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: {
    length: number
    [index: number]: SpeechRecognitionResultLike
  }
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error?: string }) => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

interface FinalResult {
  sessionId: number
  resultIndex: number
  text: string
}

export default function PersuasivePitchTest({
  onComplete,
}: PersuasivePitchTestProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState(DURATION_S)
  const [prompt] = useState(
    () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
  )

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const sampleIntervalRef = useRef<number | undefined>(undefined)
  const countdownRef = useRef<number | undefined>(undefined)
  const recognitionRestartRef = useRef<number | undefined>(undefined)
  const finalizeGraceRef = useRef<number | undefined>(undefined)
  const finalizationTimeoutRef = useRef<number | undefined>(undefined)

  const volumesRef = useRef<number[]>([])
  const recordingChunksRef = useRef<Blob[]>([])

  const recognitionSessionRef = useRef(0)
  const recognitionEndedRef = useRef(true)
  const recordingStoppedRef = useRef(true)
  const finishRequestedRef = useRef(false)
  const finalizationStartedRef = useRef(false)

  const recognitionFatalErrorRef = useRef(false)
  const recognitionRestartAttemptsRef = useRef(0)

  const interimTranscriptRef = useRef('')
  const finalResultsRef = useRef<Map<string, FinalResult>>(new Map())

  /*
   * SpeechRecognition result indices are only meaningful inside one
   * recognition session. A browser can end/restart recognition and reuse
   * resultIndex values, so the key must include our own session ID.
   *
   * This prevents:
   *   session 1 / result 0
   * and
   *   session 2 / result 0
   *
   * from being mistaken for the same result.
   */
  const rebuildFinalTranscript = () => {
    const ordered = Array.from(finalResultsRef.current.values()).sort(
      (a, b) =>
        a.sessionId - b.sessionId || a.resultIndex - b.resultIndex,
    )

    return ordered
      .map((result) => result.text.trim())
      .filter(Boolean)
      .join(' ')
      .trim()
  }

  const cleanup = () => {
    window.clearInterval(sampleIntervalRef.current)
    window.clearInterval(countdownRef.current)
    window.clearTimeout(recognitionRestartRef.current)
    window.clearTimeout(finalizeGraceRef.current)
    window.clearTimeout(finalizationTimeoutRef.current)

    try {
      recognitionRef.current?.abort()
    } catch {
      // Ignore cleanup errors.
    }

    recognitionRef.current = null

    recorderRef.current?.stream
      .getTracks()
      .forEach((track) => track.stop())

    streamRef.current?.getTracks().forEach((track) => track.stop())

    audioCtxRef.current?.close().catch(() => { })

    streamRef.current = null
    recorderRef.current = null
    analyserRef.current = null
    audioCtxRef.current = null
  }

  useEffect(
    () => () => {
      cleanup()
    },
    [],
  )

  const calculateVocalRawScore = (volumes: number[]) => {
    if (volumes.length < 5) return 0

    /*
     * The raw vocal score intentionally uses the coefficient of variation
     * only as one component. CV by itself is a poor proxy for expressiveness:
     * silence and microphone noise can create huge ratios.
     *
     * The richer scoring below rewards:
     * - actually speaking for a useful portion of the test
     * - healthy volume variation
     * - controlled dynamics
     * - avoiding a completely flat delivery
     */

    const sorted = [...volumes].sort((a, b) => a - b)
    const percentile = (p: number) =>
      sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]

    const noiseFloor = percentile(0.1)
    const speechThreshold = Math.max(0.005, noiseFloor * 4)

    const speechSamples = volumes.filter((v) => v >= speechThreshold)
    const speechRatio = speechSamples.length / volumes.length

    if (speechSamples.length < 5) return 0

    const mean =
      speechSamples.reduce((sum, value) => sum + value, 0) /
      speechSamples.length

    const variance =
      speechSamples.reduce(
        (sum, value) => sum + (value - mean) ** 2,
        0,
      ) / speechSamples.length

    const stdDev = Math.sqrt(variance)
    const cv = mean > 0 ? stdDev / mean : 0

    /*
     * Moderate variation is desirable.
     * Extremely flat delivery and extreme variation both score lower.
     */
    const idealCv = 0.65
    const cvSpread = 0.45

    const variationScore =
      100 *
      Math.exp(
        -Math.pow(cv - idealCv, 2) /
        (2 * Math.pow(cvSpread, 2)),
      )

    /*
     * Speaking activity should be adequate, not maximized.
     *
     * Around 65–75% speech activity is treated as ordinary/healthy.
     * Constant talking is not automatically better.
     */
    const idealSpeechRatio = 0.70
    const speechRatioSpread = 0.25

    const activityScore =
      100 *
      Math.exp(
        -Math.pow(speechRatio - idealSpeechRatio, 2) /
        (2 * Math.pow(speechRatioSpread, 2)),
      )

    return variationScore * 0.55 + activityScore * 0.45
  }

  const getCompleteTranscript = () => {
    const finalTranscript = rebuildFinalTranscript()
    const interimTranscript = interimTranscriptRef.current.trim()

    if (!finalTranscript) return interimTranscript
    if (!interimTranscript) return finalTranscript

    const finalLower = finalTranscript.toLowerCase()
    const interimLower = interimTranscript.toLowerCase()

    /*
     * Interim recognition is only a fallback. Normally the final recognition
     * result arrives before finalization. Don't append it if it is already
     * represented in the finalized transcript.
     */
    if (
      finalLower.endsWith(interimLower) ||
      finalLower.includes(interimLower)
    ) {
      return finalTranscript
    }

    return `${finalTranscript} ${interimTranscript}`.trim()
  }

  const maybeFinalize = () => {
    if (!finishRequestedRef.current) return
    if (finalizationStartedRef.current) return

    const recognitionReady = recognitionEndedRef.current
    const recordingReady = recordingStoppedRef.current

    if (!recognitionReady || !recordingReady) return

    window.clearTimeout(finalizeGraceRef.current)

    /*
     * Give a final recognition event a brief chance to land after both
     * resources report completion. This is especially useful in Chrome,
     * where the final SpeechRecognition result can arrive immediately before
     * onend.
     */
    finalizeGraceRef.current = window.setTimeout(() => {
      if (finalizationStartedRef.current) return

      finalizationStartedRef.current = true

      const transcript = getCompleteTranscript()
      const volumes = volumesRef.current

      const wordCount = transcript
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean).length

      const wordsPerMinute =
        DURATION_S > 0 ? (wordCount / DURATION_S) * 60 : 0

      const recordingBlob =
        recordingChunksRef.current.length > 0
          ? new Blob(recordingChunksRef.current, {
            type:
              recorderRef.current?.mimeType ||
              'audio/webm;codecs=opus',
          })
          : null

      console.log('Recording blob:', recordingBlob)

      if (recordingBlob) {
        console.log('Recording size:', recordingBlob.size, 'bytes')
      }

      const rawVocalScore = calculateVocalRawScore(volumes)

      /*
       * Transcript-derived information is deliberately conservative.
       *
       * SpeechRecognition is useful for approximate speech rate and
       * repeated-word detection, but recognition errors should not create
       * large penalties.
       */

      function calculatePacingScore(wordsPerMinute: number): number {
        const idealWpm = 140
        const standardDeviation = 45

        const score =
          100 *
          Math.exp(
            -Math.pow(wordsPerMinute - idealWpm, 2) /
            (2 * Math.pow(standardDeviation, 2)),
          )

        return Math.max(0, Math.min(100, score))
      }

      const pacingScore = calculatePacingScore(wordsPerMinute)

      /*
       * Approximate repeated-word detection.
       * This is intentionally mild because browser recognition can
       * introduce artificial repetitions.
       */
      const words = transcript
        .toLowerCase()
        .replace(/[^\w\s']/g, ' ')
        .split(/\s+/)
        .filter(Boolean)

      let repeatedWordEvents = 0

      for (let i = 1; i < words.length; i++) {
        if (
          words[i] === words[i - 1] &&
          words[i].length >= 2
        ) {
          repeatedWordEvents++
        }
      }

      const repetitionRate =
        words.length > 0
          ? repeatedWordEvents / words.length
          : 0

      const repetitionScore = Math.max(
        0,
        Math.min(100, 100 - repetitionRate * 500),
      )

      /*
       * Speech-recognition reliability.
       *
       * This prevents a short/poor recognition result from dominating
       * the score, while allowing a sufficiently long transcript to
       * contribute normally.
       */
      const transcriptReliability =
        wordCount >= 35
          ? 1
          : wordCount >= 20
            ? 0.75
            : wordCount >= 10
              ? 0.5
              : 0.25

      /*
       * Fluency is primarily pacing, with repetition as a smaller
       * supporting signal.
       */
      const fluencyScore =
        pacingScore * 0.65 +
        repetitionScore * 0.35

      /*
       * Vocal delivery is the primary measurement.
       *
       * rawVocalScore already incorporates:
       * - speaking activity
       * - volume variation
       * - controlled vocal dynamics
       *
       * Speech-derived fluency is used only as a secondary refinement.
       */
      const vocalScore =
        rawVocalScore * 0.70 +
        fluencyScore * 0.30 * transcriptReliability

      /*
       * IMPORTANT:
       *
       * PersuasivePitchTest must return a RAW 0–100 score.
       * TestModal -> scoreTest() is responsible for converting that
       * raw score into the final 3–20 stat.
       */
      const finalScore = Math.max(
        0,
        Math.min(100, Math.round(vocalScore)),
      )

      const clampedFinalScore = finalScore


      // const result = {
      //   noiseFloor:
      //     volumes.length > 0
      //       ? [...volumes].sort((a, b) => a - b)[
      //       Math.floor(volumes.length * 0.1)
      //       ]
      //       : 0,
      //   speechThreshold: 0.005,
      //   speechRatio:
      //     volumes.length > 0
      //       ? volumes.filter((v) => v >= 0.005).length /
      //       volumes.length
      //       : 0,
      //   cv:
      //     (() => {
      //       const speechVolumes = volumes.filter((v) => v >= 0.005)
      //       if (speechVolumes.length < 2) return 0
      //       const mean =
      //         speechVolumes.reduce((a, b) => a + b, 0) /
      //         speechVolumes.length
      //       const variance =
      //         speechVolumes.reduce(
      //           (a, b) => a + (b - mean) ** 2,
      //           0,
      //         ) / speechVolumes.length
      //       return mean > 0 ? Math.sqrt(variance) / mean : 0
      //     })(),
      //   rawVocalScore,
      //   pacingScore,
      //   repetitionScore,
      //   fluencyScore,
      //   vocalScore,
      //   wordCount,
      //   wordsPerMinute,
      //   repeatedWordEvents,
      //   repetitionRate,
      //   finalTranscript: rebuildFinalTranscript(),
      //   interimTranscript: interimTranscriptRef.current,
      //   transcript,
      //   finalScore,
      //   clampedFinalScore,
      //   recordingSize: recordingBlob?.size ?? 0,
      //   recognitionSessions: recognitionSessionRef.current,
      //   recognitionEnded: recognitionEndedRef.current,
      //   recordingStopped: recordingStoppedRef.current,
      // }

      // console.log(result)

      cleanup()
      setPhase('done')
      onComplete(clampedFinalScore)
    }, FINALIZE_GRACE_MS)
  }

  const requestFinish = () => {
    if (finishRequestedRef.current) return

    finishRequestedRef.current = true

    window.clearInterval(countdownRef.current)
    window.clearTimeout(recognitionRestartRef.current)

    /*
     * Stop recognition first. We intentionally wait for its `onend` event
     * instead of assuming stop() means the final result has already arrived.
     */
    if (recognitionRef.current) {
      recognitionEndedRef.current = false

      try {
        recognitionRef.current.stop()
      } catch {
        recognitionEndedRef.current = true
      }
    } else {
      recognitionEndedRef.current = true
    }

    /*
     * Likewise, wait for MediaRecorder.onstop so the complete Blob has been
     * assembled before scoring/finalization.
     */
    if (recorderRef.current?.state === 'recording') {
      recordingStoppedRef.current = false

      try {
        recorderRef.current.stop()
      } catch {
        recordingStoppedRef.current = true
      }
    } else {
      recordingStoppedRef.current = true
    }

    maybeFinalize()

    /*
     * Never leave the UI hanging forever if a browser fails to fire one of
     * the expected completion events.
     */
    finalizationTimeoutRef.current = window.setTimeout(() => {
      if (finalizationStartedRef.current) return

      console.warn(
        'Finalization timeout reached; using available recognition and recording data.',
      )

      recognitionEndedRef.current = true
      recordingStoppedRef.current = true
      maybeFinalize()
    }, FINALIZATION_TIMEOUT_MS)
  }

  const startRecognition = () => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      console.warn(
        'Speech recognition is unavailable in this browser. Vocal-only scoring will be used.',
      )
      recognitionEndedRef.current = true
      return
    }

    const recognition = new SpeechRecognitionCtor()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognitionRef.current = recognition
    recognitionFatalErrorRef.current = false
    recognitionRestartAttemptsRef.current = 0
    recognitionEndedRef.current = false

    recognition.onstart = () => {
      recognitionSessionRef.current += 1

      /*
       * Each browser recognition start is a new logical session.
       * Result indices can safely begin at zero again because the session ID
       * is included in every final-result key.
       */
      interimTranscriptRef.current = ''
    }

    recognition.onresult = (event) => {
      const sessionId = recognitionSessionRef.current
      const interimParts: string[] = []

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const result = event.results[i]
        if (!result) continue

        const text = result[0]?.transcript?.trim()
        if (!text) continue

        if (result.isFinal) {
          const key = `${sessionId}:${i}`

          finalResultsRef.current.set(key, {
            sessionId,
            resultIndex: i,
            text,
          })
        } else {
          interimParts.push(text)
        }
      }

      interimTranscriptRef.current = interimParts.join(' ').trim()
    }

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', {
        session: recognitionSessionRef.current,
        error: event.error,
      })

      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      ) {
        recognitionFatalErrorRef.current = true
      }
    }

    recognition.onend = () => {
      recognitionEndedRef.current = true

      if (finishRequestedRef.current) {
        maybeFinalize()
        return
      }

      if (recognitionFatalErrorRef.current) {
        return
      }

      /*
       * Chrome can end SpeechRecognition spontaneously even with
       * continuous=true. Restart it while the 30-second test is still live.
       */
      window.clearTimeout(recognitionRestartRef.current)

      recognitionRestartRef.current = window.setTimeout(() => {
        if (finishRequestedRef.current) return
        if (finalizationStartedRef.current) return

        try {
          recognitionRestartAttemptsRef.current += 1
          recognitionEndedRef.current = false
          recognition.start()
        } catch (error) {
          recognitionEndedRef.current = true

          console.warn(
            'Speech recognition restart failed:',
            error,
          )

          /*
           * Give the browser a couple of chances to recover without
           * hammering start().
           */
          if (recognitionRestartAttemptsRef.current < 5) {
            recognitionRestartRef.current = window.setTimeout(
              () => {
                if (finishRequestedRef.current) return

                try {
                  recognitionEndedRef.current = false
                  recognition.start()
                } catch {
                  recognitionEndedRef.current = true
                }
              },
              RECOGNITION_RESTART_DELAY_MS * 3,
            )
          }
        }
      }, RECOGNITION_RESTART_DELAY_MS)
    }

    try {
      recognition.start()
    } catch (error) {
      console.warn(
        'Initial SpeechRecognition start failed:',
        error,
      )

      recognitionEndedRef.current = true
    }
  }

  const start = async () => {
    setPhase('requesting')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      streamRef.current = stream

      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume()
      }

      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()

      analyser.fftSize = 2048
      source.connect(analyser)
      analyserRef.current = analyser

      volumesRef.current = []
      recordingChunksRef.current = []
      finalResultsRef.current = new Map()
      interimTranscriptRef.current = ''

      recognitionSessionRef.current = 0
      recognitionEndedRef.current = true
      recordingStoppedRef.current = true
      finishRequestedRef.current = false
      finalizationStartedRef.current = false
      recognitionFatalErrorRef.current = false
      recognitionRestartAttemptsRef.current = 0

      const recorderMimeType =
        typeof MediaRecorder !== 'undefined' &&
          MediaRecorder.isTypeSupported(
            'audio/webm;codecs=opus',
          )
          ? 'audio/webm;codecs=opus'
          : ''

      const recorder = recorderMimeType
        ? new MediaRecorder(stream, {
          mimeType: recorderMimeType,
        })
        : new MediaRecorder(stream)

      recorderRef.current = recorder
      recordingStoppedRef.current = false

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        recordingStoppedRef.current = true

        const completeRecording = new Blob(
          recordingChunksRef.current,
          {
            type:
              recorder.mimeType ||
              'audio/webm;codecs=opus',
          },
        )
        console.log(
          'Complete recording:',
          completeRecording.size,
          'bytes',
        )
        maybeFinalize()
      }

      /*
       * No `start(250)`.
       *
       * The old argument was only MediaRecorder's dataavailable
       * timeslice. It never limited SpeechRecognition, but removing it
       * makes the separation explicit: we want one complete in-memory
       * recording, delivered when recording stops.
       */
      recorder.start()

      setSecondsLeft(DURATION_S)
      setPhase('running')

      const buffer = new Float32Array(analyser.fftSize)

      sampleIntervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return

        analyser.getFloatTimeDomainData(buffer)

        let sumSquares = 0

        for (let i = 0; i < buffer.length; i++) {
          sumSquares += buffer[i] * buffer[i]
        }

        volumesRef.current.push(
          Math.sqrt(sumSquares / buffer.length),
        )
      }, SAMPLE_INTERVAL_MS)

      startRecognition()

      countdownRef.current = window.setInterval(() => {
        setSecondsLeft((seconds) => {
          if (seconds <= 1) {
            window.clearInterval(countdownRef.current)
            requestFinish()
            return 0
          }

          return seconds - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Unable to start persuasive pitch test:', error)

      cleanup()
      setPhase('denied')
    }
  }

  return (
    <div className="pitch-test">
      {phase === 'idle' && (
        <>
          <p className="pitch-prompt-preview">
            Prompt: "{prompt}"
          </p>

          <p className="pitch-instructions">
            30 seconds to speak. Your browser analyzes vocal
            delivery and speech fluency during the test using
            your microphone. The complete microphone recording
            is captured temporarily for analysis and is not
            uploaded or saved by this component.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={start}
          >
            Grant Mic & Start
          </button>
        </>
      )}

      {phase === 'requesting' && (
        <p className="pitch-instructions">
          Requesting microphone access...
        </p>
      )}

      {phase === 'denied' && (
        <>
          <p className="pitch-instructions">
            Microphone access was denied or is unavailable in
            this browser. This test needs microphone permission
            to run.
          </p>

          <button
            type="button"
            className="btn btn-outline"
            onClick={start}
          >
            Try Again
          </button>
        </>
      )}

      {phase === 'running' && (
        <>
          <p className="pitch-prompt-active">
            "{prompt}"
          </p>

          <div className="pitch-recording-indicator">
            <span className="pitch-dot" />
            Recording — {secondsLeft}s left
          </div>
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