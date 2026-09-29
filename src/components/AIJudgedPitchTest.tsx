import { useEffect, useRef, useState } from 'react'

const DURATION_S = 30
const API_KEY_STORAGE = 'vitae-ascend:anthropic-api-key'

const PROMPTS = [
  'Sell me this stapler like it\u2019s the best one ever made.',
  'Convince me to try a restaurant I\u2019ve never heard of.',
  'Pitch an idea that would make next Tuesday better.',
]

type Phase = 'setup' | 'recording' | 'transcribing' | 'scoring' | 'done' | 'error'

// Minimal ambient typing so TS doesn't complain about the vendor-prefixed Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
    SpeechRecognition?: new () => SpeechRecognitionLike
  }
  interface SpeechRecognitionLike {
    continuous: boolean
    interimResults: boolean
    lang: string
    start: () => void
    stop: () => void
    onresult: ((event: any) => void) | null
    onerror: ((event: any) => void) | null
  }
}

interface AIJudgedPitchTestProps {
  onComplete: (score: number) => void
}

export default function AIJudgedPitchTest({ onComplete }: AIJudgedPitchTestProps) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE) ?? ''
    } catch {
      return ''
    }
  })
  const [secondsLeft, setSecondsLeft] = useState(DURATION_S)
  const [errorMsg, setErrorMsg] = useState('')
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)])

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const countdownRef = useRef<number | undefined>(undefined)
  const transcriptRef = useRef('')

  useEffect(
    () => () => {
      window.clearInterval(countdownRef.current)
      recognitionRef.current?.stop()
    },
    [],
  )

  const speechSupported =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  const saveKey = (key: string) => {
    setApiKey(key)
    try {
      localStorage.setItem(API_KEY_STORAGE, key)
    } catch {
      // ignore
    }
  }

  const scoreWithClaude = async (text: string) => {
    setPhase('scoring')
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: `You are scoring a 30-second spoken pitch for persuasiveness, structure, clarity, and charisma, on a scale of 0-100. The prompt they were given was: "${prompt}". Here is the transcript:\n\n"${text}"\n\nRespond with ONLY a JSON object, nothing else: {"score": <number 0-100>, "note": "<one short sentence of feedback>"}`,
            },
          ],
        }),
      })
      if (!response.ok) throw new Error(`API returned ${response.status}`)
      const data = await response.json()
      const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')?.text ?? '{}'
      const cleaned = textBlock.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 0)))
      setPhase('done')
      onComplete(score)
    } catch {
      setErrorMsg(
        'Could not reach the Anthropic API. Check your key is valid and has available credits. If this keeps happening, your browser/environment may be blocking the direct request (CORS) — a small local proxy may be needed as a workaround.',
      )
      setPhase('error')
    }
  }

  const startRecording = () => {
    if (!speechSupported) {
      setErrorMsg('Speech recognition isn\u2019t supported in this browser (Chrome works best). This test needs it to transcribe your pitch.')
      setPhase('error')
      return
    }
    const SpeechRecognitionCtor = (window.SpeechRecognition || window.webkitSpeechRecognition)!
    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    transcriptRef.current = ''
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcriptRef.current += event.results[i][0].transcript + ' '
        }
      }
    }
    recognition.onerror = () => {
      // Non-fatal — keep whatever transcript was captured so far
    }
    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch {
      setErrorMsg('Could not start speech recognition. Check microphone permissions.')
      setPhase('error')
      return
    }

    setSecondsLeft(DURATION_S)
    setPhase('recording')
    countdownRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          recognition.stop()
          window.clearInterval(countdownRef.current)
          setPhase('transcribing')
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (phase !== 'transcribing') return
    const text = transcriptRef.current.trim()
    if (!text) {
      setErrorMsg('No speech was detected. Try again in a quieter environment, closer to the mic.')
      setPhase('error')
      return
    }
    scoreWithClaude(text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <div className="ai-pitch-test">
      {phase === 'setup' && (
        <>
          <p className="pitch-instructions">
            Optional — uses your own Anthropic API key, sent directly from your browser to Anthropic, stored only
            in your browser's localStorage. Each attempt costs a small amount on your account. Speech recognition
            works best in Chrome.
          </p>
          <input
            type="password"
            className="api-key-input"
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => saveKey(e.target.value)}
          />
          <p className="pitch-prompt-preview">Prompt: "{prompt}"</p>
          <button type="button" className="btn btn-primary" onClick={startRecording} disabled={!apiKey}>
            Start (30s)
          </button>
        </>
      )}
      {phase === 'recording' && (
        <div className="pitch-recording-indicator">
          <span className="pitch-dot" /> Recording — {secondsLeft}s left
        </div>
      )}
      {(phase === 'transcribing' || phase === 'scoring') && (
        <p className="pitch-instructions">
          {phase === 'transcribing' ? 'Transcribing...' : 'Claude is scoring your pitch...'}
        </p>
      )}
      {phase === 'error' && (
        <>
          <p className="pitch-instructions">{errorMsg}</p>
          <button type="button" className="btn btn-outline" onClick={() => setPhase('setup')}>
            Back
          </button>
        </>
      )}
      {phase === 'done' && <p className="pitch-instructions">Done.</p>}
    </div>
  )
}