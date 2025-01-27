<template>
  <ModelOptions modelName="GPT">
    <template #controls>
      <div class="flex flex-col space-y-3">
        <label class="flex flex-col">
          Temperature
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            v-model="temperature"
            class="w-full"
          />
        </label>
        <label class="flex flex-col">
          Max Tokens
          <input
            type="number"
            v-model="maxTokens"
            class="w-full border rounded p-2"
          />
        </label>
      </div>
    </template>
  </ModelOptions>
</template>

<script setup>
import ModelOptions from "./ModelOptionsBase.vue";
import { ref } from "vue";

const temperature = ref(0.7);
const maxTokens = ref(100);
</script>
