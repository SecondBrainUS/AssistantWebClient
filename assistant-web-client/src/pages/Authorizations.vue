<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-semibold mb-2">Authorizations</h1>
      <p class="text-gray-400 mb-8 text-sm">Connect third-party services so the assistant can act on your behalf.</p>

      <!-- Spotify -->
      <div class="bg-gray-800 rounded-xl p-6 mb-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div>
            <div class="font-medium">Spotify</div>
            <div class="text-sm mt-0.5">
              <span v-if="spotify.loading" class="text-gray-400">Checking…</span>
              <span v-else-if="spotify.connected" class="text-green-400">Connected</span>
              <span v-else class="text-gray-400">Not connected</span>
            </div>
          </div>
        </div>
        <a
          :href="spotifyLoginUrl"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="spotify.connected
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-green-500 text-white hover:bg-green-400'"
        >
          {{ spotify.connected ? 'Reconnect' : 'Connect' }}
        </a>
      </div>

      <!-- Tidal -->
      <div class="bg-gray-800 rounded-xl p-6 mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004 4.004-4.004 4.004 4.004 4.004-4.004zM8.008 16.004l4.004-4.004 4.004 4.004L20.02 12l-4.004-4.004-4.004 4.004-4.004-4.004L4.004 12z"/>
              </svg>
            </div>
            <div>
              <div class="font-medium">Tidal</div>
              <div class="text-sm mt-0.5">
                <span v-if="tidal.loading" class="text-gray-400">Checking…</span>
                <span v-else-if="tidal.connected" class="text-blue-400">Connected</span>
                <span v-else class="text-gray-400">Not connected</span>
              </div>
            </div>
          </div>
          <button
            @click="connectTidal"
            :disabled="tidal.connecting"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            :class="tidal.connected
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-blue-500 text-white hover:bg-blue-400'"
          >
            {{ tidal.connecting ? 'Opening…' : tidal.connected ? 'Reconnect' : 'Connect' }}
          </button>
        </div>

        <!-- Tidal OAuth URL display -->
        <div v-if="tidal.authUrl" class="mt-4 p-4 bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-300 mb-2">Open this link to authorize Tidal, then come back — the connection completes automatically.</p>
          <a
            :href="tidal.authUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-400 underline text-sm break-all hover:text-blue-300"
          >{{ tidal.authUrl }}</a>
          <p class="text-xs text-gray-500 mt-2">Link expires in 10 minutes.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import baseApi from '../utils/baseApi'

const API_URL = import.meta.env.VITE_API_URL || ''
const API_PATH = import.meta.env.VITE_API_PATH || '/api/v1'
const spotifyLoginUrl = `${API_URL}${API_PATH}/auth/spotify/login`

const spotify = ref({ loading: true, connected: false })
const tidal = ref({ loading: true, connected: false, connecting: false, authUrl: null })

async function checkStatuses() {
  const [spotifyRes, tidalRes] = await Promise.allSettled([
    baseApi.get('/auth/spotify/status'),
    baseApi.get('/auth/tidal/status'),
  ])
  spotify.value.connected = spotifyRes.status === 'fulfilled' && spotifyRes.value.data.connected
  spotify.value.loading = false
  tidal.value.connected = tidalRes.status === 'fulfilled' && tidalRes.value.data.connected
  tidal.value.loading = false
}

async function connectTidal() {
  tidal.value.connecting = true
  tidal.value.authUrl = null
  try {
    const { data } = await baseApi.get('/auth/tidal/login')
    tidal.value.authUrl = data.url
  } catch (e) {
    console.error('Failed to start Tidal auth:', e)
  } finally {
    tidal.value.connecting = false
  }
}

onMounted(checkStatuses)
</script>
