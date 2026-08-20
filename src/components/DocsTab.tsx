import { useState } from 'react'
import { CodeBlock } from './CodeBlock'
import { VOICES } from '../lib/tts'
import { Terminal, Code2, Globe, Sparkles, Shield, Cpu, Layers, Server, KeyRound, AlertTriangle, FileCode } from 'lucide-react'

// --- Code Examples Branded with api.axiogen.in ---

const REACT_HOOK_CODE = `// useAxiogenTTS.ts — Drop-in React / Next.js Hook
import { useState, useRef, useCallback } from 'react';

const API_BASE = 'https://api.axiogen.in';

export function useAxiogenTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (
    text: string,
    voice = 'af_bella',
    speed = 1.0,
    apiKey = 'YOUR_API_KEY'
  ) => {
    if (!text.trim()) return;
    setIsSpeaking(true);
    setError(null);

    try {
      const res = await fetch(\`\${API_BASE}/v1/audio/speech\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({ input: text, voice, speed })
      });

      if (!res.ok) throw new Error(\`Engine error (\${res.status})\`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch (err: any) {
      setError(err.message || 'Speech generation failed');
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking, error };
}`

const JS_STREAMING_CODE = `// Real-Time SSE Chunk-by-Chunk Streaming (Web Audio API)
async function streamSpeechLive(
  text,
  voice = 'af_bella',
  speed = 1.0,
  apiKey = 'YOUR_API_KEY'
) {
  const API_BASE = 'https://api.axiogen.in';
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)({
    sampleRate: 24000
  });
  let nextStartTime = audioCtx.currentTime + 0.05;

  const res = await fetch(\`\${API_BASE}/v1/tts/stream\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify({ input: text, voice, speed })
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data:') && !line.includes('[DONE]')) {
        const chunk = JSON.parse(line.slice(5).trim());

        if (chunk?.audio) {
          console.log(\`Chunk \${chunk.index}: "\${chunk.text}" (\${chunk.duration}s)\`);

          // Decode base64 WAV and play immediately
          const binary = atob(chunk.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

          const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);

          if (nextStartTime < audioCtx.currentTime) {
            nextStartTime = audioCtx.currentTime + 0.02;
          }
          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
        }
      }
    }
  }
}`

const NODE_BACKEND_CODE = `// Node.js — Generate and save .wav file via Axiogen REST API
const fs = require('fs');

async function synthesizeToFile(
  text,
  outputFile = 'output.wav',
  apiKey = 'YOUR_API_KEY'
) {
  const res = await fetch('https://api.axiogen.in/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
    },
    body: JSON.stringify({
      input: text,
      voice: 'af_bella',
      speed: 1.0
    })
  });

  if (!res.ok) throw new Error(\`Error: \${res.status}\`);

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputFile, buffer);
  console.log(\`Audio saved -> \${outputFile} (\${buffer.length} bytes)\`);
}

synthesizeToFile("Welcome to Axiogen Voice Pro Enterprise.");`

const PYTHON_REQUESTS_CODE = `# Python — Direct REST API synthesis
import requests

API_BASE = "https://api.axiogen.in"
API_KEY = "YOUR_API_KEY"

def synthesize_speech(text, voice="af_bella", speed=1.0, output="speech.wav"):
    res = requests.post(
        f"{API_BASE}/v1/audio/speech",
        json={"input": text, "voice": voice, "speed": speed},
        headers={"Authorization": f"Bearer {API_KEY}"}
    )
    res.raise_for_status()

    with open(output, "wb") as f:
        f.write(res.content)
    print(f"Saved audio -> {output} ({len(res.content)} bytes)")

synthesize_speech("High quality neural text to speech engine.")`

const CURL_SNIPPET = `# Direct WAV synthesis (OpenAI-compatible endpoint)
curl -X POST https://api.axiogen.in/v1/audio/speech \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"input": "Hello world from cURL", "voice": "af_bella", "speed": 1.0}' \\
  --output speech.wav

# SSE Streaming (sentence-by-sentence, real-time)
curl -N -X POST https://api.axiogen.in/v1/tts/stream \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"input": "Hello! Welcome to Axiogen Voice.", "voice": "af_bella", "speed": 1.0}'

# List available voices
curl https://api.axiogen.in/v1/voices \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Health check
curl https://api.axiogen.in/health`

const GO_CODE = `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func main() {
	apiBase := "https://api.axiogen.in"
	apiKey := "YOUR_API_KEY"
	text := "Speech synthesis via Golang"

	payload, _ := json.Marshal(map[string]interface{}{
		"input": text,
		"voice": "af_bella",
		"speed": 1.0,
	})

	req, _ := http.NewRequest("POST", apiBase+"/v1/audio/speech", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()

	audioBytes, _ := io.ReadAll(resp.Body)
	os.WriteFile("speech.wav", audioBytes, 0644)
	fmt.Printf("Audio saved -> speech.wav (%d bytes)\\n", len(audioBytes))
}`

export function DocsTab() {
  const [activeLang, setActiveLang] = useState<'react' | 'js_stream' | 'node' | 'python' | 'curl' | 'go'>('react')
  const [activeSection, setActiveSection] = useState<'quickstart' | 'endpoints' | 'voices' | 'auth' | 'specs'>('quickstart')

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">

      {/* Top Banner Header */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Axiogen Voice API Documentation</h1>
              <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/30">v2.0 Production</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Dedicated 4-Core Ampere A1 neural speech engine with direct HTTPS REST API and real-time SSE streaming.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              <Shield className="w-3.5 h-3.5" /> Strict Auth Enabled
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-md">
              <Cpu className="w-3.5 h-3.5 text-violet-400" /> 24kHz FP16
            </span>
          </div>
        </div>

        {/* Global Connection Endpoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold block">Production API Base URL (Direct)</span>
            <code className="text-xs font-mono text-emerald-400 select-all block">https://api.axiogen.in</code>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold block">Authentication Method</span>
            <code className="text-xs font-mono text-zinc-200 select-all block">Authorization: Bearer YOUR_API_KEY</code>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-3 overflow-x-auto">
        {[
          { id: 'quickstart', label: 'Quickstart & SDKs', icon: Code2 },
          { id: 'endpoints',  label: 'API Endpoints',    icon: Server },
          { id: 'voices',     label: '54-Voice Library', icon: Sparkles },
          { id: 'auth',       label: 'Authentication',   icon: KeyRound },
          { id: 'specs',      label: 'Audio Specs',      icon: Layers },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap
              ${activeSection === tab.id
                ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SECTION 1: QUICKSTART & SDKs */}
      {activeSection === 'quickstart' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-violet-400" />
                  <span>Integration SDKs & Code Examples</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Direct copy-pasteable examples using your dedicated endpoint <code>api.axiogen.in</code>.</p>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1 flex-wrap">
                {[
                  { id: 'react', label: 'React / Next.js Hook', icon: Globe },
                  { id: 'js_stream', label: 'Streaming SSE', icon: Sparkles },
                  { id: 'node', label: 'Node.js', icon: Code2 },
                  { id: 'python', label: 'Python', icon: Terminal },
                  { id: 'curl', label: 'cURL', icon: Terminal },
                  { id: 'go', label: 'Golang', icon: Server },
                ].map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setActiveLang(l.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer
                      ${activeLang === l.id
                        ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                  >
                    <l.icon className="w-3 h-3 opacity-70" />
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Code Viewer */}
            <div className="pt-2">
              {activeLang === 'react' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Drop-in hook for any React / Next.js app connecting to <code>api.axiogen.in</code>:</span>
                  </div>
                  <CodeBlock code={REACT_HOOK_CODE} language="typescript" />
                </div>
              )}
              {activeLang === 'js_stream' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Low latency sentence-by-sentence streaming playback via Web Audio API:</span>
                  </div>
                  <CodeBlock code={JS_STREAMING_CODE} language="javascript" />
                </div>
              )}
              {activeLang === 'node' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Server-side synthesis in Node.js to generate and save .wav audio files:</span>
                  </div>
                  <CodeBlock code={NODE_BACKEND_CODE} language="javascript" />
                </div>
              )}
              {activeLang === 'python' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Direct Python HTTP synthesis using standard requests:</span>
                  </div>
                  <CodeBlock code={PYTHON_REQUESTS_CODE} language="python" />
                </div>
              )}
              {activeLang === 'curl' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Standard cURL commands pointing to <code>api.axiogen.in</code>:</span>
                  </div>
                  <CodeBlock code={CURL_SNIPPET} language="bash" />
                </div>
              )}
              {activeLang === 'go' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Golang client to synthesize and save WAV speech from <code>api.axiogen.in</code>:</span>
                  </div>
                  <CodeBlock code={GO_CODE} language="go" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ENDPOINTS */}
      {activeSection === 'endpoints' && (
        <div className="space-y-6">
          {/* Endpoint 1: Real-time Streaming */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">POST</span>
              <code className="text-sm font-mono text-white font-semibold">https://api.axiogen.in/v1/tts/stream</code>
              <span className="ml-auto text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">SSE Streaming</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Streams audio clause-by-clause over an SSE connection. Each chunk contains base64-encoded WAV audio that plays immediately while subsequent chunks synthesize in parallel.
            </p>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">Request Body (JSON)</span>
              <div className="overflow-hidden rounded-lg border border-zinc-800">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950 font-mono text-zinc-400">
                      <th className="py-2 px-3">Field</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Required</th>
                      <th className="py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-3 text-violet-400 font-semibold">input</td>
                      <td className="py-2 px-3 text-zinc-400">string</td>
                      <td className="py-2 px-3 text-emerald-400">Yes</td>
                      <td className="py-2 px-3 text-zinc-300 font-sans text-xs">Text to speak (up to 5,000 characters).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-violet-400 font-semibold">voice</td>
                      <td className="py-2 px-3 text-zinc-400">string</td>
                      <td className="py-2 px-3 text-zinc-500">No</td>
                      <td className="py-2 px-3 text-zinc-300 font-sans text-xs">Voice ID (default: <code>af_bella</code>). See 54-Voice Library.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-violet-400 font-semibold">speed</td>
                      <td className="py-2 px-3 text-zinc-400">float</td>
                      <td className="py-2 px-3 text-zinc-500">No</td>
                      <td className="py-2 px-3 text-zinc-300 font-sans text-xs">Speaking rate between <code>0.5</code> and <code>2.0</code>. Default: <code>1.0</code>.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">SSE Response Chunk Format</span>
              <div className="font-mono text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                {`data: {"index": 0, "text": "Hello!", "audio": "<base64_wav>", "duration": 0.66, "gen_time_ms": 681.2}`}
              </div>
            </div>
          </div>

          {/* Endpoint 2: Full Synchronous Audio (OpenAI Compatible) */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">POST</span>
              <code className="text-sm font-mono text-white font-semibold">https://api.axiogen.in/v1/audio/speech</code>
              <span className="ml-auto text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">OpenAI Compatible</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Synthesizes complete input text and returns a single <code>audio/wav</code> file. Drop-in compatible with the OpenAI TTS API format.
            </p>
            <div className="text-xs font-mono text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              Body: <code className="text-zinc-200">{`{"input": "Your text here", "voice": "af_bella", "speed": 1.0}`}</code>
              <br />
              Response: <code className="text-emerald-400">audio/wav (PCM 16-bit, 24kHz)</code>
            </div>
          </div>

          {/* Endpoint 3: Health & Voices */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-xs font-bold text-blue-400">GET</span>
              <h3 className="text-sm font-semibold text-white">Utility Endpoints</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Health Check</span>
                <code className="text-[11px] font-mono text-zinc-200 block">GET https://api.axiogen.in/health</code>
                <span className="text-[10px] text-zinc-500 block">Returns engine status, uptime, voice count</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Voice Catalog</span>
                <code className="text-[11px] font-mono text-zinc-200 block">GET https://api.axiogen.in/v1/voices</code>
                <span className="text-[10px] text-zinc-500 block">Returns all 54 voices with metadata</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Swagger Docs</span>
                <code className="text-[11px] font-mono text-zinc-200 block">GET https://api.axiogen.in/docs</code>
                <span className="text-[10px] text-zinc-500 block">Interactive API documentation</span>
              </div>
            </div>
          </div>

          {/* Endpoint 4: Key Management API */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-xs font-bold text-violet-400">DATABASE</span>
              <h3 className="text-sm font-semibold text-white">Programmatic API Key Management</h3>
            </div>
            <p className="text-xs text-zinc-400">Manage user API keys directly via REST endpoints on <code>api.axiogen.in</code>:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Create Key</span>
                <code className="text-[11px] font-mono text-zinc-200 block">POST https://api.axiogen.in/v1/keys/create</code>
                <span className="text-[10px] text-zinc-500 block">Body: <code>{`{"name": "My App"}`}</code></span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">List Keys</span>
                <code className="text-[11px] font-mono text-zinc-200 block">GET https://api.axiogen.in/v1/keys/list</code>
                <span className="text-[10px] text-zinc-500 block">Returns all active API keys</span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">Revoke Key</span>
                <code className="text-[11px] font-mono text-zinc-200 block">DELETE https://api.axiogen.in/v1/keys/revoke</code>
                <span className="text-[10px] text-zinc-500 block">Query: <code>?key_id=key_xxx</code></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: VOICES */}
      {activeSection === 'voices' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">54 Neural Voice Library</h2>
            <p className="text-xs text-zinc-400 mt-0.5">All 54 neural voices supported across American, British, Spanish, Hindi, French, Italian, Japanese, Chinese, and Portuguese:</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 font-semibold text-zinc-400">
                  <th className="py-3 px-4">Voice ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Accent</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Style & Recommended Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40 font-mono text-[11px]">
                {VOICES.map(v => (
                  <tr key={v.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 text-violet-400 font-semibold">{v.id}</td>
                    <td className="py-3 px-4 text-zinc-200 font-sans font-medium">{v.name}</td>
                    <td className="py-3 px-4 text-zinc-400 font-sans">{v.accent}</td>
                    <td className="py-3 px-4 text-zinc-400 font-sans">{v.gender}</td>
                    <td className="py-3 px-4 text-zinc-300 font-sans text-xs">{v.style}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: AUTHENTICATION */}
      {activeSection === 'auth' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Strict Authentication Protocol</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Every request to Axiogen Voice Engine must contain a valid API key via <code>Authorization: Bearer</code> header, <code>X-API-Key</code> header, or <code>api_key</code> query parameter. Unauthorized requests are immediately blocked.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <span className="text-xs font-semibold text-white block">Master Admin Token</span>
              <code className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded block select-all">
                teamaxiogen_admin_master
              </code>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Full administrative access with unlimited concurrency and bypass permissions.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <span className="text-xs font-semibold text-white block">Application Tokens (Database Synced)</span>
              <code className="text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded block select-all">
                axg_00ee••••••••••••••••8f3f
              </code>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Generate dedicated tokens per client application in the <strong className="text-zinc-300">API Keys</strong> tab.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Unauthorized Request Error Response (401)</span>
            </div>
            <div className="font-mono text-xs text-red-300 bg-black/40 p-2.5 rounded border border-red-500/20">
              {`{ "error": "Unauthorized: Invalid or missing API key. Please provide a valid Axiogen API key." }`}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: SPECS */}
      {activeSection === 'specs' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white">Audio & Engine Specifications</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Technical specifications of the dedicated neural speech engine:</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-center">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Sampling Rate</div>
              <div className="font-mono text-lg font-bold text-white mt-1">24,000 Hz</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">24kHz High-Fidelity</div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-center">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Audio Container</div>
              <div className="font-mono text-lg font-bold text-white mt-1">WAV (PCM 16)</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Uncompressed RIFF</div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-center">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Channels</div>
              <div className="font-mono text-lg font-bold text-white mt-1">Mono (1.0)</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Optimized for Voice</div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-center">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Hardware</div>
              <div className="font-mono text-lg font-bold text-emerald-400 mt-1">Ampere A1</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">4 OCPU · 24GB · Dedicated</div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
