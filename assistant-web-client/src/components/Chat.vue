<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Model selector -->
    <div class="p-4 border-b border-gray-700">
      <ModelSelector
        ref="modelSelector"
        @update:modelValue="handleModelChange"
      />
    </div>
    <!-- Chat messages -->
    <div class="flex-1 p-4 overflow-y-auto" ref="messagesContainer">
      <div v-for="message in messages" 
           :key="message.id" 
           class="mb-4"
      >
        <!-- Function call and result grouping -->
        <div v-if="message.type === 'function_call'" 
             class="border border-gray-600 rounded-lg p-2 mb-4"
        >
          <div class="flex justify-between items-center mb-1">
            <div class="font-semibold">{{ message.role }}</div>
            <div class="text-xs text-gray-400">
              {{ formatTimestamp(message.timestamp) }}
            </div>
          </div>
          <!-- Function call -->
          <div class="p-3 rounded-lg bg-gray-800">
            <div class="font-mono">
              <span style="color: #dcdc90">{{ message.name }}</span>
              <span style="color: #f1d700">(</span>
              <span style="color: #b670d6">
                {
                <span v-for="(value, key) in JSON.parse(message.arguments)" :key="key">
                  <span style="color: #9cdcfe">{{ key }}</span>
                  <span style="color: #9cdcfe">: </span>
                  <span style="color: #ce916a">{{ formatResultValue(value) }}</span>{{ isLastKey(JSON.parse(message.arguments), key) ? '' : ',' }}
                </span>
                }
              </span>
              <span style="color: #f1d700">)</span>
            </div>
          </div>
          <!-- Function result -->
          <div v-if="getFunctionResult(message.call_id)" 
               class="mt-2 p-3 rounded-lg bg-gray-700"
          >
            <div class="flex justify-between items-center mb-1">
              <div class="font-semibold">Result</div>
              <div class="text-xs text-gray-400">
                {{ formatTimestamp(getFunctionResult(message.call_id).timestamp) }}
              </div>
            </div>
            <div class="font-mono">
              <template v-if="typeof getFunctionResult(message.call_id).result === 'object' && getFunctionResult(message.call_id).result !== null">
                <span style="color: #b670d6">{</span>
                <span v-for="(value, key) in getFunctionResult(message.call_id).result" :key="key">
                  <span style="color: #9cdcfe">{{ key }}</span>
                  <span style="color: #9cdcfe">: </span>
                  <span style="color: #ce916a">{{ formatResultValue(value) }}</span>{{ isLastKey(getFunctionResult(message.call_id).result, key) ? '' : ',' }}
                </span>
                <span style="color: #b670d6">}</span>
              </template>
              <template v-else>
                <span style="color: #ce916a">{{ formatResultValue(getFunctionResult(message.call_id).result) }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Regular messages (non-function calls) -->
        <template v-else-if="message.type !== 'function_result'">
          <div class="flex justify-between items-center mb-1">
            <div class="flex items-center gap-2">
              <div class="font-semibold">{{ message.role }}</div>
              <!-- Add source indicator for user messages -->
              <div v-if="message.role === 'user' && message.source" 
                   class="text-xs text-gray-400 italic">
                (other session)
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="text-xs text-gray-400">
                {{ formatTimestamp(message.timestamp) }}
              </div>
              <!-- Message status indicator -->
              <div v-if="message.role === 'user'" class="text-xs">
                <template v-if="messageStatuses.get(message.id) === 'sending'">
                  <span class="text-yellow-500">Sending...</span>
                </template>
                <template v-else-if="messageStatuses.get(message.id) === 'sent'">
                  <span class="text-green-500">✓</span>
                </template>
                <template v-else-if="messageStatuses.get(message.id) === 'error'">
                  <span class="text-red-500">Failed to send</span>
                </template>
              </div>
            </div>
          </div>
          <div :class="[
            'p-3 rounded-lg',
            message.role === 'user' ? 'bg-gray-600' : 
            message.role === 'assistant' ? 'bg-gray-700' :
            message.role === 'system' ? 'bg-gray-800' : 'bg-gray-700'
          ]">
            {{ message.content }}
          </div>
        </template>
      </div>
    </div>

    <!-- Input area -->
    <div class="border-t border-gray-700">
      <div class="max-w-3xl mx-auto p-4">
        <div class="flex items-center gap-4">
          <!-- Socket status indicator -->
          <div class="relative">
            <div 
              class="w-3 h-3 rounded-full cursor-help"
              :class="{
                'bg-green-500': socketStatus === 'connected',
                'bg-yellow-500': socketStatus === 'connecting' || socketStatus === 'reconnecting',
                'bg-red-500': socketStatus === 'disconnected'
              }"
              @mouseenter="showSocketTooltip = true"
              @mouseleave="showSocketTooltip = false"
            ></div>
            <!-- Socket Tooltip -->
            <div 
              v-if="showSocketTooltip"
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50"
            >
              {{ socketStatusMessage }}
            </div>
          </div>

          <!-- Room status indicator -->
          <div class="relative">
            <div 
              class="w-3 h-3 rounded-full cursor-help"
              :class="{
                'bg-green-500': roomStatus === 'connected',
                'bg-yellow-500': roomStatus === 'connecting',
                'bg-red-500': roomStatus === 'error' || roomStatus === 'disconnected'
              }"
              @mouseenter="showRoomTooltip = true"
              @mouseleave="showRoomTooltip = false"
            ></div>
            <!-- Room Tooltip -->
            <div 
              v-if="showRoomTooltip"
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50"
            >
              {{ roomStatusMessage }}
            </div>
          </div>

          <ChatInput 
            :initial-text="pendingMessage"
            @send="handleSend"
            @startRecording="handleStartRecording"
            @stopRecording="handleStopRecording"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import ChatInput from './ChatInput.vue'
import ModelSelector from './ModelSelector.vue'
import baseApi from '../utils/baseApi';

const props = defineProps({
  chatid: {
    type: String,
    required: true
  },
  socketClient: {
    type: Object,
    required: true
  },
  initialMessage: {
    type: String,
    default: null
  }
})

const roomid = ref(null)
const messages = ref([])
const messageStatuses = ref(new Map())

const pendingMessage = ref('')
const currentAssistantMessage = ref(null)

const modelSelector = ref(null)
const selectedModel = ref(null)

const messagesContainer = ref(null)
const socketStatus = ref('disconnected')
const roomStatus = ref('disconnected')
const showSocketTooltip = ref(false)
const showRoomTooltip = ref(false)
const audioContext = ref(null)
const audioQueue = ref([])
const isPlaying = ref(false)
const currentSource = ref(null)
const nextPlayTime = ref(0)
const isProcessing = ref(false)

const emit = defineEmits(['startRecording', 'stopRecording', 'notification'])

// Initialize socket status based on current connection state
socketStatus.value = props.socketClient.isConnected ? 'connected' : 'disconnected'

// Computed properties
const socketStatusMessage = computed(() => {
  switch (socketStatus.value) {
    case 'connected':
      return 'Connected to server'
    case 'connecting':
      return 'Connecting to server...'
    case 'reconnecting':
      return 'Reconnecting to server...'
    case 'disconnected':
      return 'Disconnected from server'
    default:
      return 'Unknown connection status'
  }
})

const roomStatusMessage = computed(() => {
  switch (roomStatus.value) {
    case 'connected':
      return 'Connected to chat room'
    case 'connecting':
      return 'Connecting to chat room...'
    case 'error':
      return 'Chat room connection error'
    case 'disconnected':
      return 'Disconnected from chat room'
    default:
      return 'Unknown room status'
  }
})

async function loadChatMessages() {
  try {
    // Load messages for the selected chat
    const dbMessages = await baseApi.get(`/chat/${props.chatid}/messages`)
    
    messages.value = dbMessages.data.map(msg => ({
      ...msg,
      id: msg.message_id,
      timestamp: new Date(msg.created_timestamp)
    }))
    console.log("Loaded chat messages:", JSON.stringify(messages.value, null, 2))
  } catch (error) {
    console.error('Error loading chat messages:', error)
    emit('notification', {
      type: 'error',
        message: 'Failed to load chat messages',
        id: Date.now()
      })
  }
}

// Socket setup and handlers
async function setupSocketHandlers() {
  // Set up socket status handler
  props.socketClient.onStatusChange((status) => {
    socketStatus.value = status
    
    // If we disconnect, update room status as well
    if (status === 'disconnected') {
      roomStatus.value = 'disconnected'
    }
    
    // If we reconnect, try to rejoin the room
    if (status === 'connected') {
      rejoinChat();
    }
  })

  // Room event handlers
  props.socketClient.onRoomCreated((data) => {
    console.log("Room created:", data)
    roomStatus.value = 'connected'
  })

  props.socketClient.onRoomJoined(roomid.value, (data) => {
    console.log("Joined room:", data)
    roomStatus.value = 'connected'
  })

  props.socketClient.onRoomError(roomid.value, (data) => {
    console.error("Room error:", data)
    roomStatus.value = 'error'
  })

  props.socketClient.onRoomLeft(roomid.value, (data) => {
    console.log("Left room:", data)
    roomStatus.value = 'disconnected'
  })

  // Message handler
  props.socketClient.onRoomMessage(roomid.value, (data) => {
    console.log("[CHAT] [ON ROOM MESSAGE] Data:", data)
    // if (data.room_id != roomid.value) return;
    try {
      handleSocketMessage(data)
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })
}

async function findRoom() {
  // Find or create room for this chat
  let roomid = null;
  try {
    const roomData = await props.socketClient.findChat(props.chatid)
    if (roomData.roomid) {
      console.log("[WORKSPACE] [SELECT CHAT] Room found/created for chat:", roomData)
      roomid = roomData.roomid
    } else {
      // Create room
      const roomData = await props.socketClient.createRoom(props.chatid, selectedModel.value.model_id);
      console.log("[WORKSPACE] [SELECT CHAT] Room created for chat:", roomData)
      roomid = roomData.roomid
    }
    if (!roomid) {
      console.error("[WORKSPACE] [SELECT CHAT] Failed to find/create room for chat:", props.chatid)
      emit('notification', {
        type: 'error',
        message: 'Failed to connect to chat room',
        id: Date.now()
      })
      return;
    }
  } catch (error) {
    console.error("[WORKSPACE] [SELECT CHAT] Error finding/creating room for chat:", error)
    emit('notification', {
      type: 'error',
      message: 'Failed to connect to chat room',
      id: Date.now()
    })
  }

  return roomid;
}

async function joinRoom() {
  if (!roomid.value) {
    console.error("[CHAT] [JOIN ROOM] Room ID not found")
    emit('notification', {
      type: 'error',
      message: 'No room set',
      id: Date.now()
    })
    return;
  }

  try {
		await props.socketClient.joinRoom(roomid.value)
	} catch (error) {
		console.error('Error joining room:', error)
		emit('notification', {
			type: 'error',
			message: 'Failed to join chat room',
			id: Date.now()
		})
	}
}

async function rejoinChat() {
  try {
    roomStatus.value = 'connecting'
    const roomData = await props.socketClient.findChat(props.chatid)
    if (roomData.room_id) {
      await props.socketClient.joinRoom(roomData.room_id)
    } else {
      const newRoomData = await props.socketClient.createRoom(props.chatid, selectedModel.value.model_id)
      await props.socketClient.joinRoom(newRoomData.room_id)
    }
  } catch (error) {
    console.error('Error setting up chat room:', error)
    roomStatus.value = 'error'
  }
}

async function handleSocketMessage(eventData) {
  console.log("[CHAT] [HANDLE SOCKET MESSAGE] Event data:", eventData)
  switch (eventData.type) {
    case 'user.message':
      handleUserMessage(eventData)
      break
    case 'conversation.item.input_audio_transcription.completed':
      handleTranscriptionComplete(eventData)
      break
    case 'response.text.delta':
      handleTextDelta(eventData)
      break
    case 'response.audio.delta':
      handleAudioDelta(eventData)
      break
    case 'response.audio_transcript.delta':
      handleAudioTranscriptDelta(eventData)
      break
    case 'response.sb.function_result.done':
      handleFunctionResultDone(eventData)
      break
    case 'response.audio_transcript.done':
    case 'response.done':
      handleResponseDone(eventData)
      break
  }

  await nextTick()
  scrollToBottom()
}

function handleFunctionResultDone(eventData) {
  console.log("[CHAT] [HANDLE FUNCTION RESULT DONE] Event data:", eventData)
  
  // Add function result message
  messages.value.push({
    id: eventData.response.message_id,
    type: 'function_result',
    role: 'system',
    name: eventData.response.name,
    call_id: eventData.response.call_id,
    result: eventData.response.result,
    timestamp: new Date(eventData.response.created_timestamp)
  })
}

function handleTranscriptionComplete(eventData) {
  const transcriptMessage = {
    id: eventData.item_id,
    role: 'user',
    content: eventData.transcript,
    timestamp: new Date()
  }
  messages.value.push(transcriptMessage)
  messageStatuses.value.set(eventData.item_id, 'sent')
}

function handleTextDelta(eventData) {
  console.log("[CHAT] [HANDLE TEXT DELTA] Event data:", eventData)
  if (!currentAssistantMessage.value) {
    console.log("[CHAT] [HANDLE TEXT DELTA] Creating new assistant message")
    currentAssistantMessage.value = {
      id: Date.now().toString(),
      role: 'assistant',
      content: eventData.delta,
      timestamp: new Date()
    }
    messages.value.push(currentAssistantMessage.value)
  } else {
    console.log("[CHAT] [HANDLE TEXT DELTA] Appending to existing assistant message")
    currentAssistantMessage.value.content += eventData.delta
  }
}

function handleAudioDelta(eventData) {
  playAudioBuffer(eventData.delta)
}

function handleAudioTranscriptDelta(eventData) {
  if (!currentAssistantMessage.value) {
    currentAssistantMessage.value = {
      id: Date.now().toString(),
      role: 'assistant',
      content: eventData.delta,
      timestamp: new Date()
    }
    messages.value.push(currentAssistantMessage.value)
  } else {
    currentAssistantMessage.value.content += eventData.delta
  }
}

function handleResponseDone(eventData) {
  if (!eventData.response?.output?.[0]) {
    currentAssistantMessage.value = null
    return
  }

  const output = eventData.response.output[0]
  
  if (output.type === 'function_call') {
    // Add function call message
    messages.value.push({
      id: output.id,
      type: 'function_call',
      role: 'assistant',
      name: output.name,
      call_id: output.call_id,
      arguments: output.arguments,
      timestamp: new Date(eventData.timestamp)
    })
  } else if (output.type === 'message' && output.status === 'completed') {
    // Clear current assistant message when message is complete
    currentAssistantMessage.value = null
  }
}

// Audio handling functions
function processAudioQueue() {
  if (!isPlaying.value && audioQueue.value.length > 0) {
    isPlaying.value = true
    
    const playNextChunk = () => {
      if (audioQueue.value.length === 0) {
        isPlaying.value = false
        return
      }

      try {
        const base64Audio = audioQueue.value.shift()
        const audioBuffer = decodeAudioChunk(base64Audio)
        playAudioChunk(audioBuffer)
      } catch (error) {
        console.error('Error processing audio chunk:', error)
        playNextChunk()
      }
    }

    playNextChunk()
  }
}

function decodeAudioChunk(base64Audio) {
  const binaryString = atob(base64Audio)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const inputSamples = Math.floor(bytes.length / 2)
  const outputSamples = Math.floor(inputSamples * 48000 / 24000)
  const audioBuffer = audioContext.value.createBuffer(1, outputSamples, 48000)
  const channelData = audioBuffer.getChannelData(0)

  const dataView = new DataView(bytes.buffer)
  for (let i = 0; i < outputSamples; i++) {
    const inputPos = i * 24000 / 48000
    const inputIndex = Math.floor(inputPos)
    const fraction = inputPos - inputIndex

    const pcm16A = dataView.getInt16(inputIndex * 2, true)
    const pcm16B = inputIndex < inputSamples - 1 ? 
                  dataView.getInt16((inputIndex + 1) * 2, true) : 
                  pcm16A

    const sampleA = pcm16A / 32768.0
    const sampleB = pcm16B / 32768.0
    channelData[i] = Math.max(-1, Math.min(1, 
      sampleA + fraction * (sampleB - sampleA)
    ))
  }

  return audioBuffer
}

function playAudioChunk(audioBuffer) {
  const duration = audioBuffer.length / 48000
  if (nextPlayTime.value < audioContext.value.currentTime) {
    nextPlayTime.value = audioContext.value.currentTime
  }

  const source = audioContext.value.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.value.destination)
  source.start(nextPlayTime.value)
  currentSource.value = source

  nextPlayTime.value += duration
  source.onended = () => {
    currentSource.value = null
    processAudioQueue()
  }
}

function playAudioBuffer(base64Audio) {
  try {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    }

    audioQueue.value.push(base64Audio)
    processAudioQueue()
  } catch (error) {
    console.error('Error queueing audio:', error)
  }
}

function handleUserMessage(eventData) {
  console.log("[CHAT] [HANDLE USER MESSAGE] Event data:", eventData)
  
  // Extract the message content
  const messageContent = eventData.message.data.item.content[0].text
  const messageId = eventData.message.data.item.id

  // If this message isn't in our messageStatuses, it came from another session
  const source = !messageStatuses.value.has(messageId) ? 'other-session' : null

  const message = {
    id: messageId,
    role: 'user',
    content: messageContent,
    timestamp: new Date(),
    source
  }

  messages.value.push(message)
}

// Message handling
async function handleSend(message) {
  if (socketStatus.value !== 'connected' || roomStatus.value !== 'connected') {
    console.error('Socket or room not connected')
    emit('notification', {
      type: 'error',
      message: 'Cannot send message: Connection to server not available',
      id: Date.now()
    })
    return
  }

  const localMessageId = Date.now().toString()
  try {
    messageStatuses.value.set(localMessageId, 'sending')
    
    const newMessage = {
      id: localMessageId,
      role: 'user',
      content: message,
      timestamp: new Date()
    }
    messages.value.push(newMessage)

    const item = {
      id: localMessageId,
      type: 'message',
      role: 'user',
      content: [{
        type: 'input_text',
        text: message
      }]
    }

    const messageData = {
        type: "conversation.item.create",
        data: { item }
      }

    await props.socketClient.sendMessage(roomid.value, messageData, selectedModel.value.model_id)

    messageStatuses.value.set(localMessageId, 'sent')

    await props.socketClient.sendMessage(roomid.value, {
      type: 'response.create',
      data: {
        response: {
          modalities: ['text', 'audio'],
          temperature: 0.7,
          max_output_tokens: 1500,
        }
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
    messageStatuses.value.set(localMessageId, 'error')
  }
}

function handleModelChange(model) {
  selectedModel.value = model
  console.log("Selected model:", selectedModel.value)
}

async function loadChat() {
  try {
    const chatData = await baseApi.get(`/chat/${props.chatid}`)
    console.log("Chat data:", chatData)
    if (!chatData.data) {
      console.error("Chat data not found")
      return;
    }
    if (!chatData.data.current_model_id) {
      console.error("Current model ID not found")
      return;
    }
    // Wait for next tick to ensure ModelSelector is mounted
    await nextTick()
    if (!modelSelector.value) {
      console.error("ModelSelector not found")
      return;
    }
    const success = modelSelector.value.selectModelById(chatData.data.current_model_id)
    if (!success) {
      console.error('Failed to select model:', chatData.data.current_model_id)
      emit('notification', {
        type: 'error',
        message: 'Failed to select chat model',
        id: Date.now()
      })
    }
  } catch (error) {
    console.error('Error loading chat:', error)
    emit('notification', {
      type: 'error',
      message: 'Failed to load chat',
      id: Date.now()
    })
  }
}

// Lifecycle hooks
onMounted(async () => {
  // Add debug logging
  console.log("Chat mounted. Initial message:", props.initialMessage)
  
  // If socket isn't connected, connect it
  if (!props.socketClient.isConnected) {
    try {
      await props.socketClient.connect()
    } catch (error) {
      console.error('Failed to connect socket:', error)
      socketStatus.value = 'disconnected'
      return
    }
  }
 
  await loadChat();
  await loadChatMessages();
  const newRoomId = await findRoom();
  roomid.value = newRoomId;
  await setupSocketHandlers();
  await joinRoom();
  await nextTick();
  
  // Send initial message if provided
  if (props.initialMessage) {
    console.log("Sending initial message:", props.initialMessage)
    await handleSend(props.initialMessage);
  }
  
  scrollToBottom();
})

onUnmounted(() => {
  // Cleanup socket handlers
  if (props.socketClient) {
    props.socketClient.onStatusChange(null)
    props.socketClient.onRoomMessage(null,null)
    props.socketClient.onRoomCreated(null)
    props.socketClient.onRoomJoined(roomid.value, null)
    props.socketClient.onRoomError(null)
    props.socketClient.onRoomLeft(null)
  }

  if (currentSource.value) {
    currentSource.value.stop()
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
})

// Scroll handling
watch(() => props.messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Recording handlers
function handleStartRecording() {
  emit('startRecording')
}

function handleStopRecording() {
  emit('stopRecording')
}

function getFunctionResult(callId) {
  return messages.value.find(m => 
    m.type === 'function_result' && 
    m.call_id === callId
  )
}

function formatResultValue(value) {
  if (typeof value === 'string') {
    return `"${value}"`
  }
  if (Array.isArray(value)) {
    return `[${value.map(v => JSON.stringify(v)).join(', ')}]`
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return value
}

function isLastKey(obj, key) {
  return Object.keys(obj).pop() === key
}

</script>