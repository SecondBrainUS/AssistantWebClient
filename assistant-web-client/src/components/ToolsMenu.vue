<template>
  <div class="relative flex-shrink-0">
    <button
      @click="showMenu = !showMenu"
      class="p-2 rounded-full hover:bg-gray-700 transition-colors"
      title="Tools"
    >
      <MoreVertical class="h-4 w-4" />
    </button>

    <!-- Tools Menu Popup -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="showMenu" 
           class="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[160px]">
        <button 
          @click="handlePromptCompiler"
          class="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Wand2 class="h-4 w-4" />
          <span>Prompt Compiler</span>
        </button>
        <!-- Add more tools here as needed -->
      </div>
    </Transition>

    <!-- Prompt Compiler Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <PromptCompiler 
        v-if="showPromptCompiler" 
        @close="handlePromptCompilerClose"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MoreVertical, Wand2 } from 'lucide-vue-next'
import PromptCompiler from './PromptCompiler.vue'

const emit = defineEmits(['promptCompiler'])
const showMenu = ref(false)
const showPromptCompiler = ref(false)

function handlePromptCompiler() {
  showMenu.value = false
  showPromptCompiler.value = true
}

function handlePromptCompilerClose(compiledPrompt) {
  showPromptCompiler.value = false
  if (compiledPrompt) {
    emit('promptCompiler', compiledPrompt)
  }
}
</script> 