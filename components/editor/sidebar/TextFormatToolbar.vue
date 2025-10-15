<template>
  <div
    v-if="visible && elementPosition"
    class="text-format-toolbar"
    :style="toolbarStyle"
  >
    <!-- Action Buttons Group -->
    <div class="toolbar-group">
      <button
        class="toolbar-btn"
        @click="$emit('edit-text')"
        title="Edit text"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>

      <button
        class="toolbar-btn"
        :class="{ active: isLocked }"
        @click="$emit('toggle-lock')"
        :title="isLocked ? 'Unlock' : 'Lock'"
      >
        <svg v-if="!isLocked" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        </svg>
      </button>

      <button
        class="toolbar-btn"
        @click="$emit('duplicate')"
        title="Duplicate"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>

      <button
        class="toolbar-btn delete-btn"
        @click="$emit('delete')"
        title="Delete"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"/>
          <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      </button>
    </div>

    <!-- Formatting Group -->
    <div class="toolbar-group">
      <!-- Text Formatting Buttons -->
      <div class="formatting-buttons">
        <button
          class="toolbar-btn"
          :class="{ active: isBold }"
          @click="toggleBold"
          title="Bold"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
          </svg>
        </button>

        <button
          class="toolbar-btn"
          :class="{ active: isItalic }"
          @click="toggleItalic"
          title="Italic"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="4" x2="10" y2="4"/>
            <line x1="14" y1="20" x2="5" y2="20"/>
            <line x1="15" y1="4" x2="9" y2="20"/>
          </svg>
        </button>

        <button
          class="toolbar-btn"
          :class="{ active: isUnderline }"
          @click="toggleUnderline"
          title="Underline"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
            <line x1="4" y1="21" x2="20" y2="21"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  elementPosition: {
    type: Object,
    default: null
  },
  elementSize: {
    type: Object,
    default: () => ({ width: 0, height: 0 })
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isBold: {
    type: Boolean,
    default: false
  },
  isItalic: {
    type: Boolean,
    default: false
  },
  isUnderline: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'edit-text',
  'toggle-lock',
  'duplicate',
  'delete',
  'bold-change',
  'italic-change',
  'underline-change'
])

const toolbarStyle = computed(() => {
  if (!props.elementPosition) return { display: 'none' }

  const toolbarWidth = 150
  const elementWidth = props.elementSize?.width || 100 
  const halfElement = elementWidth / 2

  // Check edges properly
  const isNearLeftEdge = props.elementPosition.x - halfElement < toolbarWidth / 2
  const isNearRightEdge = props.elementPosition.x + halfElement > (798 - toolbarWidth / 2)

  let style = {
    position: 'absolute',
    top: `${props.elementPosition.y - 80}px`,
    zIndex: 10
  }

  if (isNearLeftEdge) {
    // Align to left edge
    style.left = '10px'
    style.transform = 'none'
  } else if (isNearRightEdge) {
    // Align to right edge
    style.right = '10px'
    style.transform = 'none'
  } else {
    // Center on element
    style.left = `${props.elementPosition.x + halfElement}px`
    style.transform = 'translateX(-50%)'
  }

  return style
})

const toggleBold = () => {
  emit('bold-change', !props.isBold)
}

const toggleItalic = () => {
  emit('italic-change', !props.isItalic)
}

const toggleUnderline = () => {
  emit('underline-change', !props.isUnderline)
}
</script>

<style scoped>
.text-format-toolbar {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  padding: 6px;
  gap: 4px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
}

.toolbar-group:not(:last-child) {
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  padding-right: 8px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4b5563;
  transition: all 0.15s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.toolbar-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.toolbar-btn.active {
  background: #3b82f6;
  color: white;
}

.toolbar-btn.delete-btn:hover {
  background: #ef4444;
  color: white;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.toolbar-btn svg {
  pointer-events: none;
}

/* Formatting Buttons */
.formatting-buttons {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  padding: 2px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}


</style>