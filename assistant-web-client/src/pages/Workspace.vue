<template>
  <div class="h-full bg-gray-700 text-gray-100 flex">
    <!-- Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <transition-group name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="p-3 rounded-lg shadow-lg flex items-center transition-all duration-300 transform max-w-md"
          :class="{
            'bg-red-500': notification.type === 'error',
            'bg-green-500': notification.type === 'success',
            'bg-blue-500': notification.type === 'info'
          }"
        >
          <!-- Icon based on notification type -->
          <div class="mr-3">
            <AlertCircle v-if="notification.type === 'error'" class="h-5 w-5" />
            <CheckCircle v-else-if="notification.type === 'success'" class="h-5 w-5" />
            <Info v-else class="h-5 w-5" />
          </div>
          <!-- Message -->
          <div class="flex-1">{{ notification.message }}</div>
          <!-- Close button -->
          <button 
            @click="dismissNotification(notification.id)" 
            class="ml-2 text-white opacity-70 hover:opacity-100 transition-opacity"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </transition-group>
    </div>

    <!-- Sidebar -->
    <div 
      :class="[
        'bg-gray-800 p-4 flex flex-col border-r border-gray-700 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64' : 'w-14'
      ]"
    >
      <!-- Top section -->
      <div 
        :class="[
          'flex transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'items-center justify-between' : 'flex-col items-center space-y-4'
        ]"
      >
        <button @click="toggleSidebar" class="p-2 hover:bg-gray-700 rounded">
          <Menu class="h-5 w-5" />
        </button>
        <!-- Icons container with animated positioning -->
        <div 
          :class="[
            'flex transition-opacity duration-150 ease-in-out',
            isSidebarOpen ? 
              'items-center space-x-2' : 
              'flex-col space-y-2'
          ]"
        >
          <button 
            @click="toggleSearch" 
            class="p-2 hover:bg-gray-700 rounded opacity-0"
            :class="{ 'opacity-100': isSidebarOpen || !isAnimating }"
          >
            <Search class="h-5 w-5" />
          </button>
          <button 
            @click="onNewChat" 
            class="p-2 hover:bg-gray-700 rounded opacity-0"
            :class="{ 'opacity-100': isSidebarOpen || !isAnimating }"
          >
            <PenSquare class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Only show the rest of the content when sidebar is open -->
      <template v-if="isSidebarOpen">
        <!-- Search bar -->
        <div v-if="isSearchOpen" class="mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search chats..."
            class="w-full bg-gray-700 text-white placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
            @input="filterChats"
          />
        </div>

        <!-- Navigation sections -->
        <div class="flex-1 overflow-y-auto space-y-4 max-h-[calc(100vh-1rem)]">
          <div v-for="(section, index) in filteredChatSections" :key="index">
            <div class="text-xs text-gray-500 px-2 py-1">{{ section.title }}</div>
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
      </template>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Chat area -->
      <template v-if="selectedChatId">
        <Chat 
          :key="selectedChatId"
          :socket-client="socketClient"
          :chatid="selectedChatId"
          :initial-message="pendingInitialMessage"
          :start-recording="startRecording"
          @notification="handleNotification"
        />
      </template>
      <template v-else>
        <NewChat 
          @createChat="createNewChat"
          @notification="handleNotification"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
// 1. Imports
import { ref, computed, onMounted, onUnmounted, nextTick, watchEffect, watch } from 'vue'
import { 
  Menu, Search, PenSquare, MessageSquare,
  Send, Image, PenLine, HelpCircle, FileText, Mic, Square, Trash2, TrashIcon,
  AlertCircle, CheckCircle, Info, X
} from 'lucide-vue-next'
import SocketClient from '../utils/socketClient'
import { useUserStore } from '../store/userStore'
import baseApi from '../utils/baseApi';
import Chat from '../components/Chat.vue'
import NewChat from '../components/NewChat.vue'

//=====================================
// State Variables
//=====================================
const userStore = useUserStore()
const socketClient = ref(null)
const selectedChatId = ref(null)
const selectedChat = ref(null)
const isSidebarOpen = ref(true)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const socketStatus = ref('disconnected')
const showStatusTooltip = ref(false)
const notifications = ref([])
const isLoadingChats = ref(false)
const chatPage = ref(0)
const hasMoreChats = ref(true)
const chatsPerPage = 50
const deleteHoverStates = ref({})
const isAnimating = ref(false)

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

const pendingInitialMessage = ref(null);
const startRecording = ref(false);

async function initializeWebSocket() {
  console.log("Starting WebSocket initialization")

  try {
    socketClient.value = new SocketClient(import.meta.env.VITE_API_URL, {
      namespace: '/assistant/realtime',
      path: `${import.meta.env.VITE_BASE_PATH}/socket.io/`,
      auth: { user_id: 'testtest' },
      autoConnect: false,
      timeout: 10000,
      withCredentials: true,
  });

    await socketClient.value.connect()

  } catch (error) {
    console.error("Failed to initialize WebSocket:", error)
    socketStatus.value = 'disconnected'
  }
}

async function selectChat(chatid) {
  // Check if socket client is initialized
  if (!socketClient.value){
    console.error("[WORKSPACE] [SELECT CHAT] Socket client not initialized");
    notifications.value.push({
      type: 'error',
      message: 'Connection to server not available.',
      id: Date.now()
    })
    return;
  }

  // Set selected chatid
  selectedChatId.value = chatid;
}

function toggleSidebar() {
  isAnimating.value = true
  isSidebarOpen.value = !isSidebarOpen.value
  if (!isSidebarOpen.value) {
    isSearchOpen.value = false
  }
  setTimeout(() => {
    isAnimating.value = false
  }, 150)
}

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
}

function filterChats() {
  // Filtering is handled by computed property
}

async function onNewChat() {
  selectedChatId.value = null;
}

async function createNewChat({ chatid, modelid, initialMessage, boolStartRecording }) {
  if (!chatid) return;
  console.log("Creating new chat:", chatid, modelid, initialMessage, boolStartRecording)

  try {
    // Add the new chat to the UI immediately
    const newChat = {
      chatid: chatid,
      title: `Chat ${chatid.slice(0, 8)}`,
      timestamp: new Date(),
      messages: []
    }

    // Add to beginning of first section's chats
    if (chatSections.value.length === 0) {
      chatSections.value.push({ chats: [] })
    }
    chatSections.value[0].chats.unshift(newChat)

    // Set pending initial message if provided
    pendingInitialMessage.value = initialMessage
    startRecording.value = boolStartRecording
    await nextTick();

    // Set as selected chat
    selectedChatId.value = chatid
  } catch (error) {
    console.error('Error creating new chat:', error)
    notifications.value.push({
      type: 'error',
      message: 'Failed to create new chat',
      id: Date.now()
    })
  }
}

// Add this debug watch to help track the value
watch(pendingInitialMessage, (newVal) => {
  console.log("pendingInitialMessage changed:", newVal)
})

// Modify the watcher to only clear on specific conditions
watch(selectedChatId, (newId, oldId) => {
  // Only clear if we're moving away from a chat, not when initially selecting one
  if (oldId !== null) {
    pendingInitialMessage.value = null
  }
})

onMounted(() => {
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
      
      // Create a properly formatted notification object
      handleNotification({
        type: 'success',
        message: 'Chat deleted successfully',
        // No need to specify ID, handleNotification will create one
      })
      
    } catch (error) {
      console.error('Error deleting chat:', error)
      handleNotification({
        type: 'error',
        message: 'Failed to delete chat',
        // No need to specify ID, handleNotification will create one
      })
    }
  }
}

function dismissNotification(id) {
  // Add console log to help debug notification dismissal
  console.log('Dismissing notification with ID:', id)
  notifications.value = notifications.value.filter(n => n.id !== id)
}

function handleNotification(notification) {
  // Generate a truly unique ID
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  
  // Ensure each notification has a unique ID
  const notificationWithId = {
    ...notification,
    id: notification.id || uniqueId
  }
  
  // Set a consistent 4 second duration for all notifications
  const duration = notification.duration || 4000
  
  // Add the notification to the array
  notifications.value.push(notificationWithId)
  console.log('Added notification with ID:', notificationWithId.id, 'Will dismiss in', duration, 'ms')
  
  // Create unique timeout for this notification
  setTimeout(() => {
    console.log('Timeout triggered for notification ID:', notificationWithId.id)
    dismissNotification(notificationWithId.id)
  }, duration)
}
</script>

<style>
/* Notification animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

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

/* Add styles to ensure proper scrolling behavior */
.overflow-y-auto {
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}
</style>