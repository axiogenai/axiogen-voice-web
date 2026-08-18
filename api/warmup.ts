import type { VercelRequest, VercelResponse } from '@vercel/node'

const HF_BASE = 'https://adityax26-axiogenttspro.hf.space'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow Vercel Cron invocations (or manual GET for testing)
  const authHeader = req.headers.authorization
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const start = Date.now()

  try {
    // Send a tiny warmup request to keep the ZeroGPU pod alive
    const r1 = await fetch(`${HF_BASE}/gradio_api/call/generate_gpu_b64`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: ['Hi.', 'af_bella', 1.0] }),
      signal: AbortSignal.timeout(25000),
    })

    if (!r1.ok) {
      return res.status(502).json({ ok: false, error: `HF returned ${r1.status}` })
    }

    const { event_id } = await r1.json()

    // Fetch the result stream (don't need audio, just confirm GPU ran)
    const r2 = await fetch(`${HF_BASE}/gradio_api/call/generate_gpu_b64/${event_id}`, {
      signal: AbortSignal.timeout(25000),
    })
    const text = await r2.text()
    const hasAudio = text.includes('data:') && text.length > 100

    const latencyMs = Date.now() - start

    console.log(`[warmup] OK — ${latencyMs}ms — hasAudio=${hasAudio}`)

    return res.status(200).json({
      ok: true,
      latencyMs,
      hasAudio,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    const latencyMs = Date.now() - start
    console.error(`[warmup] FAILED — ${latencyMs}ms —`, err.message)
    return res.status(500).json({ ok: false, error: err.message, latencyMs })
  }
}
