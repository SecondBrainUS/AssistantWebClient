<template>
  <div ref="dropdownRef" class="relative max-w-xs ml-auto flex items-center gap-4">
	<!-- Model selector button -->
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <div class="flex items-center space-x-2">
        <span class="text-sm">{{ modelValue.display_name }}</span>
      </div>
      <ChevronDown class="h-4 w-4" :class="{ 'transform rotate-180': isOpen }" />
    </button>

    <!-- Dropdown menu -->
    <div v-if="isOpen" class="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg z-50 top-full">
      <div class="p-2 space-y-1">
        <div v-for="model in models" :key="model.model_id" class="p-2">
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
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      model_id: '',
      display_name: 'Loading...',
      full_name: '',
      description: 'Please wait...',
      provider: ''
    })
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const models = ref([])

const toggles = ref([
  { id: 1, name: 'Temporary chat', enabled: false },
  { id: 2, name: 'Web browsing', enabled: false },
  { id: 3, name: 'Code interpreter', enabled: false }
])

function selectModel(model) {
  emit('update:modelValue', model)
  isOpen.value = false
}

async function loadModels() {
  try {
    const response = await baseApi.get('/model')
    models.value = response.data.models
    // Set default model if none is selected
    if (!props.modelValue?.model_id && models.value.length > 0) {
      emit('update:modelValue', models.value[0])
    }
  } catch (error) {
    console.error('Error loading models:', error)
  }
}

const dropdownRef = ref(null)

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

onMounted(() => {
  loadModels()
})
</script>