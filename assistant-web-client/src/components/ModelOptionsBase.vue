<template>
  <div class="p-4 border rounded-lg shadow-sm bg-gray-100">
    <h2 class="text-lg font-bold text-gray-800 mb-4">Model Options: {{ modelName }}</h2>
    <slot name="controls"></slot>
  </div>
</template>

<script setup>
defineProps({
  modelName: {
    type: String,
    required: true,
  },
});
</script>
