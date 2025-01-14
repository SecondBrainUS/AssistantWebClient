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
              class="px-2 py-1 hover:bg-gray-700 rounded cursor-pointer flex items-center justify-between group"
              :class="{ 'bg-gray-700': selectedChatId === chat.id }"
            >
              <div class="flex items-center">
                <MessageSquare v-if="!isSidebarOpen" class="h-5 w-5" />
                <span v-else>{{ chat.title }}</span>
              </div>
              <!-- Add delete button -->
              <button 
                v-if="isSidebarOpen"
                @click.stop="confirmDeleteChat(chat.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded"
              >
                <component 
                  :is="deleteHoverStates[chat.id] ? Trash2 : TrashIcon"
                  class="h-4 w-4 transition-colors"
                  :class="deleteHoverStates[chat.id] ? 'text-red-500' : 'text-gray-400'"
                  @mouseenter="deleteHoverStates[chat.id] = true"
                  @mouseleave="deleteHoverStates[chat.id] = false"
                />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Loading indicator -->
        <div v-if="isLoadingChats" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Model selector -->
      <div class="p-4 border-b border-gray-700">
        <div class="relative max-w-xs ml-auto flex items-center gap-4">
          <!-- Connection status indicator -->
          <div class="relative">
            <div 
              class="w-3 h-3 rounded-full cursor-help"
              :class="{
                'bg-green-500': socketStatus === 'connected',
                'bg-yellow-500': socketStatus === 'connecting' || socketStatus === 'reconnecting',
                'bg-red-500': socketStatus === 'disconnected'
              }"
              @mouseenter="showStatusTooltip = true"
              @mouseleave="showStatusTooltip = false"
            ></div>
            <!-- Tooltip -->
            <div 
              v-if="showStatusTooltip"
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50"
            >
              {{ socketStatusMessage }}
            </div>
          </div>

          <!-- Existing model selector button -->
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
          <div v-if="isModelSelectorOpen" class="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg z-50 top-full">
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
              message.role === 'user' ? 'bg-gray-600' : 
              message.role === 'assistant' ? 'bg-gray-700' :
              message.role === 'system' ? 'bg-gray-800' : 'bg-gray-700'
            ]">
              <!-- System function call message -->
              <template v-if="message.role === 'system' && message.type === 'function_call'">
                <div class="font-mono">
                  <span class="text-blue-400">{{ message.name }}</span>
                  <span class="text-gray-400">(</span>
                  <span class="text-green-400">
                    {
                    <template v-for="(value, key) in JSON.parse(message.arguments)" :key="key">
                      <span class="text-yellow-400">{{ key }}</span>
                      <span class="text-gray-400">: </span>
                      <span class="text-green-400">{{ 
                        typeof value === 'object' ? 
                          JSON.stringify(value) : 
                          JSON.stringify(value) 
                      }}</span>,
                    </template>
                    }
                  </span>
                  <span class="text-gray-400">)</span>
                </div>
              </template>
              <!-- Regular message content -->
              <template v-else>
                {{ message.content }}
              </template>
            </div>
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center">
          <div class="text-3xl font-semibold text-gray-300">{{ startingMessage}}</div>
        </div>
      </div>

      <!-- Input area -->
      <div class="p-4 border-t border-gray-700">
        <div class="max-w-3xl mx-auto">
          <div class="flex items-center gap-4">
            <!-- Input and controls wrapper -->
            <div class="flex-1 relative bg-gray-800 rounded-lg flex items-center">
              <textarea
                v-model="newMessage"
                rows="1"
                class="flex-grow bg-transparent p-4 pr-20 focus:outline-none resize-none"
                placeholder="Send a message"
                @keyup.enter="sendMessage"
              ></textarea>
              <!-- Send Button -->
              <button 
                @click="sendMessage" 
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

            <!-- Room status indicator -->
            <div class="flex items-center">
              <div class="relative">
                <div 
                  class="w-3 h-3 rounded-full cursor-help"
                  :class="{
                    'bg-green-500': roomStatus === 'connected',
                    'bg-red-500': roomStatus === 'error' || roomStatus === 'disconnected'
                  }"
                  @mouseenter="showRoomStatusTooltip = true"
                  @mouseleave="showRoomStatusTooltip = false"
                ></div>
                <!-- Tooltip -->
                <div 
                  v-if="showRoomStatusTooltip"
                  class="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50"
                >
                  {{ roomStatusMessage }}
                </div>
              </div>
            </div>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watchEffect } from 'vue'
import { 
  Menu, Search, PenSquare, MessageSquare, ChevronDown,
  Send, Image, PenLine, HelpCircle, FileText, Mic, Square, Trash2, TrashIcon
} from 'lucide-vue-next'
import SocketClient from '../utils/socketClient'
import { useUserStore } from '../store/userStore'
import baseApi from '../utils/baseApi';

// 2. State Management
const userStore = useUserStore()
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
const startingMessage = ref('Start a new chat!');
const quote = ref([
  '"This has pulp", "You like pulp!", "I LIKE SOME PULP!" - Tony and Carmella',
    'I was trying to say something positive cause she\'s your friend'
  ][Math.floor(Math.random() * 2)]
);
const socketStatus = ref('disconnected')
const showStatusTooltip = ref(false)
const messageQueue = ref([])
const notifications = ref([])
const roomStatus = ref('disconnected')
const showRoomStatusTooltip = ref(false)
const chatIds = ref(new Map()); // Map to store room_id -> chat_id mappings
const isLoadingChats = ref(false)
const chatPage = ref(0)
const hasMoreChats = ref(true)
const chatsPerPage = 20
const deleteHoverStates = ref({})

// 3. Data Definitions
const models = ref([
  {
    id: 1,
    name: 'OpenAI Real Time GPT-4o',
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

const chatSections = ref([{ chats: [] }])

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
      chats: allChats
        .filter(chat => chat.timestamp >= today)
        .sort((a, b) => b.timestamp - a.timestamp)
    },
    {
      title: 'Yesterday',
      chats: allChats
        .filter(chat => chat.timestamp >= yesterday && chat.timestamp < today)
        .sort((a, b) => b.timestamp - a.timestamp)
    },
    {
      title: 'Previous 7 Days',
      chats: allChats
        .filter(chat => chat.timestamp >= weekAgo && chat.timestamp < yesterday)
        .sort((a, b) => b.timestamp - a.timestamp)
    },
    {
      title: 'Older',
      chats: allChats
        .filter(chat => chat.timestamp < weekAgo)
        .sort((a, b) => b.timestamp - a.timestamp)
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
      return 'Connected to room'
    case 'error':
      return 'Room connection error'
    case 'disconnected':
      return 'Disconnected from room'
    default:
      return 'Unknown room status'
  }
})

async function initializeWebSocket() {
  console.log("Starting WebSocket initialization")

  try {
    socketClient.value = new SocketClient('http://localhost:8900', {
      auth: { user_id: 'testtest' },
      namespace: '/assistant/realtime',
      autoConnect: false,
      timeout: 10000,
      withCredentials: true,
    })

    // Update socket status based on events
    socketClient.value.onStatusChange((status) => {
      socketStatus.value = status
      
      // If we've reconnected, process queued messages
      if (status === 'connected' && messageQueue.value.length > 0) {
        processMessageQueue()
      }
    })

    await socketClient.value.connect()

    // Handle incoming messages
    socketClient.value.onMessage((data) => {
      console.log("Received message:", data)
      if (selectedChat.value && data.room_id === selectedChat.value.id) {
        try {
          const eventData = JSON.parse(data.message)
          
          switch (eventData.type) {
            case 'conversation.item.input_audio_transcription.completed':
              // Add transcribed message to chat
              const transcriptMessage = {
                id: eventData.item_id,
                role: 'user',
                content: eventData.transcript,
                timestamp: new Date()
              }
              selectedChat.value.messages.push(transcriptMessage)
              messageStatuses.value.set(eventData.item_id, 'sent')
              break
            case 'response.text.delta':
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
      roomStatus.value = 'connected'
    })

    socketClient.value.onRoomJoined((data) => {
      console.log("Joined room:", data)
      roomStatus.value = 'connected'
    })

    socketClient.value.onRoomError((data) => {
      console.error("Room error:", data)
      roomStatus.value = 'error'
      // TODO: Show error notification to user
    })

    socketClient.value.onRoomLeft((data) => {
      console.log("Left room:", data)
      roomStatus.value = 'disconnected'
    })

    // Add handler for chat created events
    socketClient.value.onChatCreated((chatId) => {
      console.log("Chat created with ID:", chatId);
      if (selectedChat.value) {
        chatIds.value.set(selectedChat.value.id, chatId);
      }
    });

  } catch (error) {
    console.error("Failed to initialize WebSocket:", error)
    socketStatus.value = 'disconnected'
  }
}

async function selectChat(chatId) {
  selectedChatId.value = chatId
  
  try {
    // Load messages for the selected chat
    const messages = await baseApi.get(`/chat/${chatId}/messages`)
    
    // Find and update the selected chat's messages
    const chat = chatSections.value[0].chats.find(c => c.id === chatId)
    if (chat) {
      chat.messages = messages.data.map(msg => ({
        ...msg,
        id: msg.message_id,
        timestamp: new Date(msg.created_timestamp)
      }))

      // Find or create room for this chat
      if (socketClient.value) {
        try {
          const roomData = await socketClient.value.findChat(chatId)
          if (roomData.room_id) {
            // Store the room ID with the chat
            chat.roomId = roomData.room_id
            await socketClient.value.joinRoom(roomData.room_id)
            console.log("Room found/created for chat:", roomData)
          } else {
            // Create room
            const roomData = await socketClient.value.createRoom(chatId);
            // Store the room ID with the chat
            chat.roomId = roomData.room_id
            console.log("Room created for chat:", roomData)
          }
          
          // Reset current assistant message when switching chats
          currentAssistantMessage.value = null
          
          // Set up message handler for this chat
          socketClient.value.onMessage((data) => {
            console.log("Received message:", data)
            if (selectedChat.value && data.room_id === selectedChat.value.roomId) {
              try {
                const eventData = JSON.parse(data.message)
                
                switch (eventData.type) {
                  case 'conversation.item.input_audio_transcription.completed':
                    // Add transcribed message to chat
                    const transcriptMessage = {
                      id: eventData.item_id,
                      role: 'user',
                      content: eventData.transcript,
                      timestamp: new Date()
                    }
                    selectedChat.value.messages.push(transcriptMessage)
                    messageStatuses.value.set(eventData.item_id, 'sent')
                    break
                    
                  case 'response.text.delta':
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
                  case 'response.done':
                    // Reset for next message
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
          
        } catch (error) {
          console.error('Error finding/creating room for chat:', error)
          notifications.value.push({
            type: 'error',
            message: 'Failed to connect to chat room',
            id: Date.now()
          })
        }
      }
    }
  } catch (error) {
    console.error('Error loading chat messages:', error)
    notifications.value.push({
      type: 'error',
      message: 'Failed to load chat messages',
      id: Date.now()
    })
  }
}

async function sendMessage() {
  if (!newMessage.value.trim()) return;

  if (socketStatus.value !== 'connected') {
    // Show error notification
    const notification = {
      type: 'error',
      message: 'Not connected to server. Message will be sent when connection is restored.',
      id: Date.now()
    }
    notifications.value.push(notification)
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== notification.id)
    }, 5000)

    // Queue message for later
    messageQueue.value.push({
      content: newMessage.value.trim(),
      chatId: selectedChat.value?.id
    })
    
    newMessage.value = ''
    return
  }

  // Create new chat if none selected
  if (!selectedChat.value) {
    await createNewChat()
  }

  const messageId = Date.now().toString();
  const now = new Date();
  const messageContent = newMessage.value.trim();
  
  try {
    // Add message to UI immediately with pending status
    messageStatuses.value.set(messageId, 'sending');
    selectedChat.value.messages.push({
      id: messageId,
      role: 'user',
      content: messageContent,
      timestamp: now
    });
    
    newMessage.value = '';
    await nextTick();
    
    // Use the stored roomId instead of chat ID
    if (!selectedChat.value.roomId) {
      throw new Error('No room ID found for chat');
    }

    // Create the conversation item
    const item = {
      id: messageId,
      type: 'message',
      role: 'user',
      content: [{
        type: 'input_text',
        text: messageContent
      }]
    };

    // Use roomId when sending messages
    const createdItem = await socketClient.value?.sendConversationItem(
      selectedChat.value.roomId,
      item,
      userStore.userid,
      selectedModel.value.name,
      selectedChat.value.id  // Pass chat_id separately
    );

    if (createdItem) {
      messageStatuses.value.set(messageId, 'sent');
      
      // Use roomId for response creation
      await socketClient.value?.sendMessage(selectedChat.value.roomId, {
        type: 'response.create',
        data: {
          response: {
            modalities: ['text', 'audio'],
            temperature: 0.7,
            max_output_tokens: 1500,
          }
        }
      });
    }

  } catch (error) {
    console.error("Error sending message:", error);
    messageStatuses.value.set(messageId, 'error');
    
    notifications.value.push({
      type: 'error',
      message: 'Failed to send message. Please try again.',
      id: Date.now()
    });
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
  if (socketStatus.value !== 'connected') {
    const notification = {
      type: 'error',
      message: 'Cannot create new chat while disconnected from server',
      id: Date.now()
    }
    notifications.value.push(notification)
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== notification.id)
    }, 5000)
    return
  }

  const newChatId = Date.now().toString()
  const now = new Date()
  
  try {
    // Create the chat in UI first
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      timestamp: now,
      messages: []
    }

    // Add to beginning of first section or create new section
    if (!chatSections.value[0]) {
      chatSections.value.unshift({ chats: [] })
    }
    chatSections.value[0].chats.unshift(newChat)
    
    // Select the new chat
    selectChat(newChatId)

    // Create and join room in socket server
    if (socketClient.value) {
      console.log("Creating room for new chat:", newChatId)
      const roomData = await socketClient.value.createRoom(newChatId)
      // Store the room ID with the chat
      newChat.roomId = roomData.room_id
      console.log("Room creation confirmed, roomId:", newChat.roomId)
      await socketClient.value.joinRoom(newChat.roomId)
      console.log("Room joined successfully")
    }

    return newChat
  } catch (error) {
    console.error("Failed to create chat room:", error)
    // Remove the chat if room creation failed
    if (chatSections.value[0]) {
      chatSections.value[0].chats = chatSections.value[0].chats.filter(
        chat => chat.id !== newChatId
      )
    }
    throw error
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

onMounted(() => {
  // Click outside handler
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.relative')
    if (dropdown && !dropdown.contains(e.target)) {
      isModelSelectorOpen.value = false
    }
  })
  
  initializeWebSocket()
  
  // Initial chat load
  loadChats()
  
  // Add scroll listener to chat selector
  const chatSelector = document.querySelector('.flex-1.overflow-y-auto')
  if (chatSelector) {
    chatSelector.addEventListener('scroll', handleScroll)
  }
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
  
  const chatSelector = document.querySelector('.flex-1.overflow-y-auto')
  if (chatSelector) {
    chatSelector.removeEventListener('scroll', handleScroll)
  }
})

// Add this new function to process queued messages
async function processMessageQueue() {
  while (messageQueue.value.length > 0 && socketStatus.value === 'connected') {
    const message = messageQueue.value.shift()
    try {
      // Create new chat if needed
      if (!selectedChat.value) {
        await createNewChat()
      }
      
      // Reuse existing sendMessage logic
      const messageId = Date.now().toString()
      messageStatuses.value.set(messageId, 'sending')
      
      selectedChat.value.messages.push({
        id: messageId,
        role: 'user',
        content: message.content,
        timestamp: new Date()
      })

      await socketClient.value?.sendMessage(selectedChat.value.id, 
      {
        type: 'conversation.item.create',
        data: {
          item: {
            id: messageId,
            type: 'message',
            role: 'user',
            content: [{
              type: 'input_text',
              text: message.content
            }]
          }
        },
      },
      userStore.userid,
      selectedModel.value.name)

      messageStatuses.value.set(messageId, 'sent')
    } catch (error) {
      console.error("Error processing queued message:", error)
      // Re-queue message if failed
      messageQueue.value.unshift(message)
      break
    }
  }
}

async function loadChats(page = 0) {
  if (isLoadingChats.value || !hasMoreChats.value) return
  
  try {
    isLoadingChats.value = true
    const response = await baseApi.get(`/chat?limit=${chatsPerPage}&offset=${page * chatsPerPage}`)
    
    const { chats, total, has_more } = response.data
    hasMoreChats.value = has_more

    // Transform API chats into the expected format
    const formattedChats = chats.map(chat => ({
      id: chat.chat_id,
      title: `Chat ${chat.chat_id.slice(0, 8)}`, // Use first 8 chars of chat_id as title
      timestamp: new Date(chat.created_timestamp), // Updated to match API response
      messages: [] // Messages will be loaded separately when chat is selected
    }))
    console.log(formattedChats)

    // Add new chats to the existing list
    if (page === 0) {
      // Ensure chatSections has at least one section
      if (chatSections.value.length === 0) {
        chatSections.value.push({ chats: [] })
      }
      chatSections.value[0].chats = formattedChats
    } else {
      chatSections.value[0].chats.push(...formattedChats)
    }
    
    chatPage.value = page
  } catch (error) {
    console.error('Error loading chats:', error)
    notifications.value.push({
      type: 'error',
      message: 'Failed to load chats. Please try again.',
      id: Date.now()
    })
  } finally {
    isLoadingChats.value = false
  }
}

function handleScroll(event) {
  const element = event.target
  const reachedBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100
  
  if (reachedBottom && !isLoadingChats.value && hasMoreChats.value) {
    loadChats(chatPage.value + 1)
  }
}

async function confirmDeleteChat(chatId) {
  if (confirm('Are you sure you want to delete this chat?')) {
    try {
      await baseApi.delete(`/chat/${chatId}`)
      
      // Remove chat from UI
      chatSections.value = chatSections.value.map(section => ({
        ...section,
        chats: section.chats.filter(chat => chat.id !== chatId)
      }))
      
      // If this was the selected chat, clear selection
      if (selectedChatId.value === chatId) {
        selectedChatId.value = null
      }
      
      // Show success notification
      notifications.value.push({
        type: 'success',
        message: 'Chat deleted successfully',
        id: Date.now()
      })
    } catch (error) {
      console.error('Error deleting chat:', error)
      notifications.value.push({
        type: 'error',
        message: 'Failed to delete chat',
        id: Date.now()
      })
    }
  }
}

//====================================================
// Audio Functions
//====================================================

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
    // Create new chat if none selected
    if (!selectedChat.value) {
      await createNewChat()
    }

    if (isProcessing.value) {
      console.log('Already processing a request, please wait...');
      return;
    }

    // Check if microphone access is already granted
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasMicAccess = devices.some(device => device.kind === 'audioinput' && device.label);

    if (!hasMicAccess) {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
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
            data: {
              audio: base64Audio,
              event_id: `event_${Date.now()}`
            }
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

