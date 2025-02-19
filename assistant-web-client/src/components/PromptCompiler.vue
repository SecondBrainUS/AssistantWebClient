<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-900 rounded-lg w-[90vw] max-w-6xl h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Prompt Compiler</h2>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-700 rounded-lg">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="h-full" :class="{ 'flex gap-4': showForm }">
          <!-- Form Section (shows after parameters are generated) -->
          <div v-if="showForm" class="flex-1 overflow-y-auto">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div v-for="param in parameters" :key="param.name" class="space-y-2">
                <label :for="param.name" class="block text-sm font-medium">
                  {{ param.name }}
                  <span class="text-gray-500 text-xs ml-2">{{ param.description }}</span>
                </label>

                <!-- Array with enum -->
                <select v-if="param.type === 'array' && param.enum" 
                        v-model="formData[param.name]" 
                        :id="param.name" 
                        multiple
                        class="w-full bg-gray-800 rounded-lg p-2">
                  <option v-for="option in param.enum" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>

                <!-- Array without enum (free text input with tags) -->
                <div v-else-if="param.type === 'array'" class="space-y-2">
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(item, index) in formData[param.name]" 
                          :key="index"
                          class="bg-gray-700 px-2 py-1 rounded-lg flex items-center gap-1">
                      {{ item }}
                      <button @click="removeArrayItem(param.name, index)" type="button">
                        <X class="h-3 w-3" />
                      </button>
                    </span>
                  </div>
                  <input type="text" 
                         :id="param.name"
                         v-model="arrayInputs[param.name]"
                         @keydown.enter.prevent="addArrayItem(param.name)"
                         class="w-full bg-gray-800 rounded-lg p-2"
                         placeholder="Type and press Enter to add" />
                </div>

                <!-- Date input -->
                <input v-else-if="param.type === 'date'"
                       type="date"
                       v-model="formData[param.name]"
                       :id="param.name"
                       class="w-full bg-gray-800 rounded-lg p-2" />

                <!-- Number input -->
                <input v-else-if="param.type === 'number'"
                       type="number"
                       v-model.number="formData[param.name]"
                       :id="param.name"
                       class="w-full bg-gray-800 rounded-lg p-2" />

                <!-- Default text input -->
                <input v-else
                       type="text"
                       v-model="formData[param.name]"
                       :id="param.name"
                       class="w-full bg-gray-800 rounded-lg p-2" />
              </div>
            </form>
          </div>

          <!-- Text Area Section -->
          <div :class="showForm ? 'flex-1' : 'w-full'">
            <textarea
              v-model="promptText"
              class="w-full h-[calc(100%-40px)] bg-gray-800 rounded-lg p-4 resize-none"
              placeholder="Enter your prompt here..."
            ></textarea>
            <button 
              @click="generateParameters"
              class="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg w-full"
            >
              {{ showForm ? 'Update Parameters from Text' : 'Generate Parameters' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700">
        <button 
          @click="compilePrompt"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg w-full"
        >
          Compile Final Prompt
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { X } from 'lucide-vue-next'
import baseApi from '../utils/baseApi'

const emit = defineEmits(['close'])
const promptText = ref('')
const showForm = ref(false)
const parameters = ref([])
const formData = reactive({})
const arrayInputs = reactive({})

async function generateParameters() {
  try {
    const response = await baseApi.post('/prompt_compiler/compile', {
      prompt: promptText.value,
      modelid: 'anthropic:claude-3-opus-20240229', // You might want to make this configurable
      use_tools: true
    })
    
    parameters.value = response.data.parameters || []
    
    // Initialize form data with defaults
    parameters.value.forEach(param => {
      formData[param.name] = param.default
      if (param.type === 'array') {
        arrayInputs[param.name] = ''
        if (!Array.isArray(formData[param.name])) {
          formData[param.name] = []
        }
      }
    })
    
    showForm.value = true
  } catch (error) {
    console.error('Error generating parameters:', error)
  }
}

function addArrayItem(paramName) {
  if (!arrayInputs[paramName]) return
  if (!Array.isArray(formData[paramName])) {
    formData[paramName] = []
  }
  formData[paramName].push(arrayInputs[paramName])
  arrayInputs[paramName] = ''
}

function removeArrayItem(paramName, index) {
  formData[paramName].splice(index, 1)
}

async function compilePrompt() {
  try {
    const response = await baseApi.post('/prompt_compiler/compile', {
      prompt: promptText.value,
      modelid: 'anthropic:claude-3-opus-20240229', // You might want to make this configurable
      use_tools: false // Don't generate parameters on final compilation
    })
    emit('close', response.data.expanded_prompt)
  } catch (error) {
    console.error('Error compiling prompt:', error)
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style> 