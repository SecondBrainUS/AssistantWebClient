<template>
  <div class="flex items-center gap-4">
    <!-- Input and controls wrapper -->
    <div class="flex-1 relative bg-gray-800 rounded-lg flex items-center">
      <textarea
        v-model="messageText"
        rows="1"
        class="flex-grow bg-transparent p-4 pr-20 focus:outline-none resize-none"
        :placeholder="placeholder"
        @keyup.enter="handleEnter"
      ></textarea>
      
      <!-- Send Button -->
      <button 
        @click="handleSend" 
        class="p-2 mr-1 rounded-lg flex items-center justify-center hover:bg-gray-700 text-white"
      >
        <Send class="h-6 w-6" />
      </button>
      
      <!-- Record Button -->
      <button 
        @click="isRecording ? stopRecording() : startRecording()" 
        class="p-2 mr-2 rounded-lg flex items-center justify-center hover:bg-gray-700 text-white"
      >
        <template v-if="isRecording">
          <Square class="h-6 w-6 text-red-500" />
        </template>
        <template v-else>
          <Mic class="h-6 w-6 text-white" />
        </template>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Send, Mic, Square } from 'lucide-vue-next'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Send a message'
  },
  initialText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['send', 'startRecording', 'stopRecording'])

const messageText = ref(props.initialText)
const isRecording = ref(false)

watch(() => props.initialText, (newVal) => {
  messageText.value = newVal
})

function handleSend() {
  if (!messageText.value.trim()) return
  emit('send', messageText.value)
  messageText.value = ''
}

function handleEnter(e) {
  if (e.shiftKey) return
  e.preventDefault()
  handleSend()
}

function startRecording() {
  isRecording.value = true
  emit('startRecording')
}

function stopRecording() {
  isRecording.value = false
  emit('stopRecording')
}
</script>
