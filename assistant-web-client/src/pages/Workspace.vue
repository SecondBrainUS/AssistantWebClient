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
              :key="chat.chatid"
              @click="selectChat(chat.chatid)"
              class="px-2 py-1 hover:bg-gray-700 rounded cursor-pointer flex items-center justify-between group"
              :class="{ 'bg-gray-700': selectedChatId === chat.chatid }"
            >
              <div class="flex items-center">
                <MessageSquare v-if="!isSidebarOpen" class="h-5 w-5" />
                <span v-else>{{ chat.title }}</span>
              </div>
              <!-- Add delete button -->
              <button 
                v-if="isSidebarOpen"
                @click.stop="confirmDeleteChat(chat.chatid)"
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded"
              >
                <component 
                  :is="deleteHoverStates[chat.chatid] ? Trash2 : TrashIcon"
                  class="h-4 w-4 transition-colors"
                  :class="deleteHoverStates[chat.chatid] ? 'text-red-500' : 'text-gray-400'"
                  @mouseenter="deleteHoverStates[chat.chatid] = true"
                  @mouseleave="deleteHoverStates[chat.chatid] = false"
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
      <template v-if="selectedChat">
        <Chat 
          :messages="selectedChat.messages"
          :message-statuses="messageStatuses"
          :pending-message="newMessage"
          :socket-client="socketClient"
          :chatid="selectedChat.chatid"
          :roomid="selectedChat.roomid"
          :selected-model="selectedModel"
          @send="sendMessage"
          @start-recording="startRecording"
          @stop-recording="stopRecording"
          @update-messages="updateMessages"
        />
      </template>
      <template v-else>
        <NewChat 
          @create-chat="handleNewChat"
          @start-recording="startRecording"
        />
      </template>
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
import Chat from '../components/Chat.vue'
import NewChat from '../components/NewChat.vue'

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
    .find(chat => chat.chatid === selectedChatId.value)
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

    await socketClient.value.connect()

    // Handle Room Created
    // TODO: how do we hook into these when creating a new chat or loading an existing chat?
    socketClient.value.onRoomCreated((data) => {
      console.log("Room created:", data)
    })

    // Handle Chat Created
    socketClient.value.onChatCreated((chatId) => {
      console.log("Chat created with ID:", chatId);
      if (selectedChat.value) {
        chatIds.value.set(selectedChat.value.chatid, chatId);
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
    const chat = chatSections.value[0].chats.find(c => c.chatid === chatId)
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

async function handleNewChat({ initialMessage, isVoiceChat }) {
  const newChat = await createNewChat()
  if (initialMessage) {
    newMessage.value = initialMessage
    await nextTick()
    sendMessage()
  } else if (isVoiceChat) {
    startRecording()
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
        chat => chat.chatid !== newChatId
      )
    }
    throw error
  }
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
  const chatSelector = document.querySelector('.flex-1.overflow-y-auto')
  if (chatSelector) {
    chatSelector.removeEventListener('scroll', handleScroll)
  }
})

async function loadChats(page = 0) {
  if (isLoadingChats.value || !hasMoreChats.value) return
  
  try {
    isLoadingChats.value = true
    const response = await baseApi.get(`/chat?limit=${chatsPerPage}&offset=${page * chatsPerPage}`)
    
    const { chats, total, has_more } = response.data
    hasMoreChats.value = has_more

    // Transform API chats into the expected format
    const formattedChats = chats.map(chat => ({
      chatid: chat.chat_id,
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
        chats: section.chats.filter(chat => chat.chatid !== chatId)
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

