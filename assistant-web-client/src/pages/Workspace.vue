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
          <button @click="onNewChat" class="p-2 hover:bg-gray-700 rounded">
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
        <ModelSelector
          v-model="selectedModel"
        />
      </div>

      <!-- Chat area -->
      <template v-if="selectedChatId">
        <Chat 
          :key="selectedChatId"
          :initial-message="initialMessage"
          :socket-client="socketClient"
          :chatid="selectedChatId"
          :selected-model="selectedModel"
          @notification="handleNotification"
        />
      </template>
      <template v-else>
        <NewChat 
          @createChat="createNewChat"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
// 1. Imports
import { ref, computed, onMounted, onUnmounted, nextTick, watchEffect } from 'vue'
import { 
  Menu, Search, PenSquare, MessageSquare,
  Send, Image, PenLine, HelpCircle, FileText, Mic, Square, Trash2, TrashIcon
} from 'lucide-vue-next'
import SocketClient from '../utils/socketClient'
import { useUserStore } from '../store/userStore'
import baseApi from '../utils/baseApi';
import Chat from '../components/Chat.vue'
import NewChat from '../components/NewChat.vue'
import ModelSelector from '../components/ModelSelector.vue'

//=====================================
// State Variables
//=====================================
const userStore = useUserStore()
const socketClient = ref(null)
const selectedChatId = ref(null)
const selectedChat = ref(null)
const initialMessage = ref('')
const isSidebarOpen = ref(true)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const isModelSelectorOpen = ref(false)
const socketStatus = ref('disconnected')
const showStatusTooltip = ref(false)
const notifications = ref([])
const isLoadingChats = ref(false)
const chatPage = ref(0)
const hasMoreChats = ref(true)
const chatsPerPage = 20
const deleteHoverStates = ref({})

const selectedModel = ref({
  id: 0,
  name: 'Loading...',
  description: 'Please wait...'
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

async function onNewChat() {
  selectedChatId.value = null;
  initialMessage.value = '';
}

async function createNewChat() {

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

function handleNotification(notification) {
  notifications.value.push(notification)
  // Optionally auto-remove notification after a delay
  setTimeout(() => {
    notifications.value = notifications.value.filter(n => n.id !== notification.id)
  }, 5000)
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