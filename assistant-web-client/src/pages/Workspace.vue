<template>
  <div class="h-full bg-gray-700 text-gray-100 flex">
    <!-- Sidebar -->
    <div 
      :class="[
        'bg-gray-800 p-4 flex flex-col border-r border-gray-700 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Top section -->
      <div class="flex items-center justify-between mb-4">
        <button @click="toggleSidebar" class="p-2 hover:bg-gray-700 rounded">
          <Menu class="h-5 w-5" />
        </button>
        <div class="flex items-center space-x-2" v-if="isSidebarOpen">
          <button @click="toggleSearch" class="p-2 hover:bg-gray-700 rounded">
            <Search class="h-5 w-5" />
          </button>
          <button @click="createNewChat" class="p-2 hover:bg-gray-700 rounded">
            <PenSquare class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Search bar -->
      <div v-if="isSearchOpen && isSidebarOpen" class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search chats..."
          class="w-full bg-gray-700 text-white placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
          @input="filterChats"
        />
      </div>

      <!-- Chat selector -->
      <div v-if="isSidebarOpen" class="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded mb-4 cursor-pointer">
        <!--MessageSquare class="h-5 w-5" / -->
      </div>

      <!-- Navigation sections -->
      <div class="flex-1 overflow-y-auto space-y-4">
        <div v-for="(section, index) in filteredChatSections" :key="index">
          <div v-if="isSidebarOpen" class="text-xs text-gray-500 px-2 py-1">{{ section.title }}</div>
          <div class="space-y-1">
            <div
              v-for="chat in section.chats"
              :key="chat.id"
              @click="selectChat(chat.id)"
              class="px-2 py-1 hover:bg-gray-700 rounded cursor-pointer flex items-center"
              :class="{ 'bg-gray-700': selectedChatId === chat.id }"
            >
              <MessageSquare v-if="!isSidebarOpen" class="h-5 w-5" />
              <span v-else>{{ chat.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Model selector -->
      <div class="p-4 border-b border-gray-700">
        <div class="relative max-w-xs ml-auto">
          <button 
            @click="isModelSelectorOpen = !isModelSelectorOpen"
            class="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <span class="text-sm">{{ selectedModel.name }}</span>
            </div>
            <ChevronDown class="h-4 w-4" :class="{ 'transform rotate-180': isModelSelectorOpen }" />
          </button>

          <!-- Dropdown menu -->
          <div v-if="isModelSelectorOpen" class="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg z-50">
            <div class="p-2 space-y-1">
              <div v-for="model in models" :key="model.id" class="p-2">
                <button 
                  @click="selectModel(model)"
                  class="w-full text-left hover:bg-gray-700 p-2 rounded-lg"
                >
                  <div class="text-sm font-medium">{{ model.name }}</div>
                  <div class="text-xs text-gray-400">{{ model.description }}</div>
                </button>
              </div>
              
              <!-- Toggles -->
              <div class="border-t border-gray-700 mt-2 pt-2 space-y-2">
                <div v-for="toggle in toggles" :key="toggle.id" 
                  class="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg"
                >
                  <span class="text-sm">{{ toggle.name }}</span>
                  <button 
                    @click="toggle.enabled = !toggle.enabled"
                    class="w-10 h-5 relative rounded-full transition-colors duration-200 ease-in-out"
                    :class="[toggle.enabled ? 'bg-green-500' : 'bg-gray-600']"
                  >
                    <span 
                      class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out"
                      :class="[toggle.enabled ? 'transform translate-x-5' : '']"
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat area -->
      <div class="flex-1 p-4 overflow-y-auto">
        <div v-if="selectedChat">
          <div v-for="message in selectedChat.messages" 
               :key="message.id" 
               class="mb-4"
          >
            <div class="flex justify-between items-center mb-1">
              <div class="font-semibold">{{ message.role }}</div>
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
              message.role === 'user' ? 'bg-gray-600' : 'bg-gray-700'
            ]">{{ message.content }}</div>
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center">
          <div class="text-3xl font-semibold text-gray-300">Start a new chat!</div>
        </div>
      </div>

      <!-- Input area -->
      <div class="p-4 border-t border-gray-700">
        <div class="max-w-3xl mx-auto">
          <div class="relative bg-gray-800 rounded-lg">
            <textarea
              v-model="newMessage"
              rows="1"
              class="w-full bg-transparent p-4 pr-20 focus:outline-none resize-none"
              placeholder="Send a message "
              @keyup.enter="sendMessage"
            ></textarea>
            <button @click="sendMessage" class="absolute right-2 bottom-2 p-2 hover:bg-gray-700 rounded">
              <Send class="h-5 w-5" />
            </button>
            <button 
              @click="isRecording ? stopRecording() : startRecording()"
              class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              {{ isRecording ? 'Stop Recording' : 'Start Recording' }}
            </button>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center justify-center space-x-4 mt-4 text-gray-400">
            <button class="flex items-center space-x-2 hover:text-gray-200">
              <Image class="h-5 w-5" />
              <span class="text-sm">Create image</span>
            </button>
            <button class="flex items-center space-x-2 hover:text-gray-200">
              <PenLine class="h-5 w-5" />
              <span class="text-sm">Help me write</span>
            </button>
            <button class="flex items-center space-x-2 hover:text-gray-200">
              <HelpCircle class="h-5 w-5" />
              <span class="text-sm">Get advice</span>
            </button>
            <button class="flex items-center space-x-2 hover:text-gray-200">
              <FileText class="h-5 w-5" />
              <span class="text-sm">Summarize text</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. Imports
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  Menu, Search, PenSquare, MessageSquare, ChevronDown,
  Send, Image, PenLine, HelpCircle, FileText
} from 'lucide-vue-next'
import SocketClient from '../utils/socketClient'

// 2. State Management
const socketClient = ref(null)
const roomName = ref('user123-workspace-13212')
const selectedChatId = ref(null)
const newMessage = ref('')
const isSidebarOpen = ref(true)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const isModelSelectorOpen = ref(false)
const websocket = ref(null)
const messageStatuses = ref(new Map())
const currentAssistantMessage = ref(null)
const audioContext = ref(null)
const audioQueue = ref([])
const isPlaying = ref(false)
const currentSource = ref(null)
const nextPlayTime = ref(0)
const mediaRecorder = ref(null);
const isRecording = ref(false);
const audioProcessor = ref(null);
const micStream = ref(null);
const isProcessing = ref(false);

// 3. Data Definitions
const models = ref([
  {
    id: 1,
    name: 'GPT-4',
    description: 'Most capable model for complex tasks'
  },
  {
    id: 2,
    name: 'GPT-4 Turbo',
    description: 'Faster version with latest knowledge'
  },
  {
    id: 3,
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks'
  },
  {
    id: 4,
    name: 'Claude 2',
    description: 'Advanced reasoning and analysis'
  },
  {
    id: 5,
    name: 'Claude Instant',
    description: 'Quick responses for simple tasks'
  }
])

const selectedModel = ref(models.value[0])

const toggles = ref([
  {
    id: 1,
    name: 'Temporary chat',
    enabled: false
  },
  {
    id: 2,
    name: 'Web browsing',
    enabled: false
  },
  {
    id: 3,
    name: 'Code interpreter',
    enabled: false
  }
])

const chatSections = ref([
  {
    chats: [
      { 
        id: 1, 
        title: 'Vite Vue.js Setup', 
        timestamp: new Date(), 
        messages: [
          { 
            role: 'user', 
            content: 'How do I set up a new Vite Vue.js project?',
            timestamp: new Date()
          },
          { 
            role: 'system', 
            content: 'To set up a new Vite Vue.js project, follow these steps:\n1. Open your terminal\n2. Run: npm create vite@latest my-vue-app -- --template vue\n3. cd into your new project directory\n4. Run: npm install\n5. Start the dev server with: npm run dev',
            timestamp: new Date()
          }
        ]
      }
    ]
  }
])

// 4. Computed Properties
const organizedChatSections = computed(() => {
  const allChats = chatSections.value.flatMap(section => section.chats)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const sections = [
    {
      title: 'Today',
      chats: allChats.filter(chat => chat.timestamp >= today)
    },
    {
      title: 'Yesterday',
      chats: allChats.filter(chat => chat.timestamp >= yesterday && chat.timestamp < today)
    },
    {
      title: 'Previous 7 Days',
      chats: allChats.filter(chat => chat.timestamp >= weekAgo && chat.timestamp < yesterday)
    }
  ]

  return sections.filter(section => section.chats.length > 0)
})

const filteredChatSections = computed(() => {
  if (!searchQuery.value) return organizedChatSections.value

  return organizedChatSections.value.map(section => ({
    ...section,
    chats: section.chats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })).filter(section => section.chats.length > 0)
})

const selectedChat = computed(() => {
  return chatSections.value
    .flatMap(section => section.chats)
    .find(chat => chat.id === selectedChatId.value)
})

// 5. Authentication Functions
async function getAuthToken() {
  try {
    const response = await fetch('http://localhost:8000/api/v1/local/live/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'demo_user', // Replace with actual user credentials
        password: 'demo_pass'
      })
    });
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// 6. WebSocket Functions
async function initializeWebSocket() {
  console.log("Starting WebSocket initialization")
  try {
    const token = await getAuthToken()
    if (!token) {
      console.error('Failed to get authentication token')
      return
    }

    socketClient.value = new SocketClient('http://localhost:8000', {
      auth: { 
        token,
        user_id: 'testtest'
      },
      namespace: '/assistant/realtime',
      autoConnect: false,
      timeout: 10000,
    })

    await socketClient.value.connect()

    // Handle incoming messages
    socketClient.value.onMessage((data) => {
      console.log("Received message:", data)
      if (selectedChat.value && data.room_id === selectedChat.value.id) {
        try {
          const eventData = JSON.parse(data.message)
          
          switch (eventData.type) {
            case 'response.audio.delta':
              // Handle incoming audio chunk
              playAudioBuffer(eventData.delta)
              break

            case 'response.audio_transcript.delta':
              // If this is the first chunk of the response, create a new message
              if (!currentAssistantMessage.value) {
                currentAssistantMessage.value = {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: eventData.delta,
                  timestamp: new Date()
                }
                selectedChat.value.messages.push(currentAssistantMessage.value)
              } else {
                // Append to existing message
                currentAssistantMessage.value.content += eventData.delta
              }
              break

            case 'response.audio_transcript.done':
              // Finalize the message
              if (currentAssistantMessage.value) {
                currentAssistantMessage.value = null // Reset for next message
              }
              break

            case 'response.done':
              // Reset everything for the next interaction
              currentAssistantMessage.value = null
              break
          }

          // Scroll to bottom on new content
          nextTick(() => {
            const chatArea = document.querySelector('.flex-1.p-4.overflow-y-auto')
            if (chatArea) chatArea.scrollTop = chatArea.scrollHeight
          })
        } catch (error) {
          console.error('Error processing message:', error)
        }
      }
    })

    // Handle room events
    socketClient.value.onRoomCreated((data) => {
      console.log("Room created:", data)
    })

    socketClient.value.onRoomJoined((data) => {
      console.log("Joined room:", data)
    })

    socketClient.value.onRoomError((data) => {
      console.error("Room error:", data)
      // TODO: Show error notification to user
    })

  } catch (error) {
    console.error("Failed to initialize WebSocket:", error)
  }
}

// 7. UI Event Handlers
function selectChat(chatId) {
  selectedChatId.value = chatId
}

async function sendMessage() {
  if (!newMessage.value.trim() || !selectedChat.value) return

  const messageId = Date.now().toString()
  const now = new Date()
  const messageContent = newMessage.value.trim()
  
  try {
    // Add message to UI immediately with pending status
    messageStatuses.value.set(messageId, 'sending')
    selectedChat.value.messages.push({
      id: messageId,
      role: 'user',
      content: messageContent,
      timestamp: now
    })
    
    newMessage.value = ''
    await nextTick()
    const chatArea = document.querySelector('.flex-1.p-4.overflow-y-auto')
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight

    // Send message in OpenAI format
    await socketClient.value?.sendMessage(selectedChat.value.id, {
      type: 'conversation.item.create',
      data: {
        item: {
          id: messageId,
          type: 'message',
          role: 'user',
          content: [{
            type: 'input_text',
            text: messageContent
          }]
        }
      }
    })

    // Request AI response
    await socketClient.value?.sendMessage(selectedChat.value.id, {
      type: 'response.create',
      data: {
        response: {
          modalities: ['text', 'audio'],
          temperature: 0.7,
          max_output_tokens: 1500,
        }
      }
    })
    
    messageStatuses.value.set(messageId, 'sent')
  } catch (error) {
    console.error("Error sending message:", error)
    messageStatuses.value.set(messageId, 'error')
  }
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
  if (!isSidebarOpen.value) {
    isSearchOpen.value = false
  }
}

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
}

function filterChats() {
  // Filtering is handled by computed property
}

async function createNewChat() {
  const newChatId = Date.now().toString()
  const now = new Date()
  
  try {
    // Create the chat in UI first
    chatSections.value[0].chats.unshift({
      id: newChatId,
      title: 'New Chat',
      timestamp: now,
      messages: []
    })
    selectChat(newChatId)

    // Create room in socket server
    if (socketClient.value) {
      console.log("Creating room for new chat:", newChatId)
      // Wait for room creation confirmation before joining
      await socketClient.value.createRoom(newChatId)
      console.log("Room creation confirmed")
      await socketClient.value.joinRoom(newChatId)
      console.log("Room joined successfully")
    }
  } catch (error) {
    console.error("Failed to create chat room:", error)
    // Remove the chat if room creation failed
    chatSections.value[0].chats = chatSections.value[0].chats.filter(
      chat => chat.id !== newChatId
    )
    // TODO: Show error notification to user
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function selectModel(model) {
  selectedModel.value = model
  isModelSelectorOpen.value = false
}

// 8. Lifecycle Hooks
onMounted(() => {
  // Click outside handler
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.relative')
    if (dropdown && !dropdown.contains(e.target)) {
      isModelSelectorOpen.value = false
    }
  })
  
  initializeWebSocket()
})

onUnmounted(() => {
  if (socketClient.value) {
    socketClient.value.disconnect()
  }
  if (currentSource.value) {
    currentSource.value.stop();
  }
  if (audioContext.value) {
    audioContext.value.close();
  }
})

// Add this method to handle audio playback
function processAudioQueue() {
  if (!isPlaying.value && audioQueue.value.length > 0) {
    isPlaying.value = true;
    
    const playNextChunk = () => {
      if (audioQueue.value.length === 0) {
        isPlaying.value = false;
        return;
      }

      try {
        const base64Audio = audioQueue.value.shift();
        
        // Decode base64 to binary data
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const inputSamples = Math.floor(bytes.length / 2);
        const outputSamples = Math.floor(inputSamples * 48000 / 24000);
        const audioBuffer = audioContext.value.createBuffer(1, outputSamples, 48000);
        const channelData = audioBuffer.getChannelData(0);

        // Convert PCM16 to float32 with linear interpolation
        const dataView = new DataView(bytes.buffer);
        for (let i = 0; i < outputSamples; i++) {
          const inputPos = i * 24000 / 48000;
          const inputIndex = Math.floor(inputPos);
          const fraction = inputPos - inputIndex;

          const pcm16A = dataView.getInt16(inputIndex * 2, true);
          const pcm16B = inputIndex < inputSamples - 1 ? 
                        dataView.getInt16((inputIndex + 1) * 2, true) : 
                        pcm16A;

          const sampleA = pcm16A / 32768.0;
          const sampleB = pcm16B / 32768.0;
          channelData[i] = Math.max(-1, Math.min(1, 
            sampleA + fraction * (sampleB - sampleA)
          ));
        }

        // Calculate precise timing
        const duration = outputSamples / 48000; // Duration in seconds
        if (nextPlayTime.value < audioContext.value.currentTime) {
          nextPlayTime.value = audioContext.value.currentTime;
        }

        // Create and schedule the source
        const source = audioContext.value.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.value.destination);
        source.start(nextPlayTime.value);
        currentSource.value = source;

        // Schedule next chunk
        nextPlayTime.value += duration;
        source.onended = () => {
          currentSource.value = null;
          playNextChunk();
        };

      } catch (error) {
        console.error('Error processing audio chunk:', error);
        playNextChunk(); // Skip problematic chunk
      }
    };

    playNextChunk();
  }
}

function playAudioBuffer(base64Audio) {
  try {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Add to queue and process
    audioQueue.value.push(base64Audio);
    processAudioQueue();

  } catch (error) {
    console.error('Error queueing audio:', error);
  }
}

// Add these methods for microphone handling
async function startRecording() {
  try {
    if (isProcessing.value) {
      console.log('Already processing a request, please wait...');
      return;
    }

    // Clear any existing audio buffer before starting
    await socketClient.value?.sendMessage(selectedChat.value.id, {
      type: 'input_audio_buffer.clear'
    });

    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000  // Match OpenAI's expected sample rate
      });
    }

    // Get microphone access with specific constraints
    micStream.value = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,          // Mono audio
        sampleRate: 24000,        // Match OpenAI's sample rate
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    // Create audio processing pipeline
    const source = audioContext.value.createMediaStreamSource(micStream.value);
    audioProcessor.value = audioContext.value.createScriptProcessor(4096, 1, 1);
    
    audioProcessor.value.onaudioprocess = async (e) => {
      try {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Skip silent audio
        const isAudible = inputData.some(sample => Math.abs(sample) > 0.01);
        if (!isAudible) {
          console.log('Skipping silent audio chunk');
          return;
        }

        // Convert Float32Array to base64 PCM16 using proper encoding
        const base64Audio = floatTo16BitPCMBase64(inputData);
        
        // Send properly structured message
        if (socketClient.value && selectedChat.value?.id) {
          const message = {
            type: 'input_audio_buffer.append',
            event_id: `event_${Date.now()}`,
            audio: base64Audio
          };
          
          await socketClient.value.sendMessage(selectedChat.value.id, message);
        }
      } catch (error) {
        console.error('Error processing audio chunk:', error);
      }
    };

    // Connect the audio nodes
    source.connect(audioProcessor.value);
    audioProcessor.value.connect(audioContext.value.destination);
    
    isRecording.value = true;

  } catch (error) {
    console.error('Error starting recording:', error);
  }
}

// Helper function to convert Float32Array to base64 PCM16
function floatTo16BitPCMBase64(float32Array) {
  // First convert to PCM16
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  
  // Then convert to base64 in chunks
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, chunk);
  }
  
  return btoa(binary);
}

async function stopRecording() {
  console.log('Stop recording called');
  try {
    if (!isRecording.value) {
      console.log('Not recording, returning early');
      return;
    }
    
    isProcessing.value = true;
    console.log('Setting processing state');

    // Stop recording
    if (audioProcessor.value) {
      console.log('Disconnecting audio processor');
      audioProcessor.value.disconnect();
      audioProcessor.value = null;
    }

    if (micStream.value) {
      console.log('Stopping mic stream');
      micStream.value.getTracks().forEach(track => track.stop());
      micStream.value = null;
    }

    // Send final messages in correct sequence
    if (socketClient.value?.isConnected && selectedChat.value?.id) {
      console.log('Socket state:', {
        connected: socketClient.value.isConnected,
        socketExists: !!socketClient.value,
        chatId: selectedChat.value?.id
      });
      
      console.log('Sending commit message');
      // First commit the audio buffer
      await socketClient.value.sendMessage(selectedChat.value.id, {
        type: 'input_audio_buffer.commit',
        event_id: `event_${Date.now()}`
      });

      console.log('Sending response.create message');
      // Then request a response
      await socketClient.value.sendMessage(selectedChat.value.id, {
        type: 'response.create',
        event_id: `event_${Date.now()}`,
        data: {
          response: {
            modalities: ['text', 'audio'],
            temperature: 0.7,
            max_output_tokens: 1500
          }
        }
      });
    } else {
      console.error('Socket not connected or chat not selected', {
        connected: socketClient.value?.isConnected,
        chatId: selectedChat.value?.id,
        socketExists: !!socketClient.value
      });
    }

  } catch (error) {
    console.error('Error stopping recording:', error);
  } finally {
    console.log('Cleaning up recording state');
    isRecording.value = false;
    isProcessing.value = false;
  }
}
</script>

<style>
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Ensure the parent container fills the available height */
html, body, #app {
  height: 100%;
  margin: 0;
}
</style>

