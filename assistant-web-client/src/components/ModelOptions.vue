<template>
  <div>
    <component
      :is="currentComponent"
      v-if="currentComponent"
      class="block w-full"
    />
    <p v-else class="text-gray-500">No options available for this model.</p>
  </div>
</template>

<script setup>
import { computed } from "vue";

// Import model-specific option components
import OpenAIRealtimeGPT4oOptions from "./ModelOptionsOpenAIRealtimeGPT4o.vue";

// Define the registry of model components
const modelComponents = {
  'OpenAI GPT-4o Realtime Preview': OpenAIRealtimeGPT4oOptions,
};

// Props
defineProps({
  modelType: {
    type: String,
    required: true,
  },
});

// Dynamically compute the current component based on modelType
const currentComponent = computed(() => modelComponents[modelType] || null);
</script>
