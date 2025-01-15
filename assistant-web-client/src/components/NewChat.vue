<template>
  <div class="h-full flex flex-col">
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-4">
        <h1 class="text-3xl font-semibold text-gray-300">Start a New Chat</h1>
      </div>
    </div>
    
    <div class="p-4">
      <div class="max-w-3xl mx-auto">
        <ChatInput 
          placeholder="Type to start a new chat..."
          @send="handleNewChat"
          @startRecording="handleStartRecording"
          @stopRecording="handleStopRecording"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import ChatInput from './ChatInput.vue'

const emit = defineEmits(['createChat', 'startRecording'])

function handleNewChat(message) {
  emit('createChat', { initialMessage: message })
}

function handleStartRecording() {
  emit('startRecording')
}

function handleStopRecording() {
  // This will be handled by the parent since it needs to create
  // a new chat and transition to it
  emit('createChat', { isVoiceChat: true })
}
</script>
