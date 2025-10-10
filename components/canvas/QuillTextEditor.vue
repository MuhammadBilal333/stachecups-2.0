<template>
  <ClientOnly>
    <div
      v-if="visible"
      class="quill-text-editor"
      :style="editorStyle"
    >
      <div ref="quillEditor" class="quill-container"></div>
      <div class="editor-hint">
  Press <kbd>Enter</kbd> to finish, <kbd>Esc</kbd> to cancel
</div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  autoFocus: {
    type: Boolean,
    default: true
  },
  content: {
    type: String,
    default: ''
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  fontSize: {
    type: Number,
    default: 16
  },
  fontFamily: {
    type: String,
    default: 'Roboto'
  },
  color: {
    type: String,
    default: '#000000'
  },
  width: {
    type: Number,
    default: 200
  },
  height: {
    type: Number,
    default: 50
  }
})


const emit = defineEmits([
  'content-change',
  'finish-editing',
  'cancel-editing',
  'error'
])

const quillEditor = ref(null)
let quillInstance = null
let resizeObserver = null

// Use a separate element to hold the toolbar
const toolbar = ref(null)

const editorStyle = computed(() => {
  if (props.position && typeof props.position.x === 'number' && typeof props.position.y === 'number') {
    return {
      position: 'fixed',
      left: `${props.position.x}px`,
      top: `${props.position.y}px`,
      width: `${props.width}px`,
      minHeight: `${props.height}px`,
      zIndex: 2000,
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '2px solid #3b82f6',
      overflow: 'hidden',
      resize: 'both',
      display: 'flex',
      flexDirection: 'column'
    }
  }
  
  return { display: 'none' }
})


const initializeQuill = async () => {
  if (!quillEditor.value || quillInstance) return

  try {
    const Quill = (await import('quill')).default
    await import('quill/dist/quill.snow.css')

    const quillOptions = {
      theme: 'snow',
      placeholder: 'Type your text here...',
      modules: {
        toolbar: false,
        keyboard: {
          bindings: {
            'enter': {
              key: 'Enter',
              shiftKey: false,
              handler: () => {
                emit('finish-editing', quillInstance.root.innerHTML)
                return false
              }
            },
            'shift_enter': {
              key: 'Enter',
              shiftKey: true,
              handler: function() {
                // Allow normal line break
                return true
              }
            }
          }
        }
      },
      formats: [
        'font', 'size', 'bold', 'italic', 'underline',
        'color', 'background', 'align'
      ]
    }

    quillInstance = new Quill(quillEditor.value, quillOptions)
    
    // Set initial content
    if (props.content) {
      quillInstance.root.innerHTML = props.content
    }
    
    // Apply initial formatting
    quillInstance.format('font', props.fontFamily)
    quillInstance.format('size', getQuillSize(props.fontSize))
    quillInstance.format('color', props.color)
    
    if (props.autoFocus) {
      quillInstance.focus()
      // Move cursor to end
      quillInstance.setSelection(quillInstance.getLength(), 0)
    }
    
    quillInstance.on('text-change', () => {
      emit('content-change', quillInstance.root.innerHTML)
      autoResizeEditor()
    })
    
    // Handle events
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    
    // Auto-resize
    resizeObserver = new ResizeObserver(autoResizeEditor)
    resizeObserver.observe(quillEditor.value)

  } catch (error) {
    emit('error', { type: 'initialization', message: 'Failed to initialize text editor', error })
  }
}

// Helper function to convert pixel size to Quill size
const getQuillSize = (pixelSize) => {
  if (pixelSize <= 12) return 'small'
  if (pixelSize <= 16) return false // normal
  if (pixelSize <= 20) return 'large'
  return 'huge'
}

// Improved auto-resize
const autoResizeEditor = () => {
  if (!quillInstance || !quillEditor.value) return
  
  const editor = quillEditor.value.querySelector('.ql-editor')
  if (editor) {
    const newHeight = Math.max(150, Math.min(400, editor.scrollHeight + 40))
    quillEditor.value.style.height = `${newHeight}px`
  }
}

// Improved click outside handler
const handleClickOutside = (event) => {
  if (!quillEditor.value) return
  
  const clickedElement = event.target
  const isToolbar = clickedElement.closest('.ql-toolbar')
  const isTooltip = clickedElement.closest('.ql-tooltip')
  const isEditor = quillEditor.value.contains(clickedElement)
  
  if (!isEditor && !isToolbar && !isTooltip) {
    emit('finish-editing', quillInstance?.root.innerHTML || '')
  }
}


const finishEditing = () => {
  if (quillInstance) {
    const content = quillInstance.root.innerHTML
    emit('content-change', content)
    emit('finish-editing', content)
  }
}

const cancelEditing = () => {
  if (quillInstance) {
    // Revert to original content or emit cancel
    quillInstance.root.innerHTML = props.content
    emit('cancel-editing')
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(initializeQuill)
  } else {
    if (quillInstance) {
      quillInstance = null
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('click', handleClickOutside)
  }
})

watch(() => props.content, (newContent) => {
  if (quillInstance && newContent !== quillInstance.root.innerHTML) {
    quillInstance.root.innerHTML = newContent
  }
})

watch(() => [props.fontSize, props.fontFamily, props.color], ([fontSize, fontFamily, color]) => {
  if (quillInstance) {
    quillInstance.format('size', `${fontSize}px`)
    quillInstance.format('font', fontFamily)
    quillInstance.format('color', color)
  }
})

onMounted(() => {
  if (props.visible) {
    nextTick(initializeQuill)
  }
})

onUnmounted(() => {
  if (quillInstance) {
    quillInstance = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('click', handleClickOutside)
})

const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    cancelEditing()
  }
}
</script>

<style scoped>
.quill-text-editor {
  pointer-events: auto;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid #3b82f6;
  border-radius: 4px;
  overflow: hidden;
  resize: both;
  min-width: 200px;
  min-height: 50px;
  max-height: 300px;
}

.quill-container {
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
}

/* Override Quill styles for better integration */
:deep(.ql-editor) {
  padding: 12px;
  font-size: inherit;
  line-height: 1.4;
  border: none;
  background-color: white;
  box-shadow: none;
  outline: none;
  flex: 1;
  overflow-y: auto;
  min-height: 30px;
  max-height: 250px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

:deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px 12px;
  background-color: #f8f9fa;
  flex-shrink: 0;
}

:deep(.ql-container) {
  border: none;
  font-size: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.ql-bubble .ql-tooltip) {
  z-index: 3000;
}

/* In QuillTextEditor.vue */
:deep(.ql-editor.ql-blank::before) {
  color: #9ca3af;
  font-style: italic;
  content: attr(data-placeholder);
}

:deep(.ql-editor:focus.ql-blank::before) {
  color: #6b7280;
}

:deep(.ql-bubble .ql-tooltip-arrow) {
  border-bottom-color: #fff;
}

:deep(.ql-bubble .ql-tooltip-editor) {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Resize handle styling */
.quill-text-editor::-webkit-resizer {
  background: #3b82f6;
  border-radius: 2px;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.quill-text-editor::-webkit-resizer:hover {
  background: #2563eb;
  transform: scale(1.1);
  transition: all 0.2s ease;
}

/* Add visual indicator for resize capability */
.quill-text-editor::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-bottom: 8px solid #3b82f6;
  pointer-events: none;
  opacity: 0.7;
}

.editor-hint {
  padding: 4px 8px;
  font-size: 11px;
  color: #6b7280;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.editor-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  font-size: 10px;
  font-family: monospace;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
