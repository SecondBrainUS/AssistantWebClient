<template>
  <div class="min-h-screen bg-gray-700 text-gray-100 flex">
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
        <MessageSquare class="h-5 w-5" />
        <span>ChatGPT</span>
        <ChevronDown class="h-4 w-4 ml-auto" />
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
            <div class="font-semibold mb-1">{{ message.sender }}</div>
            <div class="bg-gray-800 p-3 rounded-lg">{{ message.content }}</div>
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
    title: 'Today',
    chats: [
      { id: 1, title: 'Vite Vue.js Setup', messages: [
        { sender: 'User', content: 'How do I set up a new Vite Vue.js project?' },
        { sender: 'ChatGPT', content: 'To set up a new Vite Vue.js project, follow these steps:\n1. Open your terminal\n2. Run: npm create vite@latest my-vue-app -- --template vue\n3. cd into your new project directory\n4. Run: npm install\n5. Start the dev server with: npm run dev' }
      ]}
    ]
  },
  {
    title: 'Yesterday',
    chats: [
      { id: 2, title: 'Natural Hair Strengthening Tips', messages: [
        { sender: 'User', content: 'What are some natural ways to strengthen hair?' },
        { sender: 'ChatGPT', content: 'Here are some natural ways to strengthen your hair:\n1. Eat a balanced diet rich in proteins and vitamins\n2. Use coconut oil or olive oil treatments\n3. Avoid heat styling when possible\n4. Try an egg mask treatment\n5. Use a silk or satin pillowcase to reduce friction' }
      ]},
      { id: 3, title: 'Port Selection in IPC', messages: [
        { sender: 'User', content: 'How do I select the right port for IPC communication?' },
        { sender: 'ChatGPT', content: 'When selecting a port for IPC (Inter-Process Communication), consider these factors:\n1. Use ports above 1024 to avoid conflicts with system services\n2. Check if the port is already in use\n3. Consider using a configuration file to make the port number easily changeable\n4. Use well-known port ranges for your application type if applicable' }
      ]}
    ]
  },
  {
    title: 'Previous 7 Days',
    chats: [
      { id: 4, title: 'Python Threading and Async', messages: [
        { sender: 'User', content: 'What\'s the difference between threading and async in Python?' },
        { sender: 'ChatGPT', content: 'Threading and async in Python are both used for concurrent programming, but they have key differences:\n1. Threading uses OS-level threads, while async uses a single-threaded event loop\n2. Threading is better for CPU-bound tasks, async for I/O-bound tasks\n3. Async requires special syntax (async/await), threading doesn\'t\n4. Async is generally more scalable for I/O-heavy applications\n5. Threading can lead to race conditions, while async is typically safer' }
      ]},
      { id: 5, title: 'OpenAI API Debugging', messages: [
        { sender: 'User', content: 'How can I debug issues with the OpenAI API?' },
        { sender: 'ChatGPT', content: 'To debug issues with the OpenAI API:\n1. Check your API key and ensure it\'s valid\n2. Verify your request format and parameters\n3. Use try/catch blocks to handle and log errors\n4. Check the API response for error messages\n5. Monitor your API usage and rate limits\n6. Use OpenAI\'s official documentation for reference\n7. Test with curl or Postman to isolate issues' }
      ]}
    ]
  }
])

const selectedChatId = ref(null)
const newMessage = ref('')
const isSidebarOpen = ref(true)
const isSearchOpen = ref(false)
const searchQuery = ref('')

const selectedChat = computed(() => {
  return chatSections.value
    .flatMap(section => section.chats)
    .find(chat => chat.id === selectedChatId.value)
})

const filteredChatSections = computed(() => {
  if (!searchQuery.value) return chatSections.value

  return chatSections.value.map(section => ({
    ...section,
    chats: section.chats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })).filter(section => section.chats.length > 0)
})

function selectChat(chatId) {
  selectedChatId.value = chatId
}

function sendMessage() {
  if (newMessage.value.trim() && selectedChat.value) {
    selectedChat.value.messages.push({
      sender: 'User',
      content: newMessage.value.trim()
    })
    // Simulate a response from ChatGPT
    setTimeout(() => {
      selectedChat.value.messages.push({
        sender: 'ChatGPT',
        content: `This is a simulated response to: "${newMessage.value.trim()}"`
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
  chatSections.value[0].chats.unshift({
    id: newChatId,
    title: 'New Chat',
    messages: []
  })
  selectChat(newChatId)
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
</style>

