import { useState, useCallback, useRef } from 'react'
import { generateChunk, b64toArrayBuffer } from '../lib/tts'
import { Wave } from './Wave'

interface PlayerProps {
  voice: string
  speed: number
}

type Status = 'idle' | 'generating' | 'done' | 'error'

export function Player({ voice, speed }: PlayerProps) {
  const [text, setText] = useState(
    'Hello! Welcome to Axiogen Voice Pro.\n\nOur voice engine provides ultra-realistic neural speech with zero repetition and crystal-clear 24kHz quality.'
  )
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [metaMsg, setMetaMsg] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generate = useCallback(async () => {
    if (status === 'generating') return
    const trimmed = text.trim()
    if (!trimmed) return

    setStatus('generating')
    setStatusMsg('Synthesizing on Nvidia RTX 6000...')
    setMetaMsg('Computing...')
    setAudioUrl(null)
    setLatencyMs(null)

    const t0 = performance.now()

    try {
      // 1 Clean Single Request — NO sentence duplication or overlapping loops!
      const b64 = await generateChunk(trimmed, voice, speed)
      if (!b64) throw new Error('No audio returned from engine')

      const totalMs = Math.round(performance.now() - t0)
      setLatencyMs(totalMs)

      const arrayBuf = b64toArrayBuffer(b64)
      const blob = new Blob([arrayBuf], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      setStatus('done')
      setStatusMsg('Speech Ready!')
      setMetaMsg(`⚡ ${(totalMs / 1000).toFixed(2)}s`)

      // Autoplay immediately
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {})
        }
      }, 100)

    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err.message ?? 'Generation failed')
    }
  }, [text, voice, speed, status])

  const isGenerating = status === 'generating'

  return (
    <div className="space-y-4">
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={5000}
          rows={5}
          placeholder="Type or paste any text to synthesize..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 leading-relaxed
            resize-y outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
        />
        <span className="absolute bottom-3 right-3 text-[11px] text-zinc-600 font-mono">
          {text.length} / 5000
        </span>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={isGenerating}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500
          px-6 py-4 text-base font-extrabold text-white tracking-tight
          shadow-[0_4px_18px_rgba(139,92,246,0.4)]
          hover:shadow-[0_6px_24px_rgba(139,92,246,0.6)] hover:-translate-y-0.5
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          transition-all duration-200 cursor-pointer"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <Wave /> Synthesizing Speech...
          </span>
        ) : (
          '⚡ Generate Speech'
        )}
      </button>

      {/* Player panel */}
      {status !== 'idle' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-violet-400">
              {isGenerating && <Wave />}
              {status === 'done' && '✅'}
              {status === 'error' && '❌'}
              <span>{statusMsg}</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">{metaMsg}</span>
          </div>

          {/* Latency badge */}
          {latencyMs !== null && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
              ⚡ Rendered in {latencyMs}ms on RTX 6000
            </div>
          )}

          {/* Clean HTML5 Audio Player */}
          {audioUrl && (
            <audio
              ref={audioRef}
              controls
              src={audioUrl}
              className="w-full h-10 mt-1"
            />
          )}
        </div>
      )}
    </div>
  )
}
