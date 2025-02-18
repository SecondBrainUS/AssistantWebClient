<template>
  <div class="flex items-center gap-4">
    <!-- Input and controls wrapper -->
    <div class="flex-1 relative bg-gray-800 rounded-lg flex items-center">
      <textarea
        v-model="messageText"
        ref="textareaRef"
        rows="1"
        class="flex-grow bg-transparent p-4 pr-20 focus:outline-none resize-none max-h-[144px] overflow-y-auto"
        :placeholder="placeholder"
        @keyup.enter="handleEnter"
        @input="adjustTextareaHeight"
      ></textarea>
      
      <!-- Send/Stop Button -->
      <button 
        @click="isProcessing ? handleStopProcessing() : handleSend()" 
        class="p-2 mr-1 rounded-lg flex items-center justify-center hover:bg-gray-700 text-white"
      >
        <XCircle v-if="isProcessing" class="h-6 w-6 text-red-500" />
        <Send v-else class="h-6 w-6" />
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
import { ref, watch, onMounted } from 'vue'
import { Send, Mic, Square, XCircle } from 'lucide-vue-next'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Send a message'
  },
  initialText: {
    type: String,
    default: ''
  },
  startRecordingOnMount: {
    type: Boolean,
    default: false
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send', 'startRecording', 'stopRecording', 'stopProcessing'])
const textareaRef = ref(null)
const isRecording = ref(false)
const messageText = ref(props.initialText)

// TODO: should remove, no prop mutations
watch(() => props.initialText, (newVal) => {
  messageText.value = newVal
})

onMounted(() => {
  if (props.startRecordingOnMount) {
    startRecording()
  }
  // Initial height adjustment
  adjustTextareaHeight()
})

function adjustTextareaHeight() {
  const textarea = textareaRef.value
  if (!textarea) return
  
  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto'
  
  // Calculate the height of one row (assuming default line-height)
  const lineHeight = 24 // approximate line height in pixels
  const maxHeight = lineHeight * 6 // 6 rows maximum
  
  // Set the height to either the scrollHeight or maxHeight, whichever is smaller
  const newHeight = Math.min(textarea.scrollHeight, maxHeight)
  textarea.style.height = `${newHeight}px`
}

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

function handleStopProcessing() {
  emit('stopProcessing')
}
</script>
