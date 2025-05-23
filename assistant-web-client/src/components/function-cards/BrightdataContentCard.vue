<template>
  <div class="brightdata-card rounded-lg overflow-hidden">
    <!-- Header with Brightdata-like logo -->
    <div class="flex items-center gap-2 p-2 bg-[#1a73e8] text-white font-medium">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
        <path d="M12 11L16 7L17.5 8.5L14.5 11.5L17.5 14.5L16 16L12 12L8 16L6.5 14.5L9.5 11.5L6.5 8.5L8 7L12 11Z" fill="white"/>
      </svg>
      <span>Web Scraping Result</span>
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
      
      <!-- Preview toggle if content is large -->
      <div v-if="isLargeContent && !fullContentLoaded" class="p-4 text-center">
        <p class="text-gray-500 dark:text-gray-400 mb-3">
          This content is large ({{ formatBytes(contentData.content_length) }}) and may impact performance.
        </p>
        <button 
          @click.stop="loadFullContent" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Load Full Content
        </button>
        <button 
          @click.stop="loadPreviewContent" 
          class="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Show Preview
        </button>
      </div>
      
      <!-- Loading indicator -->
      <div v-else-if="isLoading" class="p-12 flex justify-center items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
      
      <!-- Markdown content -->
      <div v-else-if="renderedContent" class="p-4 markdown-body max-h-96 overflow-y-auto">
        <div v-html="renderedContent"></div>
      </div>
    </div>

    <!-- JSON View -->
    <div v-if="!isCustomView" class="font-mono p-3 rounded-lg bg-gray-100 dark:bg-gray-900">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

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
const isLoading = ref(false);
const renderedContent = ref('');
const fullContentLoaded = ref(false);
const markedInstance = ref(null);

// Threshold for "large" content in bytes (e.g., 100KB)
const LARGE_CONTENT_THRESHOLD = 100 * 1024;

const contentData = computed(() => {
  if (!props.functionResult || !props.functionResult.result) return { 
    success: false,
    markdown: '',
    content_length: 0
  };
  return props.functionResult.result;
});

const isLargeContent = computed(() => {
  return contentData.value.content_length > LARGE_CONTENT_THRESHOLD;
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

// Import marked dynamically only when needed
async function loadMarkedLibrary() {
  if (!markedInstance.value) {
    isLoading.value = true;
    try {
      const { marked } = await import('marked');
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      markedInstance.value = marked;
    } catch (e) {
      console.error('Error loading marked library:', e);
    } finally {
      isLoading.value = false;
    }
  }
  return markedInstance.value;
}

async function renderMarkdown(markdown, force = false) {
  if (!markdown) return '';
  
  try {
    const marked = await loadMarkedLibrary();
    if (!marked) return '<div class="text-red-500">Error loading markdown renderer</div>';
    
    // For large content, only render if forced or in preview mode
    if (isLargeContent.value && !force) {
      fullContentLoaded.value = false;
      return ''; // Don't render large content until explicitly requested
    }
    
    return marked(markdown);
  } catch (e) {
    console.error('Error rendering markdown:', e);
    return '<div class="text-red-500">Error rendering markdown content</div>';
  }
}

async function loadFullContent() {
  isLoading.value = true;
  setTimeout(async () => {
    renderedContent.value = await renderMarkdown(contentData.value.markdown, true);
    fullContentLoaded.value = true;
    isLoading.value = false;
  }, 50); // Small delay to allow UI to update
}

async function loadPreviewContent() {
  isLoading.value = true;
  setTimeout(async () => {
    // Extract first ~2000 characters for preview
    const previewText = contentData.value.markdown.slice(0, 2000) + 
      (contentData.value.markdown.length > 2000 ? '\n\n*... Content truncated. Click "Load Full Content" to see everything ...*' : '');
    renderedContent.value = await renderMarkdown(previewText, true);
    fullContentLoaded.value = false;
    isLoading.value = false;
  }, 50);
}

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

// Initialize with preview content for smaller content
onMounted(async () => {
  if (!isLargeContent.value) {
    loadFullContent();
  }
});

// Reset rendered content when function result changes
watch(() => props.functionResult, async (newVal) => {
  if (newVal) {
    renderedContent.value = '';
    fullContentLoaded.value = false;
    if (!isLargeContent.value) {
      loadFullContent();
    }
  }
}, { deep: true });

// Add download function to the BrightdataContentCard
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

<style>
.brightdata-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Basic markdown styling */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.markdown-body h1 {
  font-size: 2em;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
  font-weight: 600;
}

.markdown-body h2 {
  font-size: 1.5em;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
  font-weight: 600;
}

.markdown-body h3 {
  font-size: 1.17em;
  margin-top: 1em;
  margin-bottom: 1em;
  font-weight: 600;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body ul, .markdown-body ol {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
  margin-bottom: 16px;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
}

.dark .markdown-body {
  color: #e4e4e4;
}

.dark .markdown-body a {
  color: #58a6ff;
}

.dark .markdown-body blockquote {
  color: #8b949e;
  border-left-color: #3b434b;
}

.dark .markdown-body pre {
  background-color: #1e1e1e;
}

.dark .markdown-body code {
  background-color: rgba(240, 246, 252, 0.15);
}
</style> 