<template>
  <ModelOptions modelName="GPT">
    <template #controls>
      <div class="flex flex-col space-y-3">
        <label class="flex flex-col">
          Instructions
          <textarea
            v-model="instructions"
            class="w-full border rounded p-2 min-h-[100px]"
            placeholder="Enter instructions for the assistant..."
          ></textarea>
        </label>

        <label class="flex flex-col">
          Modalities
          <select v-model="selectedModality" class="w-full border rounded p-2">
            <option value="both">Text + Audio</option>
            <option value="text">Text</option>
            <option value="audio">Audio</option>
          </select>
        </label>

        <label class="flex flex-col">
          Voice
          <select v-model="voice" class="w-full border rounded p-2">
            <option value="alloy">Alloy</option>
            <option value="ash">Ash</option>
            <option value="ballad">Ballad</option>
            <option value="coral">Coral</option>
            <option value="echo">Echo</option>
            <option value="sage">Sage</option>
            <option value="shimmer">Shimmer</option>
            <option value="verse">Verse</option>
          </select>
        </label>

        <label class="flex flex-col">
          Tool Choice
          <select v-model="toolChoice" class="w-full border rounded p-2">
            <option value="auto">Auto</option>
            <option value="none">None</option>
            <option value="required">Required</option>
          </select>
        </label>

        <label class="flex flex-col">
          Temperature
          <div class="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              v-model="temperature"
              class="w-full"
            />
            <span class="w-12 text-sm">{{ temperature }}</span>
          </div>
        </label>

        <label class="flex flex-col">
          Max Tokens
          <div class="flex items-center space-x-2">
            <input
              type="number"
              v-model="maxTokens"
              min="1"
              max="4096"
              class="w-full border rounded p-2"
              @input="handleMaxTokensInput"
            />
            <span class="w-12 text-sm">{{ displayMaxTokens }}</span>
          </div>
        </label>
      </div>
    </template>
  </ModelOptions>
</template>

<script setup>
import ModelOptions from "./ModelOptionsBase.vue";
import { ref, computed } from "vue";

// State
const instructions = ref("");
const selectedModality = ref("both");
const voice = ref("sage");
const toolChoice = ref("auto");
const temperature = ref(0.8);
const maxTokens = ref(null);

// Computed properties
const displayMaxTokens = computed(() => 
  maxTokens.value === null ? "inf" : maxTokens.value
);

const modalities = computed(() => {
  switch (selectedModality.value) {
    case "both":
      return ["text", "audio"];
    case "text":
      return ["text"];
    case "audio":
      return ["audio"];
    default:
      return ["text", "audio"];
  }
});

// Methods
const handleMaxTokensInput = (event) => {
  const value = event.target.value;
  maxTokens.value = value === "" ? null : Number(value);
};

// Export settings
const getSettings = () => {
  const response = {};
  
  if (modalities.value?.length) response.modalities = modalities.value;
  if (instructions.value?.trim()) response.instructions = instructions.value;
  if (voice.value) response.voice = voice.value;
  if (toolChoice.value) response.tool_choice = toolChoice.value;
  if (temperature.value != null) response.temperature = Number(temperature.value);
  if (maxTokens.value != null) response.max_output_tokens = maxTokens.value;
  
  return { response };
};

// Expose settings for parent components
defineExpose({
  getSettings
});
</script>
