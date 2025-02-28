<template>
  <div>
    <!-- Use dynamic component if a custom one exists -->
    <component 
      v-if="customComponent && isCustomView" 
      :is="customComponent"
      :functionCall="functionCall"
      :functionResult="functionResult"
    >
      <slot></slot>
    </component>

    <!-- Fallback to default JSON view if no custom component or user toggled to JSON view -->
    <div v-else class="bg-[#171717] rounded-lg p-2 pb-4 px-3 mb-4 clear-both w-fit max-w-[80%] relative">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getComponentForFunction, hasCustomComponent } from './FunctionComponentRegistry';

const props = defineProps({
  functionCall: {
    type: Object,
    required: true
  },
  functionResult: {
    type: Object,
    default: null
  }
});

// Initially set to custom view if a custom component exists
const isCustomView = ref(true);

// Get custom component if available
const customComponent = computed(() => {
  if (!props.functionCall || !props.functionCall.name) return null;
  return getComponentForFunction(props.functionCall.name);
});

// Expose toggle method for parent components
function toggleView() {
  isCustomView.value = !isCustomView.value;
}

// Check if a custom view is available
const hasCustomView = computed(() => {
  if (!props.functionCall || !props.functionCall.name) return false;
  return hasCustomComponent(props.functionCall.name);
});

defineExpose({
  toggleView,
  hasCustomView
});
</script> 