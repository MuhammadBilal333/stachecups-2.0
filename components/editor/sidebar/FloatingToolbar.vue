<template>
  <div v-if="visible && elementPosition" class="floating-toolbar" :style="toolbarStyle">
    <button
      v-if="elementType === 'image' && isDrawing"
      class="toolbar-btn"
      @click="$emit('edit-drawing')"
      title="Edit drawing"
    >
      <Edit3 class="w-5 h-5" />
    </button>
    
    <button
      v-if="elementType === 'image' && !isDrawing && !isSticker"
      class="toolbar-btn"
      @click="$emit('change-image')"
      title="Change image"
    >
      <Image class="w-5 h-5" />
    </button>

    <button
      v-if="elementType === 'image' && !isDrawing && !isSticker && !hasFrame"
      class="toolbar-btn add-frame-btn"
      @click="$emit('add-frame')"
      title="Add frame"
    >
      <CirclePlus class="w-5 h-5" />
    </button>

    <button
      v-if="elementType === 'image' && !isDrawing && !isSticker && hasFrame"
      class="toolbar-btn remove-frame-btn"
      @click="$emit('remove-frame')"
      title="Remove frame"
    >
      <CircleMinus class="w-5 h-5" />
    </button>

    <button
      v-if="elementType === 'text'"
      class="toolbar-btn"
      @click="$emit('format-text')"
      title="Edit text"
    >
      <Type class="w-5 h-5" />
    </button>

    <button
      class="toolbar-btn"
      :class="{ active: isLocked }"
      @click="$emit('toggle-lock')"
      :title="isLocked ? 'Unlock' : 'Lock'"
    >
      <Lock v-if="!isLocked" class="w-5 h-5" />
      <Unlock v-else class="w-5 h-5" />
    </button>

    <button
      class="toolbar-btn"
      @click="$emit('duplicate')"
      title="Duplicate"
    >
      <Copy class="w-5 h-5" />
    </button>

    <button
      class="toolbar-btn delete-btn"
      @click="$emit('delete')"
      title="Delete"
    >
      <Trash2 class="w-5 h-5" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Edit3, Image, CirclePlus, CircleMinus, Type, Lock, Unlock, Copy, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  visible: { type: Boolean, default: false },
  elementPosition: { type: Object, default: null },
  elementSize: { type: Object, default: () => ({ width: 0, height: 0 }) },
  elementType: { 
    type: String, 
    default: 'image',
    validator: (value) => ['image', 'text', 'emoji'].includes(value)
  },
  isLocked: { type: Boolean, default: false },
  isDrawing: { type: Boolean, default: false },
  isSticker: { type: Boolean, default: false },
  hasFrame: { type: Boolean, default: false }
})

const emit = defineEmits([
  'change-image',
  'edit-drawing',
  'format-text',
  'toggle-lock',
  'duplicate',
  'delete',
  'add-frame',
  'remove-frame'
])

const toolbarStyle = computed(() => {
  if (!props.elementPosition) return { display: 'none' }
  
  const topPosition = Math.max(10, props.elementPosition.y - 60)
  
  return {
    position: 'absolute',
    top: `${topPosition}px`,
    left: `${props.elementPosition.x + (props.elementSize.width / 2)}px`,
    transform: 'translateX(-50%)',
    zIndex: 1000
  }
})
</script>

<style scoped>
.floating-toolbar {
  @apply absolute bg-white/95 backdrop-blur-lg rounded-xl shadow-lg flex items-center p-1.5 gap-1 border border-white/20;
}

.toolbar-btn {
  @apply w-8 h-8 border-0 bg-transparent rounded-md flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 hover:bg-black/5 hover:text-gray-700;
}

.toolbar-btn.active {
  @apply bg-blue-500 text-white;
}

.remove-frame-btn {
  @apply text-red-500 hover:bg-red-50 hover:text-red-600;
}

.add-frame-btn {
  @apply text-purple-500 hover:bg-purple-50 hover:text-purple-600;
}

.delete-btn:hover {
  @apply bg-red-500 text-white;
}

</style>
