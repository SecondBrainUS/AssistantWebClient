/**
 * Tests for the client-side send routing logic.
 *
 * The bug this guards against: a new model_api_source value is added to
 * models.json (server) but the client's handleSend still sends via the wrong
 * path (e.g., OpenAI Realtime two-message format instead of SBAW format).
 *
 * How to keep this up to date: when you add a new provider, add its
 * model_api_source to getSendPath() and update the assertions below.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { getSendPath } from '../utils/sendRouting.js'

// Load the server's models.json so this test fails automatically if a new
// model_api_source appears there without a corresponding client-side route.
const MODELS_JSON_PATH = resolve(
  import.meta.dirname,
  '../../../../repos/sb-webserver/webserver/models.json'
)

function loadModels() {
  try {
    return JSON.parse(readFileSync(MODELS_JSON_PATH, 'utf8')).models
  } catch {
    // When running outside the super-workspace (e.g. CI on the webclient repo
    // alone), fall back to the known sources so the other tests still run.
    return null
  }
}

describe('getSendPath', () => {
  it('returns "sbaw" for aisuite', () => {
    expect(getSendPath('aisuite')).toBe('sbaw')
  })

  it('returns "sbaw" for anthropic', () => {
    expect(getSendPath('anthropic')).toBe('sbaw')
  })

  it('returns "realtime" for openai_realtime', () => {
    expect(getSendPath('openai_realtime')).toBe('realtime')
  })

  it('returns null for an unknown source', () => {
    expect(getSendPath('some_new_provider_not_yet_wired')).toBeNull()
  })
})

describe('models.json coverage', () => {
  it('every model_api_source in models.json maps to a known send path', () => {
    const models = loadModels()
    if (!models) {
      console.warn('models.json not found — skipping cross-repo coverage check')
      return
    }

    const sources = [...new Set(models.map((m) => m.model_api_source))]
    const unhandled = sources.filter((s) => getSendPath(s) === null)

    expect(unhandled).toEqual(
      [],
      `These model_api_source values have no client send path: ${unhandled.join(', ')}. ` +
        `Add them to getSendPath() in src/utils/sendRouting.js.`
    )
  })
})
