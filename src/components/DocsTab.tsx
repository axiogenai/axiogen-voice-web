import { CodeBlock } from './CodeBlock'
import { HF_BASE } from '../lib/tts'

const PYTHON_CODE = `from gradio_client import Client
import base64

client = Client("adityax26/axiogenttspro")
audio_b64 = client.predict(
    text="Hello from Axiogen Voice.",
    voice="af_bella",
    speed=1.0,
    api_name="/generate_gpu_b64"
)

with open("speech.wav", "wb") as f:
    f.write(base64.b64decode(audio_b64))`

const JS_CODE = `async function synthesize(text, voice = 'af_bella', speed = 1.0) {
  const BASE_URL = '${HF_BASE}';
  const initRes = await fetch(BASE_URL + '/gradio_api/call/generate_gpu_b64', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [text, voice, speed] })
  });

  const { event_id } = await initRes.json();
  const streamRes = await fetch(BASE_URL + '/gradio_api/call/generate_gpu_b64/' + event_id);
  const streamText = await streamRes.text();

  for (const line of streamText.split('\\n')) {
    if (line.startsWith('data:')) {
      const [base64Wav] = JSON.parse(line.slice(5));
      return base64Wav;
    }
  }
}`

const CURL_CODE = `curl -X POST ${HF_BASE}/gradio_api/call/generate_gpu_b64 \\
  -H "Content-Type: application/json" \\
  -d '{"data": ["Hello from cURL", "af_bella", 1.0]}'`

export function DocsTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-white">API Reference</h2>
          <p className="text-xs text-zinc-400 mt-1">Integration guides and client examples for production deployments.</p>
        </div>

        <div className="space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">Base Endpoint</span>
            <CodeBlock code={HF_BASE} language="endpoint" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">HTTP POST Method</span>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-xs font-mono">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">POST</span>
                <span className="text-zinc-200">/gradio_api/call/generate_gpu_b64</span>
              </div>
              <div className="text-zinc-500">Payload: <code className="text-zinc-300">{'{"data": ["<text>", "<voice_id>", <speed>]}'}</code></div>
              <div className="text-zinc-500 mt-0.5">Response: <code className="text-zinc-300">Base64-encoded WAV PCM 16-bit 24kHz</code></div>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">Python SDK</span>
            <CodeBlock code={PYTHON_CODE} language="python" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">JavaScript / Node.js</span>
            <CodeBlock code={JS_CODE} language="javascript" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">cURL</span>
            <CodeBlock code={CURL_CODE} language="bash" />
          </div>
        </div>
      </div>
    </div>
  )
}
