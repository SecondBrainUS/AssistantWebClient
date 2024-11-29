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
      <!-- Chat area -->
      <div class="flex-1 p-4 overflow-y-auto">
        <div v-if="selectedChat">
          <div v-for="(message, index) in selectedChat.messages" :key="index" class="mb-4">
            <div class="flex justify-between items-center mb-1">
              <div class="font-semibold">{{ message.sender }}</div>
              <div class="text-xs text-gray-400">
                {{ formatTimestamp(message.timestamp) }}
              </div>
            </div>
            <div :class="[
              message.sender === 'User' ? 'bg-gray-600 p-3 rounded-lg' : ''
            ]">{{ message.content }}</div>
          </div>
        </div>
        <div v-else class="h-full flex items-center justify-center">
          <div class="text-3xl font-semibold text-gray-300">What can I help with?</div>
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
              placeholder="Message ChatGPT"
              @keyup.enter="sendMessage"
            ></textarea>
            <button @click="sendMessage" class="absolute right-2 bottom-2 p-2 hover:bg-gray-700 rounded">
              <Send class="h-5 w-5" />
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
import { ref, computed } from 'vue'
import { 
  Menu, 
  Search, 
  PenSquare, 
  MessageSquare, 
  ChevronDown,
  Send,
  Image,
  PenLine,
  HelpCircle,
  FileText
} from 'lucide-vue-next'

const chatSections = ref([
  {
    chats: [
      { 
        id: 1, 
        title: 'Vite Vue.js Setup', 
        timestamp: new Date(), 
        messages: [
          { 
            sender: 'User', 
            content: 'How do I set up a new Vite Vue.js project?',
            timestamp: new Date()
          },
          { 
            sender: 'ChatGPT', 
            content: 'To set up a new Vite Vue.js project, follow these steps:\n1. Open your terminal\n2. Run: npm create vite@latest my-vue-app -- --template vue\n3. cd into your new project directory\n4. Run: npm install\n5. Start the dev server with: npm run dev',
            timestamp: new Date()
          }
        ]
      }
    ]
  }
])

const selectedChatId = ref(null)
const newMessage = ref('')
const isSidebarOpen = ref(true)
const isSearchOpen = ref(false)
const searchQuery = ref('')

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

function selectChat(chatId) {
  selectedChatId.value = chatId
}

function sendMessage() {
  if (newMessage.value.trim() && selectedChat.value) {
    const now = new Date()
    selectedChat.value.messages.push({
      sender: 'User',
      content: newMessage.value.trim(),
      timestamp: now
    })
    // Simulate a response from ChatGPT
    setTimeout(() => {
      selectedChat.value.messages.push({
        sender: 'ChatGPT',
        content: `This is a simulated response to: "${newMessage.value.trim()}"`,
        timestamp: new Date()
      })
    }, 1000)
    newMessage.value = ''
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
  // Filtering is handled by the computed property filteredChatSections
}

function createNewChat() {
  const newChatId = Date.now()
  const now = new Date()
  chatSections.value[0].chats.unshift({
    id: newChatId,
    title: 'New Chat',
    timestamp: now,
    messages: []
  })
  selectChat(newChatId)
}

function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

