<template>
  <div class="brightdata-card rounded-lg overflow-hidden">
    <!-- Header with Brightdata-like logo -->
    <div class="flex items-center gap-2 p-2 bg-[#1a73e8] text-white font-medium">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
        <path d="M12 11L16 7L17.5 8.5L14.5 11.5L17.5 14.5L16 16L12 12L8 16L6.5 14.5L9.5 11.5L6.5 8.5L8 7L12 11Z" fill="white"/>
      </svg>
      <span>Web Scraping Result (Lite View)</span>
      <!-- Toggle button to switch between views -->
      <button @click.stop="toggleView" class="ml-auto text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors">
        {{ isCustomView ? 'View JSON' : 'View Card' }}
      </button>
    </div>

    <!-- Custom Card View -->
    <div v-if="isCustomView" class="p-0 bg-white dark:bg-gray-800">
      <!-- Metadata header -->
      <div class="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div class="flex flex-col gap-1">
          <div class="flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-blue-600 dark:text-blue-400">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
            </svg>
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Source URL:</span>
            <a :href="sourceUrl" target="_blank" class="ml-2 text-sm text-blue-600 dark:text-blue-400 hover:underline truncate max-w-md">
              {{ sourceUrl }}
            </a>
          </div>
          
          <div class="flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-green-600 dark:text-green-400">
              <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
            </svg>
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Success: {{ contentData.success ? 'Yes' : 'No' }}
            </span>
            <span class="mx-3 text-gray-400">|</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-gray-600 dark:text-gray-400">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
            </svg>
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Content Size: {{ formatBytes(contentData.content_length) }}
            </span>
            
            <!-- Download button -->
            <button 
              @click.stop="downloadContent" 
              class="ml-3 p-1 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors" 
              title="Download Full Content"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Content preview -->
      <div class="p-4">
        <div class="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700 dark:text-yellow-200">
                This content is very large ({{ formatBytes(contentData.content_length) }}) and is shown in text-only mode for better performance.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Text content preview - no markdown parsing -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          <h3 class="text-gray-800 dark:text-gray-200 font-medium mb-2">Content Preview:</h3>
          <div class="text-sm font-mono whitespace-pre-wrap text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded max-h-60 overflow-y-auto">
            {{ contentPreview }}
          </div>
        </div>
      </div>
    </div>

    <!-- JSON View -->
    <div v-if="!isCustomView" class="font-mono p-3 rounded-lg bg-gray-100 dark:bg-gray-900">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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

const isCustomView = ref(true);

const contentData = computed(() => {
  if (!props.functionResult || !props.functionResult.result) return { 
    success: false,
    markdown: '',
    content_length: 0
  };
  return props.functionResult.result;
});

const functionArgs = computed(() => {
  if (!props.functionCall || !props.functionCall.arguments) return {};
  try {
    return JSON.parse(props.functionCall.arguments);
  } catch (e) {
    return {};
  }
});

const sourceUrl = computed(() => {
  return functionArgs.value.url || '';
});

// Get a preview of the content - limited to first 1000 characters
const contentPreview = computed(() => {
  if (!contentData.value.markdown) return 'No content available';
  
  const maxLength = 1000;
  const content = contentData.value.markdown;
  
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.substring(0, maxLength) + '...\n\n[Content truncated - download to view all]';
});

function toggleView() {
  isCustomView.value = !isCustomView.value;
}

function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function downloadContent() {
  if (!contentData.value.markdown) return;
  
  // Create a blob with the full content
  const blob = new Blob([contentData.value.markdown], { type: 'text/markdown;charset=utf-8' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scraped_content_${new Date().toISOString().slice(0, 10)}.md`;
  
  // Trigger the download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}
</script>

<style scoped>
.brightdata-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style> 