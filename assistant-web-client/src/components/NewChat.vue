<template>
  <div class="h-full flex flex-col">
    <!-- Model selector -->
    <div class="p-4 border-b border-gray-700">
      <ModelSelector
        @update:modelValue="handleModelChange"
      />
    </div>
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-4">
        <h1 class="text-3xl font-semibold text-gray-300">Start a New Chat</h1>
      </div>
    </div>
    <div class="p-4">
      <div class="max-w-3xl mx-auto">
        <div class="relative flex items-center gap-4">
          <div class="flex-grow">
            <ChatInput 
              placeholder="Type to start a new chat..."
              @send="handleNewChat"
              @startRecording="handleStartRecording"
            />
          </div>
          <ToolsMenu @promptCompiler="handlePromptCompiler" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue'
import ChatInput from './ChatInput.vue'
import ModelSelector from './ModelSelector.vue'
import ToolsMenu from './ToolsMenu.vue'
import baseApi from '../utils/baseApi';

const emit = defineEmits(['createChat', 'startRecording', 'notification'])

const selectedModel = ref(null)

function handleModelChange(model) {
  selectedModel.value = model
}

async function handleNewChat(message) {
  const chatid = await createNewChat();
  emit('createChat', { chatid: chatid, modelid: selectedModel.value.model_id, initialMessage: message })
}

async function handleStartRecording() {
  const chatid = await createNewChat();
  emit('createChat', { chatid: chatid, modelid: selectedModel.value.model_id, boolStartRecording: true })
}

async function createNewChat() {
  if (!selectedModel.value) {
    console.error('No model selected');
    emit('notification', { message: 'No model selected', type: 'error' });
    return null;
  }
  try {
    const newChat = await baseApi.post('/chat', { 
      model_id: selectedModel.value.model_id,
      model_api_source: selectedModel.value.model_api_source
    })
    return newChat.data.chat_id;
  } catch (error) {
    console.error('Error creating new chat:', error)
    emit('notification', { message: 'Error creating new chat', type: 'error' });
    return null;
  }
}

function handlePromptCompiler() {
  console.log('Prompt Compiler clicked in NewChat')
  // Add your prompt compiler logic here
}
</script>
