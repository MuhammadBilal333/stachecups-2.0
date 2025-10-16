<template>
  <div class="fixed top-0 left-0 right-0 h-14 sm:h-16 md:h-[72px] bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-lg border-b border-[#1EADB0]/10 z-50 flex items-center justify-between px-2 sm:px-4 md:px-8 shadow-lg">
    <!-- Left Section -->
    <div class="flex items-center flex-1 min-w-0">
      <div class="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#1EADB0]/5 to-[#4B5574]/5 border border-[#1EADB0]/10 transition-all duration-300 hover:from-[#1EADB0]/10 hover:to-[#4B5574]/10 hover:border-[#1EADB0]/20 hover:shadow-md group">
        <div class="hidden sm:flex items-center justify-center text-[#1EADB0]">
          <q-icon name="mdi-palette" size="18px" class="sm:size-5" />
        </div>
        <input
          v-model="designName"
          type="text"
          class="b-0 outline-none bg-transparent text-xs sm:text-sm md:text-base font-semibold text-gray-800 w-16 sm:w-24 md:w-48 focus:cursor-text cursor-pointer"
          placeholder="Untitled Design"
          @blur="handleDesignNameChange"
          @keydown.enter="$event.target.blur()"
        />
        <q-btn
          flat
          dense
          round
          icon="edit"
          size="xs"
          class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#1EADB0] hidden sm:inline-flex"
        >
          <q-tooltip>Rename</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Center Section - Zoom & History Controls -->
    <div class="flex items-center justify-center">
      <div class="flex items-center gap-2 sm:gap-4 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
        <!-- Zoom Controls (hidden on mobile) -->
        <div class="hidden sm:flex items-center gap-1 sm:gap-2">
          <q-btn
            flat
            dense
            round
            icon="remove"
            size="sm"
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[#1EADB0] hover:bg-[#1EADB0]/10 transition-all"
            :disable="zoom <= 0.25"
            @click="$emit('zoom-out')"
          >
            <q-tooltip>Zoom Out</q-tooltip>
          </q-btn>
          <div class="bg-gradient-to-br from-[#1EADB0]/10 to-[#4B5574]/10 px-2 sm:px-3 py-1 rounded-md border border-[#1EADB0]/20">
            <span class="text-xs sm:text-sm font-semibold text-[#1EADB0] min-w-[40px] sm:min-w-[48px] text-center select-none">{{ zoomPercentage }}%</span>
          </div>
          <q-btn
            flat
            dense
            round
            icon="add"
            size="sm"
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[#1EADB0] hover:bg-[#1EADB0]/10 transition-all"
            :disable="zoom >= 2"
            @click="$emit('zoom-in')"
          >
            <q-tooltip>Zoom In</q-tooltip>
          </q-btn>
        </div>

        <!-- History Controls -->
        <div class="flex items-center gap-0.5 sm:gap-1">
          <q-btn
            flat
            dense
            round
            icon="undo"
            size="sm"
            class="w-8 h-8 rounded-lg text-gray-600 hover:bg-[#1EADB0]/10 hover:text-[#1EADB0] transition-all disabled:text-gray-300"
            :disable="!canUndo"
            @click="$emit('undo')"
          >
            <q-tooltip>Undo</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="redo"
            size="sm"
            class="w-8 h-8 rounded-lg text-gray-600 hover:bg-[#1EADB0]/10 hover:text-[#1EADB0] transition-all disabled:text-gray-300"
            :disable="!canRedo"
            @click="$emit('redo')"
          >
            <q-tooltip>Redo</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Right Section -->
    <div class="flex items-center justify-end flex-1 gap-1.5 sm:gap-2 md:gap-3">
      <!-- Share Button - Icon only on mobile, with label on desktop -->
      <q-btn
        flat
        no-caps
        icon="link"
        class="text-gray-600 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 hover:text-gray-800"
        @click="$emit('share-design')"
      >
        <span class="hidden md:inline ml-1">Share</span>
        <q-tooltip>Share Design Link</q-tooltip>
      </q-btn>

      <q-btn
        flat
        no-caps
        icon="download"
        class="text-gray-600 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 hover:text-gray-800"
        @click="$emit('download')"
      >
        <q-tooltip>Download Design</q-tooltip>
      </q-btn>

      <q-btn
        unelevated
        no-caps
        label="Done"
        class="bg-gradient-to-br from-purple-600 to-indigo-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all"
        @click="$emit('publish')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  zoom: {
    type: Number,
    default: 1
  },
  modelValue: {
    type: String,
    default: 'Untitled Design'
  }
})

const emit = defineEmits(['zoom-in', 'zoom-out', 'undo', 'redo', 'download', 'publish', 'share-design', 'update:modelValue', 'design-name-change'])

const designName = ref(props.modelValue || 'Untitled Design')
const zoomPercentage = computed(() => Math.round(props.zoom * 100))

const handleDesignNameChange = () => {
  const name = designName.value.trim() || 'Untitled Design'
  designName.value = name
  emit('update:modelValue', name)
  emit('design-name-change', name)
}
</script>
