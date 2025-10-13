<template>
  <div
    v-if="visible && elementPosition"
    class="floating-toolbar"
    :style="toolbarStyle"
  >
    <!-- Edit Drawing Button -->
    <button
      v-if="elementType === 'image' && isDrawing"
      class="toolbar-btn"
      @click="$emit('edit-drawing')"
      title="Edit drawing"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
        <circle cx="11" cy="11" r="2"/>
      </svg>
    </button>
    
    <!-- Change Image Button -->
    <button
      v-if="elementType === 'image' && !isDrawing"
      class="toolbar-btn"
      @click="$emit('change-image')"
      title="Change image"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    </button>

    <!-- Text Format Button (for text elements) -->
    <button
      v-if="elementType === 'text'"
      class="toolbar-btn"
      @click="$emit('format-text')"
      title="Edit text"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    </button>

    <!-- Lock/Unlock Button -->
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

    <!-- Duplicate Button -->
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

    <!-- Delete Button -->
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
  elementType: {
    type: String,
    default: 'image',
    validator: (value) => ['image', 'text', 'emoji'].includes(value)
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isDrawing: {
    type: Boolean,
    default: false
  },
  isSticker: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'change-image',
  'edit-drawing',
  'format-text',
  'toggle-lock',
  'duplicate',
  'delete'
])

const toolbarStyle = computed(() => {
  if (!props.elementPosition) return { display: 'none' }
  
  return {
    position: 'absolute',
    top: `${props.elementPosition.y - 50}px`,
    left: `${props.elementPosition.x + (props.elementSize.width / 2)}px`,
    transform: 'translateX(-50%)',
    zIndex: 1000
  }
})
</script>

<style scoped>
.floating-toolbar {
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

.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.toolbar-btn.active {
  background: #3b82f6;
  color: white;
}

.toolbar-btn.delete-btn:hover {
  background: #ef4444;
  color: white;
}

.toolbar-btn svg {
  pointer-events: none;
}
</style>
