import { readFile } from 'node:fs/promises'

const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434'
const DEFAULT_OLLAMA_MODEL = 'glm-ocr'

function trimTrailingSlash(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export function getOllamaOcrConfig(env = process.env) {
  // Canonical name is OLLAMA_URL; OLLAMA_BASE_URL kept as legacy fallback
  // (docker-compose < 2026-11-07 and old .env files).
  const raw = env.OLLAMA_URL?.trim() || env.OLLAMA_BASE_URL?.trim() || ''
  return {
    baseUrl: trimTrailingSlash(raw || DEFAULT_OLLAMA_URL),
    model: env.OLLAMA_OCR_MODEL?.trim() || DEFAULT_OLLAMA_MODEL,
  }
}

export async function runOllamaImageOcr(filePath, {
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const config = getOllamaOcrConfig(env)
  const imageBase64 = await readFile(filePath, 'base64')

  const response = await fetchImpl(`${config.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt: 'Text Recognition: Extract all visible text from the image. Preserve line breaks. Do not add explanations.',
      images: [imageBase64],
      stream: false,
    }),
  })

  if (!response.ok) {
    let details = `${response.status}`
    try {
      const body = await response.json()
      if (typeof body?.error === 'string') details = body.error
    } catch {}
    throw new Error(`Ollama OCR request failed: ${details}`)
  }

  const body = await response.json()
  const text = typeof body?.response === 'string' ? body.response.trim() : ''
  if (!text) throw new Error('Ollama OCR returned an empty response')

  return {
    text,
    model: config.model,
    baseUrl: config.baseUrl,
  }
}
