import { useState, useCallback } from 'react'
import {
  splitSentences,
  generateChunk,
  b64toArrayBuffer,
  mergeWAVs,
} from '../lib/tts'
import { Wave } from './Wave'

interface PlayerProps {
  voice: string
  speed: number
}

type Status = 'idle' | 'generating' | 'done' | 'error'

export function Player({ voice, speed }: PlayerProps) {
  const [text, setText] = useState(
    'Hello! Welcome to Axiogen Voice Pro.\n\nOur streaming engine plays the first chunk immediately while the rest generates in the background. Paste anything — even 300 words — and hit Stream.'
  )
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [metaMsg, setMetaMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [firstMs, setFirstMs] = useState<number | null>(null)

  const stream = useCallback(async () => {
    if (status === 'generating') return
    const trimmed = text.trim()
    if (!trimmed) return

    const sentences = splitSentences(trimmed)
    setStatus('generating')
    setStatusMsg('Starting...')
    setMetaMsg('0ms')
    setProgress(5)
    setAudioUrl(null)
    setFirstMs(null)

    const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext
    const ctx = new AudioCtx({ sampleRate: 24000 })
    if (ctx.state === 'suspended') await ctx.resume()

    let nextAt = ctx.currentTime + 0.05
    let firstDone = false
    const t0 = performance.now()
    const bufs: ArrayBuffer[] = []

    try {
      for (let i = 0; i < sentences.length; i++) {
        setStatusMsg(`Chunk ${i + 1} / ${sentences.length}…`)

        const b64 = await generateChunk(sentences[i], voice, speed)
        const ab = b64toArrayBuffer(b64)
        bufs.push(ab)

        const audioBuf = await ctx.decodeAudioData(ab.slice(0))

        if (!firstDone) {
          const ms = Math.round(performance.now() - t0)
          setFirstMs(ms)
          setMetaMsg(`⚡ First sound: ${ms}ms`)
          firstDone = true
        }

        const src = ctx.createBufferSource()
        src.buffer = audioBuf
        src.connect(ctx.destination)
        const now = ctx.currentTime
        if (nextAt < now) nextAt = now + 0.02
        src.start(nextAt)
        nextAt += audioBuf.duration

        setProgress(Math.round(((i + 1) / sentences.length) * 100))
      }

      const total = Math.round(performance.now() - t0)
      setStatus('done')
      setStatusMsg('Done — RTX 6000 powered!')
      setMetaMsg(`⚡ ${(total / 1000).toFixed(2)}s total`)
      setProgress(100)

      const blob = mergeWAVs(bufs)
      if (blob) setAudioUrl(URL.createObjectURL(blob))
    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err.message ?? 'Unknown error')
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
          placeholder="Type or paste text — first chunk plays instantly!"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 leading-relaxed
            resize-y outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
        />
        <span className="absolute bottom-3 right-3 text-[11px] text-zinc-600 font-mono">
          {text.length} / 5000
        </span>
      </div>

      {/* Generate button */}
      <button
        onClick={stream}
        disabled={isGenerating}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500
          px-6 py-4 text-base font-extrabold text-white tracking-tight
          shadow-[0_4px_18px_rgba(139,92,246,0.4)]
          hover:shadow-[0_6px_24px_rgba(139,92,246,0.6)] hover:-translate-y-0.5
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          transition-all duration-200"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <Wave /> Streaming Live Speech...
          </span>
        ) : (
          '⚡ Stream Speech — Instant Playback'
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

          {/* Progress bar */}
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* First-chunk badge */}
          {firstMs !== null && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
              ⚡ First audio in {firstMs}ms
            </div>
          )}

          {/* Audio player for full replay */}
          {audioUrl && (
            <audio controls src={audioUrl} className="w-full h-10 mt-1" />
          )}
        </div>
      )}
    </div>
  )
}
