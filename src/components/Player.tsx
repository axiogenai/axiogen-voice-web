import { useState, useCallback, useRef } from 'react'
import { generateChunk, b64toArrayBuffer } from '../lib/tts'
import { Wave } from './Wave'
import { Volume2, CheckCircle2, AlertCircle } from 'lucide-react'

interface PlayerProps {
  voice: string
  speed: number
}

type Status = 'idle' | 'generating' | 'done' | 'error'

export function Player({ voice, speed }: PlayerProps) {
  const [text, setText] = useState(
    'Hello! Welcome to Axiogen Voice Pro.\n\nOur voice engine provides ultra-realistic neural speech synthesis powered by high-performance GPU acceleration.'
  )
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generate = useCallback(async () => {
    if (status === 'generating') return
    const trimmed = text.trim()
    if (!trimmed) return

    setStatus('generating')
    setStatusMsg('Synthesizing speech...')
    setAudioUrl(null)
    setLatencyMs(null)

    const t0 = performance.now()

    try {
      const b64 = await generateChunk(trimmed, voice, speed)
      if (!b64) throw new Error('Failed to retrieve audio stream')

      const totalMs = Math.round(performance.now() - t0)
      setLatencyMs(totalMs)

      const arrayBuf = b64toArrayBuffer(b64)
      const blob = new Blob([arrayBuf], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      setStatus('done')
      setStatusMsg('Synthesis complete')

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {})
        }
      }, 100)

    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err.message ?? 'Synthesis failed')
    }
  }, [text, voice, speed, status])

  const isGenerating = status === 'generating'

  return (
    <div className="space-y-4">
      {/* Input container */}
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={5000}
          rows={5}
          placeholder="Enter text to synthesize into speech..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 leading-relaxed resize-y outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all font-normal"
        />
        <div className="flex justify-end pt-1">
          <span className="text-[11px] font-mono text-zinc-500">
            {text.length} / 5000
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={generate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-white active:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm cursor-pointer"
      >
        {isGenerating ? (
          <>
            <Wave />
            <span>Generating Audio...</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-zinc-800" />
            <span>Generate Speech</span>
          </>
        )}
      </button>

      {/* Audio Playback & Diagnostics Panel */}
      {status !== 'idle' && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium">
              {isGenerating && <Wave />}
              {status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
              <span className={status === 'error' ? 'text-red-400' : 'text-zinc-300'}>
                {statusMsg}
              </span>
            </div>
            {latencyMs !== null && (
              <span className="font-mono text-xs font-medium text-zinc-400">
                {latencyMs}ms latency
              </span>
            )}
          </div>

          {audioUrl && (
            <div className="pt-1">
              <audio
                ref={audioRef}
                controls
                src={audioUrl}
                className="w-full h-9 rounded"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
