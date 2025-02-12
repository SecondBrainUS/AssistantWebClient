<template>
  <div ref="dropdownRef" class="relative max-w-xs flex items-center gap-4">
	<!-- Model selector button -->
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <div class="flex items-center space-x-2">
        <span class="text-sm">{{ selectedModel?.display_name || 'Loading...' }}</span>
      </div>
      <ChevronDown class="h-4 w-4" :class="{ 'transform rotate-180': isOpen }" />
    </button>

    <!-- Dropdown menu -->
    <div v-if="isOpen && selectedModel" class="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg z-50 top-full">
      <div class="p-2 space-y-1">
        <!-- Filters Section -->
        <div class="p-2 border-b border-gray-700 space-y-2">
          <!-- API Source Filter -->
          <select
            v-model="selectedApiSource"
            class="w-full bg-gray-700 text-sm rounded-lg p-2"
          >
            <option :value="null" class="bg-gray-800 text-white">All Sources</option>
            <option 
              v-for="source in apiSources" 
              :key="source" 
              :value="source"
              class="bg-gray-800 text-white"
            >
              {{ source }}
            </option>
          </select>

          <!-- Provider Filter -->
          <select
            v-model="selectedProvider"
            class="w-full bg-gray-700 text-sm rounded-lg p-2"
          >
            <option :value="null" class="bg-gray-800 text-white">All Providers</option>
            <option 
              v-for="provider in providers" 
              :key="provider" 
              :value="provider"
              class="bg-gray-800 text-white"
            >
              {{ provider }}
            </option>
          </select>
        </div>

        <!-- Model List - Updated to use filteredModels -->
        <div v-for="model in filteredModels" :key="model.model_id" class="p-2">
          <button 
            @click="selectModel(model)"
            class="w-full text-left hover:bg-gray-700 p-2 rounded-lg"
          >
            <div class="text-sm font-medium">{{ model.display_name }}</div>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import baseApi from '../utils/baseApi'

const props = defineProps({
  modelid: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'modelsLoaded'])

const LOADING_MODEL = Object.freeze({
  model_id: -1,
  model_api_source: '',
  display_name: 'Loading...',
  full_name: '',
  description: 'Please wait...',
  provider: '',
  isLoading: true
})

const ERROR_MODEL = Object.freeze({
  model_id: -2,
  model_api_source: '',
  display_name: 'Error loading models',
  full_name: '',
  description: 'Please try again later',
  provider: '',
  isError: true
})

const isOpen = ref(false)
const models = ref([LOADING_MODEL])
const selectedModelId = ref(null)
const isLoading = ref(true)

const toggles = ref([
  { id: 1, name: 'Temporary chat', enabled: false },
  { id: 2, name: 'Web browsing', enabled: false },
  { id: 3, name: 'Code interpreter', enabled: false }
])

const selectedModel = computed({
  get: () => {
    // Don't try to find loading model by ID
    if (models.value.length === 1 && models.value[0].isLoading) {
      return LOADING_MODEL
    }
    return models.value.find(m => m.model_id === selectedModelId.value) || models.value[0]
  },
  set: (model) => {
    if (!model.isLoading) {
      selectedModelId.value = model.model_id
    }
  }
})

const selectedApiSource = ref(null)
const selectedProvider = ref(null)

// Get unique API sources from models
const apiSources = computed(() => {
  const sources = [...new Set(models.value.map(m => m.model_api_source))]
  return sources.filter(source => source) // Remove any null/undefined values
})

// Get unique providers from models
const providers = computed(() => {
  const providerList = [...new Set(models.value.map(m => m.provider))]
  return providerList.filter(provider => provider) // Remove any null/undefined values
})

// Update filteredModels to include provider filter
const filteredModels = computed(() => {
  let filtered = models.value
  
  if (selectedApiSource.value) {
    filtered = filtered.filter(m => m.model_api_source === selectedApiSource.value)
  }
  
  if (selectedProvider.value) {
    filtered = filtered.filter(m => m.provider === selectedProvider.value)
  }
  
  return filtered
})

function selectModel(model) {
  selectedModel.value = model
  isOpen.value = false
  emit('update:modelValue', model)
}

async function loadModels() {
  isLoading.value = true
  try {
    const response = await baseApi.get('/model')
    console.log(response);
    models.value = response.data.models
    
    // If modelId prop is provided, select that model
    if (props.modelid) {
      const model = models.value.find(m => m.model_id === props.modelid)
      if (model) {
        selectModel(model)
      }
    } else {
      selectModel(models.value[0])
    }
    
    // Emit models loaded event with all models
    emit('modelsLoaded', models.value)
  } catch (error) {
    console.error('Error loading models:', error)
    models.value = [ERROR_MODEL]
  } finally {
    isLoading.value = false
  }
}

function selectModelById(modelid) {
  console.log("Selecting model by ID:", modelid)
  const model = models.value.find(m => m.model_id === modelid)
  if (!model) {
    console.error("Model not found")
    return false
  }
  selectModel(model)
  return true
}

const dropdownRef = ref(null)

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

onMounted(() => {
  loadModels()
})

// Expose method to parent
defineExpose({
  selectModelById
})
</script>