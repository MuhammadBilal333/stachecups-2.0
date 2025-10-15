<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <div class="project-title-container">
        <div class="title-icon">
          <q-icon name="mdi-palette" size="20px" />
        </div>
        <input
          v-model="designName"
          type="text"
          class="project-title-input"
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
          class="edit-icon"
        >
          <q-tooltip>Rename</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div class="top-bar-center">
      <div class="zoom-controls">
        <div class="zoom-section">
          <q-btn
            flat
            dense
            round
            icon="remove"
            size="sm"
            class="zoom-btn"
            :disable="zoom <= 0.25"
            @click="$emit('zoom-out')"
          >
            <q-tooltip>Zoom Out</q-tooltip>
          </q-btn>
          <div class="zoom-display">
            <span class="zoom-text">{{ zoomPercentage }}%</span>
          </div>
          <q-btn
            flat
            dense
            round
            icon="add"
            size="sm"
            class="zoom-btn"
            :disable="zoom >= 2"
            @click="$emit('zoom-in')"
          >
            <q-tooltip>Zoom In</q-tooltip>
          </q-btn>
        </div>
        
        <div class="history-controls">
          <q-btn
            flat
            dense
            round
            icon="undo"
            size="sm"
            class="history-btn"
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
            class="history-btn"
            :disable="!canRedo"
            @click="$emit('redo')"
          >
            <q-tooltip>Redo</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <div class="top-bar-right">
      <q-btn
        flat
        no-caps
        icon="link"
        label="Share"
        class="share-btn"
        @click="$emit('share-design')"
      >
        <q-tooltip>Share Design Link</q-tooltip>
      </q-btn>

      <q-btn
        flat
        no-caps
        icon="download"
        class="download-btn"
        @click="$emit('download')"
      >
        <q-tooltip>Download Design</q-tooltip>
      </q-btn>

      <q-btn
        unelevated
        no-caps
        label="Done"
        class="publish-btn"
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

<style scoped>
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(30, 173, 176, 0.1);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Left Section */
.top-bar-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.project-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(30, 173, 176, 0.05) 0%, rgba(75, 85, 116, 0.05) 100%);
  border: 1px solid rgba(30, 173, 176, 0.1);
  transition: all 0.3s ease;
}

.project-title-container:hover {
  background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  border-color: rgba(30, 173, 176, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 173, 176, 0.15);
}

.title-icon {
  color: #1EADB0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-title-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  width: 200px;
  cursor: pointer;
}

.project-title-input:focus {
  cursor: text;
}

.edit-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #1EADB0;
}

.project-title-container:hover .edit-icon {
  opacity: 1;
}

/* Center Section */
.top-bar-center {
  flex: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.zoom-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-display {
  background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid rgba(30, 173, 176, 0.2);
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #1EADB0;
  transition: all 0.2s ease;
}

.zoom-btn:hover:not([disabled]) {
  background: rgba(30, 173, 176, 0.1);
  transform: scale(1.05);
}

.zoom-btn[disabled] {
  color: #d1d5db;
}

.zoom-text {
  font-size: 13px;
  font-weight: 600;
  color: #1EADB0;
  min-width: 48px;
  text-align: center;
  user-select: none;
}

.history-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.history-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.history-btn:hover:not([disabled]) {
  background: rgba(30, 173, 176, 0.1);
  color: #1EADB0;
  transform: scale(1.05);
}

.history-btn[disabled] {
  color: #d1d5db;
}

/* Right Section */
.top-bar-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.action-btn[disabled] {
  opacity: 0.4;
}

.share-btn {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
}

.share-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.download-btn {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
}

.download-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.publish-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.3);
  transition: all 0.2s ease;
}

.publish-btn:hover {
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .top-bar {
    left: 0;
    padding: 0 16px;
  }

  .project-title-input {
    width: 120px;
  }

  .share-btn span {
    display: none;
  }
}
</style>
