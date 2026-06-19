# AssistantWebClient — Claude Code Context

## What This Is

Frontend web client for the Second Brain AI assistant platform. Contains **two parallel implementations** — Vue v1 (production) and React v2 (in-development rewrite).

**Stack v1:** Vue 3, Vite, Pinia, Vue Router, Tailwind CSS, Socket.IO client, Axios
**Stack v2:** React 19, TypeScript, Vite + SWC, React Router, Tailwind CSS v4, Socket.IO client, Axios

---

## Two Clients

| | `assistant-web-client/` (v1) | `assistant-web-client-v2/` (v2) |
|---|---|---|
| Framework | Vue 3.5 | React 19 + TypeScript |
| Status | **Production** | In development (early-stage rewrite) |
| Features | Full: audio, file upload, function cards, model options | Minimal: auth + workspace shell only |
| State | Pinia | React Context API |
| Routing | Vue Router | React Router DOM |

---

## Backend Connection

Both clients connect to `AssistantWebserver` at `http://localhost:8900` (configurable).

**Base URL:** `{protocol}://{host}:{port}/assistant`
**REST API:** `{base}/api/v1`
**Socket.IO path:** `{base}/socket.io/`
**Socket.IO namespace:** `/assistant/realtime`

**Auth flow:** Google OAuth → `GET /auth/google/login` → Google callback → `GET /auth/validate-token?temp_token=XXX` → sets HTTP-only cookie → `GET /auth/me`

All requests use `withCredentials: true` (cookies). 401/403 triggers auto-retry with `POST /auth/refresh`.

---

## Socket.IO Events

**Client → Server:**
- `create_room` / `join_room` / `leave_room` / `find_chat`
- `send_message { room_id, message, model_id }`

**Server → Client:**
- `room_created`, `room_joined`, `room_join_error`, `room_found`, `room_not_found`
- `message_sent {msgid}`, `receive_message {room_id}`
- `function_call {room_id}`, `function_result {room_id}`, `function_error {room_id}`
- `stream_start`, `stream_chunk`, `stream_end`, `stream_error` (all with room_id)

---

## Key v1 Components

- `Chat.vue` — chat message display with syntax highlighting
- `ChatInput.vue` — textarea, file upload (drag/drop), microphone recording (PCM16 → base64)
- `ModelSelector.vue` — model picker with API source / provider filters
- `function-cards/` — custom result renderers for each tool type (Spotify, Tidal, Finance, Sensors, Brightdata)
- `FunctionComponentRegistry.js` — maps function name → card component (extensible pattern for new tools)
- `audioHandler.js` + `audioProcessor.worklet.js` — Web Audio API recording and playback queue

---

## Running Locally

```bash
# v1
cd assistant-web-client
npm install
npm run dev   # http://localhost:3000

# v2
cd assistant-web-client-v2
npm install
npm run dev   # http://localhost:3000
```

**Environment vars** (`.env`):
```
VITE_BASE_PATH=/assistant
VITE_API_PATH=/api/v1
VITE_API_HOST=localhost
VITE_API_PORT=8900
VITE_API_PROTOCOL=http
```

## Docker

v1 production: multi-stage Nginx build — `npm run build` → serve from `/usr/share/nginx/html`
v2 development: `Dockerfile.dev` — dev server with HMR on port 3000

---

## Non-Obvious Patterns

**Component registry (v1):** `FunctionComponentRegistry.js` maps function names to Vue components. When adding a new tool to AssistantWebserver that returns structured data, add a card component here.

**Socket.IO event naming:** Room-scoped events use the pattern `"event_name {room_id}"` as the event name — not Socket.IO namespaces, just dynamic event name strings. Makes grepping for events tricky.

**Audio context:** Web Audio API context may start suspended. If mic capture fails on first try, the context needs an explicit `.resume()` call.

**v2 is a shell:** v2 currently only has login + workspace page. All rich features (audio, file upload, function cards, model options) are only in v1. New features go in v1 until v2 reaches feature parity.
