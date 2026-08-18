import { CodeBlock } from './CodeBlock'
import { HF_BASE } from '../lib/tts'

const PYTHON_CODE = `from gradio_client import Client
import base64

client = Client("adityax26/axiogenttspro")
b64 = client.predict(
    text="Hello from Axiogen Voice Pro!",
    voice="af_bella",
    speed=1.0,
    api_name="/generate_gpu_b64"
)
with open("speech.wav", "wb") as f:
    f.write(base64.b64decode(b64))`

const JS_CODE = `async function tts(text, voice = 'af_bella', speed = 1.0) {
  const BASE = '${HF_BASE}';
  const r1 = await fetch(BASE + '/gradio_api/call/generate_gpu_b64', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [text, voice, speed] })
  });
  const { event_id } = await r1.json();
  const r2 = await fetch(BASE + '/gradio_api/call/generate_gpu_b64/' + event_id);
  for (const line of (await r2.text()).split('\\n')) {
    if (line.startsWith('data:')) {
      const [b64] = JSON.parse(line.slice(5));
      return b64; // base64 WAV string
    }
  }
}`

const CURL_CODE = `curl -X POST ${HF_BASE}/gradio_api/call/generate_gpu_b64 \\
  -H "Content-Type: application/json" \\
  -d '{"data": ["Hello!", "af_bella", 1.0]}'`

export function DocsTab() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400 mb-6">📚 API Reference</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-violet-400 mb-2">Base URL</h3>
            <CodeBlock code={HF_BASE} language="url" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-violet-400 mb-2">Endpoint</h3>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm font-mono">
              <div className="flex items-center gap-3">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">POST</span>
                <span className="text-zinc-300">/gradio_api/call/generate_gpu_b64</span>
              </div>
              <div className="mt-3 text-zinc-500 text-xs">
                Body: <code className="text-blue-300">{'{"data": ["text", "voice_id", speed]}'}</code>
              </div>
              <div className="mt-1 text-zinc-500 text-xs">
                Returns: <code className="text-blue-300">base64 WAV audio string</code>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-violet-400 mb-2">Python</h3>
            <CodeBlock code={PYTHON_CODE} language="python" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-violet-400 mb-2">JavaScript / Node.js</h3>
            <CodeBlock code={JS_CODE} language="javascript" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-violet-400 mb-2">cURL</h3>
            <CodeBlock code={CURL_CODE} language="bash" />
          </div>
        </div>
      </div>
    </div>
  )
}
