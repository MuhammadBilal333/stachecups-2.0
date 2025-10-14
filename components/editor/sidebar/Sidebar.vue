<template>
  <div>
    <div
      v-if="!isMobile"
      class="fixed left-0 top-0 h-screen w-20 bg-white border-r border-gray-200 flex flex-col z-40 shadow-sm"
    >
      <div class="px-4 py-5 border-b border-gray-100 flex items-center justify-center">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-base">SC</span>
        </div>
      </div>

      <div class="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'stickers' }"
            @click="toggleMenu('stickers')"
          >
            <Sticker class="w-6 h-6" :class="activeMenu === 'stickers' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'stickers'">
            Stickers
          </q-tooltip>

          <div
            v-if="activeMenu === 'stickers'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Stickers</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-4 py-4">
              <toolbar-sticker-picker @select="handleStickerSelect" />
            </div>
          </div>
        </div>

        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'emoji' }"
            @click="toggleMenu('emoji')"
          >
            <Smile class="w-6 h-6" :class="activeMenu === 'emoji' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'emoji'">
            Elements
          </q-tooltip>

          <div
            v-if="activeMenu === 'emoji'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-900">Elements</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-4 py-4 emoji-picker-wrapper">
              <EmojiPicker :native="true" @select="handleEmojiSelect" />
            </div>
          </div>
        </div>

        <div
          class="relative sidebar-item"
        >
          <button
            class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-all duration-200"
            :class="{ 'bg-purple-50 text-purple-700': activeMenu === 'background' }"
            @click="toggleMenu('background')"
          >
            <Palette class="w-6 h-6" :class="activeMenu === 'background' ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          </button>
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]" v-if="activeMenu !== 'background'">
            Background
          </q-tooltip>

          <div
            v-if="activeMenu === 'background'"
            class="fixed top-16 left-20 w-80 h-[calc(100vh-4rem)] bg-white border border-gray-200 shadow-xl z-50 flex flex-col rounded-r-lg overflow-hidden"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 class="text-lg font-semibold text-gray-900">Background</h3>
              <button @click="closeMenu" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
                <X class="w-5 h-5" :stroke-width="2" />
              </button>
            </div>
            <div class="flex-1 overflow-hidden">
              <BackgroundPicker />
            </div>
          </div>
        </div>

        <button
          class="w-full h-14 rounded-xl flex items-center justify-center transition-all duration-200"
          :class="textToolActive ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-100 text-gray-700'"
          @click="activateTextTool"
        >
          <Type class="w-6 h-6" :class="textToolActive ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Text
          </q-tooltip>
        </button>

        <button
          class="w-full h-14 rounded-xl flex items-center justify-center transition-all duration-200"
          :class="drawToolActive ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-100 text-gray-700'"
          @click="activateDrawTool"
        >
          <PenTool class="w-6 h-6" :class="drawToolActive ? 'text-purple-600' : 'text-gray-600'" :stroke-width="2" />
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Draw
          </q-tooltip>
        </button>

        <button
          class="w-full h-14 rounded-xl flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-all duration-200"
          @click="fileInputRef?.pickFiles()"
        >
          <Upload class="w-6 h-6 text-gray-600" :stroke-width="2" />
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Upload
          </q-tooltip>
        </button>
      </div>

      <div class="px-2 pb-6">
        <div class="h-px bg-gray-200 mb-4"></div>

        <button
          class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
          @click="handleCheckout"
        >
          <ShoppingCart class="w-5 h-5" :stroke-width="2.5" />
          <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
            Done
          </q-tooltip>
        </button>
      </div>
    </div>

    <div 
      v-else
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 shadow-lg"
    >
      <div class="flex items-center justify-around px-2 py-3">
        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="activeMenu === 'stickers' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('stickers')"
        >
          <Sticker class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Stickers</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="activeMenu === 'emoji' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('emoji')"
        >
          <Smile class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Elements</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="activeMenu === 'background' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="toggleMenu('background')"
        >
          <Palette class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">BG</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="textToolActive ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="activateTextTool"
        >
          <Type class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Text</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg transition-all"
          :class="drawToolActive ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-50'"
          @click="activateDrawTool"
        >
          <PenTool class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Draw</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg hover:bg-gray-50 transition-all"
          @click="fileInputRef?.pickFiles()"
        >
          <Upload class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-medium">Upload</span>
        </button>

        <button
          class="flex flex-col items-center justify-center w-16 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white transition-all"
          @click="handleCheckout"
        >
          <ShoppingCart class="w-5 h-5 mb-1" :stroke-width="2" />
          <span class="text-xs font-semibold">Done</span>
        </button>
      </div>
    </div>

    <div v-if="isMobile && activeMenu" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end" @click="activeMenu = null">
      <div class="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-auto p-6" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">
            {{ activeMenu === 'stickers' ? 'Stickers' : 
               activeMenu === 'emoji' ? 'Elements' : 
               activeMenu === 'background' ? 'Background' : '' }}
          </h3>
          <button @click="activeMenu = null" class="text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-6 h-6" :stroke-width="2" />
          </button>
        </div>
        
        <toolbar-sticker-picker v-if="activeMenu === 'stickers'" @select="handleStickerSelect" />
        <EmojiPicker v-else-if="activeMenu === 'emoji'" :native="true" @select="handleEmojiSelect" />
        <BackgroundPicker v-else-if="activeMenu === 'background'" />
      </div>
    </div>

    <q-file
      ref="fileInputRef"
      v-model="fileInput"
      style="display: none"
      accept="image/*"
      @update:model-value="handleFileSelected"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';
import {
  Sticker,
  Smile,
  Type,
  PenTool,
  Upload,
  ShoppingCart,
  X,
  Palette
} from 'lucide-vue-next';
import ToolbarStickerPicker from '~/components/editor/pickers/StickerPicker.vue';
import BackgroundPicker from '~/components/editor/pickers/BackgroundPicker.vue';

// Quasar setup
const $q = useQuasar();

// Props
defineProps({
  textToolActive: {
    type: Boolean,
    default: false,
  },
  drawToolActive: {
    type: Boolean,
    default: false,
  }
});

// Emits
const emit = defineEmits(['upload', 'activate-text-tool', 'activate-draw-tool', 'add-emoji', 'checkout', 'add-image']);

// State
const fileInput = ref(null);
const fileInputRef = ref(null);
const activeMenu = ref(null);

// Computed
const isMobile = computed(() => $q.screen.lt.md);

// Methods
const closeMenu = () => {
  activeMenu.value = null;
};

const toggleMenu = (menu) => {
  // Simple toggle: if menu is already open, close it; otherwise open it
  if (activeMenu.value === menu) {
    activeMenu.value = null;
  } else {
    activeMenu.value = menu;
  }
};

const activateTextTool = () => {
  emit('activate-text-tool');
};

const activateDrawTool = () => {
  emit('activate-draw-tool');
};

const handleFileSelected = (file) => {
  if (file) {
    emit('upload', file);
    nextTick(() => {
      fileInput.value = null;
    });
  }
};

const handleEmojiSelect = (emoji) => {
  emit('add-emoji', emoji);
  activeMenu.value = null;
};

const handleStickerSelect = (sticker) => {
  emit('add-image', sticker);
  activeMenu.value = null;
};

const handleCheckout = () => {
  emit('checkout');
};
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, width;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slide-in {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
.emoji-picker-wrapper :deep(.v3-emoji-picker) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.emoji-picker-wrapper :deep(.v3-header) {
  padding: 12px 0 !important;
  border-bottom: 1px solid #e5e7eb !important;
  margin-bottom: 12px !important;
}

.emoji-picker-wrapper :deep(.v3-search) {
  background: #f5f5f5 !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 10px 12px !important;
  font-size: 14px !important;
}

.emoji-picker-wrapper :deep(.v3-search:focus) {
  outline: none !important;
  border: 1px solid #a855f7 !important;
}

.emoji-picker-wrapper :deep(.v3-group) {
  padding: 4px 0 !important;
}

.emoji-picker-wrapper :deep(.v3-group-title) {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #374151 !important;
  padding: 8px 0 !important;
  margin-bottom: 8px !important;
}

.emoji-picker-wrapper :deep(.v3-emoji) {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  cursor: pointer !important;
  padding: 8px !important;
}

.emoji-picker-wrapper :deep(.v3-emoji:hover) {
  background: #faf5ff !important;
  transform: scale(1.2) !important;
}

.emoji-picker-wrapper :deep(.v3-tabs) {
  border-top: 1px solid #e5e7eb !important;
  padding-top: 12px !important;
  margin-top: 12px !important;
}

.emoji-picker-wrapper :deep(.v3-tab) {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.emoji-picker-wrapper :deep(.v3-tab:hover) {
  background: #f3f4f6 !important;
}

.emoji-picker-wrapper :deep(.v3-tab-active) {
  background: #faf5ff !important;
}
</style>
