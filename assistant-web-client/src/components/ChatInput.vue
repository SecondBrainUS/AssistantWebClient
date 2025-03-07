<template>
  <div class="flex flex-col">
    <!-- File preview area -->
    <div v-if="attachedFiles.length > 0" class="mb-2 p-2 bg-gray-800 rounded-lg">
      <div class="flex flex-wrap gap-2">
        <div v-for="(file, index) in attachedFiles" :key="index" class="relative group">
          <!-- File preview -->
          <div class="w-20 h-20 border border-gray-600 rounded flex items-center justify-center bg-gray-700 overflow-hidden">
            <!-- Image preview -->
            <img v-if="isImageFile(file)" :src="file.previewUrl" alt="Preview" class="max-w-full max-h-full object-cover" />
            
            <!-- Icons for other file types -->
            <FileIcon v-else-if="getFileType(file) === 'pdf'" class="h-8 w-8 text-red-400" />
            <FileSpreadsheet v-else-if="getFileType(file) === 'spreadsheet'" class="h-8 w-8 text-green-400" />
            <FileText v-else-if="getFileType(file) === 'text'" class="h-8 w-8 text-blue-400" />
            <FileCode v-else-if="getFileType(file) === 'code'" class="h-8 w-8 text-yellow-400" />
            <File v-else class="h-8 w-8 text-gray-400" />
          </div>
          
          <!-- File name tooltip -->
          <div class="bg-gray-900 text-xs p-1 absolute bottom-0 left-0 right-0 truncate text-center">
            {{ getDisplayName(file.name) }}
          </div>
          
          <!-- Upload status indicator -->
          <div class="absolute top-0 right-0">
            <div v-if="file.status === 'uploading'" class="bg-yellow-500 rounded-full p-1 animate-pulse">
              <Loader class="h-3 w-3 text-white" />
            </div>
            <div v-else-if="file.status === 'error'" class="bg-red-500 rounded-full p-1 cursor-pointer" @click="retryUpload(file)">
              <AlertCircle class="h-3 w-3 text-white" />
            </div>
            <div v-else-if="file.status === 'uploaded'" class="bg-green-500 rounded-full p-1">
              <Check class="h-3 w-3 text-white" />
            </div>
          </div>
          
          <!-- Delete button (appears on hover) -->
          <button 
            @click="removeFile(index)" 
            class="absolute top-0 right-0 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            :class="{'hidden': file.status === 'uploading'}"
          >
            <X class="h-3 w-3 text-white" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Drag and drop overlay -->
    <div 
      v-if="isDragging" 
      class="absolute inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-10 border-2 border-dashed border-blue-400 rounded-lg"
    >
      <div class="text-center">
        <Upload class="h-12 w-12 text-blue-400 mx-auto mb-2" />
        <p class="text-white">Drop files here</p>
      </div>
    </div>
    
    <!-- Input and controls wrapper -->
    <div 
      class="flex-1 relative bg-gray-800 rounded-lg flex items-center"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleFileDrop"
    >
      <textarea
        v-model="messageText"
        ref="textareaRef"
        rows="1"
        class="flex-grow bg-transparent p-4 pr-36 focus:outline-none resize-none max-h-[144px] overflow-y-auto"
        :placeholder="placeholder"
        @keyup.enter="handleEnter"
        @input="adjustTextareaHeight"
      ></textarea>
      
      <!-- Attach Button -->
      <button 
        @click="triggerFileInput"
        class="p-2 rounded-lg flex items-center justify-center hover:bg-gray-700 text-white"
      >
        <Paperclip class="h-6 w-6" />
      </button>
      
      <!-- Hidden file input -->
      <input 
        type="file" 
        ref="fileInput" 
        class="hidden" 
        multiple 
        @change="handleFileInput" 
      />
      
      <!-- Send/Stop Button -->
      <button 
        @click="isProcessing ? handleStopProcessing() : handleSend()" 
        class="p-2 rounded-lg flex items-center justify-center text-white"
        :class="{'hover:bg-gray-700': !isUploading, 'opacity-50 cursor-not-allowed': isUploading && !isProcessing}"
        :disabled="isUploading && !isProcessing"
        :title="isUploading ? 'Please wait for files to finish uploading' : ''"
      >
        <XCircle v-if="isProcessing" class="h-6 w-6 text-red-500" />
        <Send v-else class="h-6 w-6" :class="{'text-gray-400': isUploading}" />
      </button>
      
      <!-- Record Button -->
      <button 
        @click="isRecording ? stopRecording() : startRecording()" 
        class="p-2 mr-2 rounded-lg flex items-center justify-center hover:bg-gray-700 text-white"
      >
        <template v-if="isRecording">
          <Square class="h-6 w-6 text-red-500" />
        </template>
        <template v-else>
          <Mic class="h-6 w-6 text-white" />
        </template>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { 
  Send, 
  Mic, 
  Square, 
  XCircle, 
  Paperclip, 
  File, 
  FileText, 
  FileIcon, 
  X, 
  FileSpreadsheet, 
  FileCode,
  Upload,
  Loader,
  AlertCircle,
  Check
} from 'lucide-vue-next'
import baseApi from '../utils/baseApi';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Send a message'
  },
  initialText: {
    type: String,
    default: ''
  },
  startRecordingOnMount: {
    type: Boolean,
    default: false
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  chatId: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'send', 
  'startRecording', 
  'stopRecording', 
  'stopProcessing',
  'fileAttached',
  'fileRemoved'
])

const textareaRef = ref(null)
const fileInput = ref(null)
const isRecording = ref(false)
const messageText = ref(props.initialText)
const attachedFiles = ref([])
const isDragging = ref(false)
const dragCounter = ref(0)

// Add a computed property to check if any files are uploading
const isUploading = computed(() => {
  return attachedFiles.value.some(file => file.status === 'uploading')
})

// TODO: should remove, no prop mutations
watch(() => props.initialText, (newVal) => {
  messageText.value = newVal
})

onMounted(() => {
  if (props.startRecordingOnMount) {
    startRecording()
  }
  // Initial height adjustment
  adjustTextareaHeight()
  
  // Add global event listeners for drag and drop
  document.addEventListener('dragenter', preventDefaults)
  document.addEventListener('dragover', preventDefaults)
  document.addEventListener('dragleave', preventDefaults)
  document.addEventListener('drop', preventDefaults)
})

onUnmounted(() => {
  // Remove global event listeners
  document.removeEventListener('dragenter', preventDefaults)
  document.removeEventListener('dragover', preventDefaults)
  document.removeEventListener('dragleave', preventDefaults)
  document.removeEventListener('drop', preventDefaults)
})

function preventDefaults(e) {
  e.preventDefault()
  e.stopPropagation()
}

function adjustTextareaHeight() {
  const textarea = textareaRef.value
  if (!textarea) return
  
  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto'
  
  // Calculate the height of one row (assuming default line-height)
  const lineHeight = 24 // approximate line height in pixels
  const maxHeight = lineHeight * 6 // 6 rows maximum
  
  // Set the height to either the scrollHeight or maxHeight, whichever is smaller
  const newHeight = Math.min(textarea.scrollHeight, maxHeight)
  textarea.style.height = `${newHeight}px`
}

function handleSend() {
  if (!messageText.value.trim() && attachedFiles.value.length === 0) return
  if (isUploading.value) return // Prevent sending if files are still uploading
  
  // Get IDs of successfully uploaded files
  const fileIds = attachedFiles.value
    .filter(file => file.status === 'uploaded')
    .map(file => file.fileId)
  
  emit('send', messageText.value, fileIds)
  messageText.value = ''
  attachedFiles.value = []
}

function handleEnter(e) {
  if (e.shiftKey) return
  e.preventDefault()
  handleSend()
}

function startRecording() {
  isRecording.value = true
  emit('startRecording')
}

function stopRecording() {
  isRecording.value = false
  emit('stopRecording')
}

function handleStopProcessing() {
  emit('stopProcessing')
}

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileInput(e) {
  const files = Array.from(e.target.files)
  if (files.length === 0) return
  
  // Process each file
  files.forEach(file => processFile(file))
  
  // Reset the file input
  e.target.value = null
}

function handleDragLeave(e) {
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

function handleFileDrop(e) {
  isDragging.value = false
  dragCounter.value = 0
  
  const files = Array.from(e.dataTransfer.files)
  if (files.length === 0) return
  
  // Process each file
  files.forEach(file => processFile(file))
}

function processFile(file) {
  // Create a preview URL for images
  const previewUrl = isImageFile(file) ? URL.createObjectURL(file) : null
  
  // Add file to the array with status
  const fileObj = {
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    previewUrl,
    status: 'uploading',
    progress: 0,
    fileId: null,
    retries: 0
  }
  
  attachedFiles.value.push(fileObj)
  
  // Upload the file
  uploadFile(fileObj)
}

async function uploadFile(fileObj) {
  try {
    const formData = new FormData()
    formData.append('files', fileObj.file)
    
    const index = attachedFiles.value.findIndex(f => f.name === fileObj.name && f.size === fileObj.size)
    if (index === -1) return
    
    attachedFiles.value[index].status = 'uploading'
    
    const response = await baseApi.post(`/chat/${props.chatId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // Update file object with server response
    if (response.data && response.data.length > 0) {
      const uploadedFile = response.data[0]
      attachedFiles.value[index].status = 'uploaded'
      attachedFiles.value[index].fileId = uploadedFile.fileid
      
      // Emit event to parent
      emit('fileAttached', {
        fileId: uploadedFile.fileid,
        fileName: uploadedFile.filename,
        fileSize: uploadedFile.size,
        fileType: uploadedFile.content_type,
        uploadedAt: uploadedFile.uploaded_at
      })
    }
  } catch (error) {
    console.error('File upload error:', error)
    
    const index = attachedFiles.value.findIndex(f => f.name === fileObj.name && f.size === fileObj.size)
    if (index !== -1) {
      attachedFiles.value[index].status = 'error'
      attachedFiles.value[index].error = error.message || 'Upload failed'
    }
  }
}

function retryUpload(fileObj) {
  const index = attachedFiles.value.findIndex(f => f.name === fileObj.name && f.size === fileObj.size)
  if (index === -1) return
  
  fileObj.retries++
  uploadFile(fileObj)
}

async function removeFile(index) {
  const fileObj = attachedFiles.value[index]
  
  // If file is uploaded, delete from server
  if (fileObj.status === 'uploaded' && fileObj.fileId) {
    try {
      await baseApi.delete(`/chat/${props.chatId}/files/${fileObj.fileId}`)
      
      // Emit event to parent
      emit('fileRemoved', fileObj.fileId)
    } catch (error) {
      console.error('File deletion error:', error)
      // Continue with removal from UI even if server deletion fails
    }
  }
  
  // Remove preview URL to avoid memory leaks
  if (fileObj.previewUrl) {
    URL.revokeObjectURL(fileObj.previewUrl)
  }
  
  // Remove from array
  attachedFiles.value.splice(index, 1)
}

function isImageFile(file) {
  return file.type && file.type.startsWith('image/')
}

function getFileType(file) {
  const extension = file.name.split('.').pop().toLowerCase()
  
  if (file.type && file.type.startsWith('image/')) {
    return 'image'
  } else if (extension === 'pdf' || file.type === 'application/pdf') {
    return 'pdf'
  } else if (['csv', 'xlsx', 'xls'].includes(extension) || 
             ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type)) {
    return 'spreadsheet'
  } else if (['txt', 'rtf', 'doc', 'docx'].includes(extension) || 
             ['text/plain', 'application/rtf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
    return 'text'
  } else if (['js', 'py', 'java', 'html', 'css', 'php', 'c', 'cpp', 'json', 'xml'].includes(extension)) {
    return 'code'
  }
  
  return 'generic'
}

function getDisplayName(filename) {
  // Limit to 10 characters with ellipsis
  return filename.length > 10 ? filename.substring(0, 7) + '...' : filename
}
</script>
