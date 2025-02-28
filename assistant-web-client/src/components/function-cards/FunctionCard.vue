<template>
  <div @click.stop>
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
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import { getComponentForFunction, hasCustomComponent } from './FunctionComponentRegistry';

// Lazy load the Brightdata components
const BrightdataContentCard = defineAsyncComponent(() => 
  import('./BrightdataContentCard.vue')
);
const BrightdataLiteCard = defineAsyncComponent(() => 
  import('./BrightdataLiteCard.vue')
);

// Content size threshold for using lite version (e.g., 500KB)
const VERY_LARGE_CONTENT_THRESHOLD = 500 * 1024;

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

// Check if this is a Brightdata content call and if it's very large
const isBrightdataContent = computed(() => {
  return props.functionCall && props.functionCall.name === 'brightdata_get_content';
});

const contentSize = computed(() => {
  if (!isBrightdataContent.value || !props.functionResult || !props.functionResult.result) {
    return 0;
  }
  return props.functionResult.result.content_length || 0;
});

const isVeryLargeContent = computed(() => {
  return contentSize.value > VERY_LARGE_CONTENT_THRESHOLD;
});

// Get custom component if available
const customComponent = computed(() => {
  if (!props.functionCall || !props.functionCall.name) return null;
  
  // Special handling for Brightdata content based on size
  if (isBrightdataContent.value) {
    return isVeryLargeContent.value ? BrightdataLiteCard : BrightdataContentCard;
  }
  
  return getComponentForFunction(props.functionCall.name);
});

// Expose toggle method for parent components
function toggleView() {
  isCustomView.value = !isCustomView.value;
}

// Check if a custom view is available
const hasCustomView = computed(() => {
  if (!props.functionCall || !props.functionCall.name) return false;
  return hasCustomComponent(props.functionCall.name) || isBrightdataContent.value;
});

defineExpose({
  toggleView,
  hasCustomView
});
</script> 