<template>
  <div class="h-full flex flex-col">
    <!-- Model selector -->
    <div class="p-4 border-b border-gray-700">
      <ModelSelector
        v-model="selectedModel"
      />
    </div>
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
import ModelSelector from './ModelSelector.vue'
import baseApi from '../utils/baseApi';

const emit = defineEmits(['createChat', 'startRecording'])

function handleNewChat(message) {
  // API call to create a new chat

  emit('createChat', { initialMessage: message })
}

function handleStartRecording() {
  emit('createChat', { startRecording: true })
}

async function createNewChat() {
  // Need model
  const newChat = await baseApi.post('/chat', { })
}
</script>
