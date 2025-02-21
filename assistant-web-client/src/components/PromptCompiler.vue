<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg w-[90vw] max-w-6xl h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-700 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-semibold text-gray-100">Prompt Compiler</h2>
          <ModelSelector
            ref="modelSelector"
            @update:modelValue="handleModelChange"
            class="w-[280px]"
          />
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-100">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Main Content -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="h-full" :class="{ 'flex flex-col gap-4': showForm }">
          <!-- Original Prompt Display (shows after parameters are generated) -->
          <div v-if="showForm" class="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div class="text-sm text-gray-400 mb-2">Original Prompt:</div>
            <div class="text-gray-200">{{ originalPrompt }}</div>
          </div>

          <div :class="{ 'flex gap-4': showForm }">
            <!-- Form Section (shows after parameters are generated) -->
            <div v-if="showForm" class="flex-1 overflow-y-auto">
              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div v-for="param in parameters" :key="param.name" class="space-y-2">
                  <label :for="param.name" class="block text-sm font-medium text-gray-200">
                    {{ param.name }}
                    <span class="text-gray-400 text-xs ml-2">{{ param.description }}</span>
                  </label>

                  <!-- String with enum -->
                  <div v-if="param.type === 'string' && param.enum" class="flex gap-2">
                    <select 
                      v-model="formData[param.name]"
                      :id="param.name"
                      class="flex-1 bg-gray-900 rounded-lg p-2 border border-gray-700 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                    >
                      <option value="">Select from options...</option>
                      <option v-for="option in param.enum" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                    <input 
                      type="text"
                      v-model="formData[param.name]"
                      :id="`${param.name}-custom`"
                      class="flex-1 bg-gray-900 rounded-lg p-2 border border-gray-700 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                      placeholder="Or type custom value"
                    />
                  </div>

                  <!-- Array with enum -->
                  <div v-else-if="param.type === 'array' && param.enum" class="space-y-2">
                    <div class="flex flex-wrap gap-2">
                      <span v-for="(item, index) in formData[param.name]" 
                            :key="index"
                            class="bg-gray-700 px-2 py-1 rounded-lg flex items-center gap-1">
                        {{ item }}
                        <button @click="removeArrayItem(param.name, index)" type="button" class="text-gray-400 hover:text-gray-200">
                          <X class="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                    <div class="flex gap-2">
                      <select 
                        class="flex-1 bg-gray-900 rounded-lg p-2 border border-gray-700 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                        @change="handleEnumSelect(param.name, $event.target.value)"
                      >
                        <option value="">Select from options...</option>
                        <option v-for="option in param.enum" :key="option" :value="option">
                          {{ option }}
                        </option>
                      </select>
                      <input type="text" 
                             :id="param.name"
                             v-model="arrayInputs[param.name]"
                             @keydown.enter.prevent="addArrayItem(param.name)"
                             class="flex-1 bg-gray-900 rounded-lg p-2 border border-gray-700 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                             placeholder="Or type custom value and press Enter" />
                    </div>
                  </div>

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
              <!-- Initial prompt input -->
              <textarea
                v-model="promptText"
                v-if="!showForm"
                class="w-full h-[calc(100%-40px)] bg-[#171717] rounded-lg p-4 resize-none border border-gray-700 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                placeholder="Enter your prompt here..."
              ></textarea>
              <!-- Edited prompt input (shows after parameters are generated) -->
              <textarea
                v-else
                v-model="editedPrompt"
                class="w-full h-[calc(100%-40px)] bg-[#171717] rounded-lg p-4 resize-none border border-gray-700 focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                placeholder="Edit your prompt here..."
              ></textarea>
              
              <!-- Show different buttons based on state -->
              <div class="mt-2 space-y-2">
                <!-- Initial Generate Parameters button -->
                <button 
                  v-if="!showForm"
                  @click="generateInitialParameters"
                  class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg w-full text-gray-100 transition-colors"
                >
                  Generate Parameters
                </button>
                <!-- Update Parameters button (only shown after initial generation) -->
                <button 
                  v-else
                  @click="updateParameters"
                  class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg w-full text-gray-100 transition-colors"
                >
                  Update Parameters from Text
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700">
        <button 
          @click="compilePrompt"
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg w-full text-gray-100 transition-colors"
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
import ModelSelector from './ModelSelector.vue'

const emit = defineEmits(['close'])
const promptText = ref('')
const editedPrompt = ref('')
const originalPrompt = ref('')
const showForm = ref(false)
const parameters = ref([])
const formData = reactive({})
const arrayInputs = reactive({})
const modelSelector = ref(null)
const selectedModel = ref(null)

function handleModelChange(model) {
  selectedModel.value = model
}

async function generateInitialParameters() {
  try {
    originalPrompt.value = promptText.value
    const response = await baseApi.post('/prompt_compiler/compile', {
      prompt: promptText.value,
      modelid: selectedModel.value?.model_id || 'anthropic:claude-3-opus-20240229',
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
    
    editedPrompt.value = promptText.value // Initialize edited prompt with original
    showForm.value = true
  } catch (error) {
    console.error('Error generating initial parameters:', error)
  }
}

async function updateParameters() {
  try {
    const response = await baseApi.post('/prompt_compiler/update_parameters', {
      prompt: editedPrompt.value,
      parameters_schema: parameters.value,
      original_prompt: originalPrompt.value,
      modelid: selectedModel.value?.model_id || 'anthropic:claude-3-opus-20240229'
    })
    
    // Update form data with new values
    const newValues = response.data.values
    Object.keys(newValues).forEach(key => {
      formData[key] = newValues[key]
    })
  } catch (error) {
    console.error('Error updating parameters:', error)
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

function handleEnumSelect(paramName, value) {
  if (!value) return
  if (!Array.isArray(formData[paramName])) {
    formData[paramName] = []
  }
  formData[paramName].push(value)
}

async function compilePrompt() {
  try {
    const response = await baseApi.post('/prompt_compiler/compile', {
      prompt: editedPrompt.value || promptText.value,
      modelid: selectedModel.value?.model_id || 'anthropic:claude-3-opus-20240229',
      use_tools: false
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