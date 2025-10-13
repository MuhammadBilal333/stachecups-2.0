<template>
  <div class="top-bar">
    <!-- Left Section: Title & Actions -->
    <div class="top-bar-left">
      <div class="project-title-container">
        <input
          type="text"
          class="project-title-input"
          value="Untitled Design"
          placeholder="Untitled Design"
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

    <!-- Center Section: Zoom & View Controls -->
    <div class="top-bar-center">
      <div class="zoom-controls">
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
        <span class="zoom-text">{{ zoomPercentage }}%</span>
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
    </div>

    <!-- Right Section: Actions -->
    <div class="top-bar-right">
      <!-- Undo/Redo -->
      <div class="action-group">
        <q-btn
          flat
          dense
          round
          icon="undo"
          size="sm"
          class="action-btn"
          :disable="!canUndo"
          @click="$emit('undo')"
        >
          <q-tooltip>Undo (Ctrl+Z)</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          round
          icon="redo"
          size="sm"
          class="action-btn"
          :disable="!canRedo"
          @click="$emit('redo')"
        >
          <q-tooltip>Redo (Ctrl+Y)</q-tooltip>
        </q-btn>
      </div>

      <div class="divider"></div>

      <!-- Share Button -->
      <q-btn
        flat
        no-caps
        icon="share"
        label="Share"
        class="share-btn"
        @click="$emit('download')"
      >
        <q-tooltip>Download Design</q-tooltip>
      </q-btn>

      <!-- Publish Button -->
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
import { computed } from 'vue'

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
  }
})

const zoomPercentage = computed(() => Math.round(props.zoom * 100))

defineEmits(['zoom-in', 'zoom-out', 'undo', 'redo', 'download', 'publish'])
</script>

<style scoped>
.top-bar {
  position: fixed;
  top: 0;
  left: 80px;
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.98);
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
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.project-title-container:hover {
  background: #f5f5f5;
}

.project-title-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  width: 200px;
  cursor: pointer;
}

.project-title-input:focus {
  cursor: text;
}

.edit-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
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
  gap: 4px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 8px;
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #4b5563;
}

.zoom-btn:hover {
  background: #e5e7eb;
}

.zoom-text {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  min-width: 48px;
  text-align: center;
  user-select: none;
}

/* Right Section */
.top-bar-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #6b7280;
}

.action-btn:hover:not([disabled]) {
  background: #f3f4f6;
  color: #374151;
}

.action-btn[disabled] {
  opacity: 0.4;
}

.divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 8px;
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
