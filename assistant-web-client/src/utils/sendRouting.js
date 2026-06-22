/**
 * Returns which client-side send path handles a given model_api_source.
 *
 * "sbaw"    → handleSendSBAW (aisuite, anthropic, any future HTTP-based provider)
 * "realtime" → OpenAI Realtime two-message flow
 * null       → unrecognised source (will surface as a test failure)
 *
 * Keep this in sync with the model_api_source values in models.json and the
 * room_types dict in assistant_room_manager.py on the server.
 */
export function getSendPath(model_api_source) {
  if (model_api_source === 'aisuite' || model_api_source === 'anthropic') {
    return 'sbaw'
  }
  if (model_api_source === 'openai_realtime') {
    return 'realtime'
  }
  return null
}
