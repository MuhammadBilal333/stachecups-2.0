<template>
  <div class="layer-panel">
    <!-- Header -->
    <div class="layer-header">
      <h3 class="layer-title">Layers</h3>
      <div class="layer-actions">
        <q-btn
          flat
          dense
          round
          size="sm"
          icon="delete_sweep"
          @click="clearAllLayers"
        >
          <q-tooltip>Clear All Layers</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Alignment Tools -->
    <div class="alignment-tools">
      <div class="tool-group">
        <label class="tool-label">Align:</label>
        <q-btn-group flat dense>
          <q-btn
            flat
            dense
            size="sm"
            icon="format_align_left"
            @click="alignElement('left')"
            :disable="!hasSelection"
          >
            <q-tooltip>Align Left</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            size="sm"
            icon="format_align_center"
            @click="alignElement('center')"
            :disable="!hasSelection"
          >
            <q-tooltip>Align Center</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            size="sm"
            icon="format_align_right"
            @click="alignElement('right')"
            :disable="!hasSelection"
          >
            <q-tooltip>Align Right</q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>

      <div class="tool-group">
        <q-btn-group flat dense>
          <q-btn
            flat
            dense
            size="sm"
            icon="vertical_align_top"
            @click="alignElement('top')"
            :disable="!hasSelection"
          >
            <q-tooltip>Align Top</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            size="sm"
            icon="vertical_align_center"
            @click="alignElement('middle')"
            :disable="!hasSelection"
          >
            <q-tooltip>Align Middle</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            size="sm"
            icon="vertical_align_bottom"
            @click="alignElement('bottom')"
            :disable="!hasSelection"
          >
            <q-tooltip>Align Bottom</q-tooltip>
          </q-btn>
        </q-btn-group>
      </div>
    </div>

    <q-separator class="q-my-sm" />

    <!-- Layer List -->
    <div class="layer-list" v-if="layers.length > 0">
      <draggable
        v-model="layers"
        :item-key="(item) => item.id"
        @end="handleDragEnd"
        ghost-class="layer-ghost"
        handle=".layer-drag-handle"
      >
        <template #item="{ element: layer, index }">
          <div
            class="layer-item"
            :class="{
              'layer-selected': isSelected(layer.id),
              'layer-locked': isLocked(layer.id),
              'layer-hidden': isHidden(layer.id),
            }"
            @click="selectLayer(layer.id)"
          >
            <!-- Drag Handle -->
            <div class="layer-drag-handle">
              <q-icon name="drag_indicator" size="16px" />
            </div>

            <!-- Layer Icon -->
            <div class="layer-icon">
              <q-icon
                :name="getLayerIcon(layer)"
                size="20px"
                :color="isSelected(layer.id) ? 'primary' : 'grey-7'"
              />
            </div>

            <!-- Layer Info -->
            <div class="layer-info">
              <div class="layer-name">{{ getLayerName(layer) }}</div>
              <div class="layer-type">{{ getLayerType(layer) }}</div>
            </div>

            <!-- Layer Actions -->
            <div class="layer-controls">
              <!-- Visibility Toggle -->
              <q-btn
                flat
                dense
                round
                size="xs"
                :icon="isHidden(layer.id) ? 'visibility_off' : 'visibility'"
                @click.stop="toggleVisibility(layer.id)"
              >
                <q-tooltip>{{ isHidden(layer.id) ? 'Show' : 'Hide' }}</q-tooltip>
              </q-btn>

              <!-- Lock Toggle -->
              <q-btn
                flat
                dense
                round
                size="xs"
                :icon="isLocked(layer.id) ? 'lock' : 'lock_open'"
                @click.stop="toggleLock(layer.id)"
              >
                <q-tooltip>{{ isLocked(layer.id) ? 'Unlock' : 'Lock' }}</q-tooltip>
              </q-btn>

              <!-- More Options -->
              <q-btn flat dense round size="xs" icon="more_vert">
                <q-menu>
                  <q-list dense>
                    <q-item clickable v-close-popup @click="duplicateLayer(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="content_copy" size="xs" />
                      </q-item-section>
                      <q-item-section>Duplicate</q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable v-close-popup @click="moveToFront(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="flip_to_front" size="xs" />
                      </q-item-section>
                      <q-item-section>Bring to Front</q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="moveToBack(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="flip_to_back" size="xs" />
                      </q-item-section>
                      <q-item-section>Send to Back</q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="moveUp(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="arrow_upward" size="xs" />
                      </q-item-section>
                      <q-item-section>Move Up</q-item-section>
                    </q-item>

                    <q-item clickable v-close-popup @click="moveDown(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="arrow_downward" size="xs" />
                      </q-item-section>
                      <q-item-section>Move Down</q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable v-close-popup @click="deleteLayer(layer.id)">
                      <q-item-section avatar>
                        <q-icon name="delete" size="xs" color="negative" />
                      </q-item-section>
                      <q-item-section class="text-negative">Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Empty State -->
    <div v-else class="layer-empty">
      <q-icon name="layers" size="48px" color="grey-5" />
      <p class="text-grey-6">No layers yet</p>
      <p class="text-caption text-grey-5">Add images or text to create layers</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useEditorStore } from '~/store/editor'
import draggable from 'vuedraggable'

const $q = useQuasar()
const editorStore = useEditorStore()

// Computed
const layers = computed({
  get: () => editorStore.layeredElements,
  set: (value) => {
    // Handle drag reorder - reverse back to original order
    const reversedOrder = [...value].reverse()

    // Update elements array directly (this maintains reactivity)
    editorStore.$patch({
      elements: reversedOrder
    })

    // Force canvas refresh and emit update
    nextTick(() => {
      forceCanvasRefresh()
      emit('layer-update')
    })
  },
})

const hasSelection = computed(() => !!editorStore.selectedElementId)

// Layer Information
const getLayerIcon = (layer) => {
  switch (layer.type) {
    case 'image':
      return layer.isDrawing ? 'brush' : 'image'
    case 'text':
      return 'text_fields'
    case 'emoji':
      return 'emoji_emotions'
    case 'monogram':
      return 'mdi-alpha-m-circle'
    default:
      return 'layers'
  }
}

const getLayerName = (layer) => {
  switch (layer.type) {
    case 'image':
      return layer.isDrawing ? 'Drawing' : layer.isSticker ? 'Sticker' : 'Image'
    case 'text':
      const content = layer.content?.replace(/<[^>]*>/g, '').trim()
      return content ? content.substring(0, 20) + (content.length > 20 ? '...' : '') : 'Text'
    case 'emoji':
      return layer.content || 'Emoji'
    case 'monogram':
      return `Monogram ${layer.content || ''}`
    default:
      return 'Layer'
  }
}

const getLayerType = (layer) => {
  switch (layer.type) {
    case 'image':
      return layer.isDrawing ? 'Drawing' : layer.isSticker ? 'Sticker' : 'Image'
    case 'text':
      return 'Text'
    case 'emoji':
      return 'Emoji'
    case 'monogram':
      return 'Monogram'
    default:
      return 'Unknown'
  }
}

// Layer State
const isSelected = (id) => editorStore.selectedElementId === id
const isLocked = (id) => editorStore.isElementLocked(id)
const isHidden = (id) => editorStore.isElementHidden(id)

// Layer Actions
const selectLayer = (id) => {
  if (!isLocked(id) && !isHidden(id)) {
    editorStore.selectElement(id)
  }
}

const toggleVisibility = (id) => {
  editorStore.toggleVisibility(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const toggleLock = (id) => {
  editorStore.toggleLock(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const duplicateLayer = (id) => {
  editorStore.duplicateElement(id)
  forceCanvasRefresh()
  emit('layer-update')

  $q.notify({
    message: 'Layer duplicated',
    color: 'positive',
    icon: 'content_copy',
    position: 'top',
  })
}

const deleteLayer = (id) => {
  $q.dialog({
    title: 'Delete Layer',
    message: 'Are you sure you want to delete this layer?',
    cancel: true,
    persistent: false,
  }).onOk(() => {
    editorStore.deleteElement(id)
    forceCanvasRefresh()
    emit('layer-update')

    $q.notify({
      message: 'Layer deleted',
      color: 'positive',
      icon: 'delete',
      position: 'top',
    })
  })
}

const clearAllLayers = () => {
  if (layers.value.length === 0) return

  $q.dialog({
    title: 'Clear All Layers',
    message: 'Are you sure you want to delete all layers? This action cannot be undone.',
    cancel: true,
    persistent: false,
    ok: {
      label: 'Clear All',
      color: 'negative',
    },
  }).onOk(() => {
    editorStore.clearElements()
    forceCanvasRefresh()
    emit('layer-update')

    $q.notify({
      message: 'All layers cleared',
      color: 'positive',
      icon: 'delete_sweep',
      position: 'top',
    })
  })
}

// Layer Ordering
const moveToFront = (id) => {
  editorStore.bringToFront(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const moveToBack = (id) => {
  editorStore.sendToBack(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const moveUp = (id) => {
  editorStore.moveUp(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const moveDown = (id) => {
  editorStore.moveDown(id)
  forceCanvasRefresh()
  emit('layer-update')
}

const handleDragEnd = () => {
  forceCanvasRefresh()
  emit('layer-update')

  $q.notify({
    message: 'Layer order updated',
    color: 'positive',
    icon: 'swap_vert',
    position: 'top',
    timeout: 1000,
  })
}

// Alignment
const alignElement = (alignment) => {
  editorStore.alignElements(alignment)
  forceCanvasRefresh()
  emit('layer-update')

  $q.notify({
    message: `Aligned ${alignment}`,
    color: 'positive',
    icon: 'align_horizontal_center',
    position: 'top',
    timeout: 1000,
  })
}

// Force canvas refresh by triggering Vue reactivity
const forceCanvasRefresh = () => {
  // Trigger reactivity by touching the store
  const currentElements = [...editorStore.elements]
  editorStore.$patch({
    elements: currentElements
  })
}

// Emits
const emit = defineEmits(['layer-update'])
</script>

<style scoped>
.layer-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  overflow: hidden;
}

.layer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.layer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.layer-actions {
  display: flex;
  gap: 4px;
}

.alignment-tools {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f9fafb;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  min-width: 40px;
}

.layer-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.layer-item:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.layer-selected {
  background: #eff6ff !important;
  border-color: #3b82f6 !important;
}

.layer-locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.layer-hidden {
  opacity: 0.4;
}

.layer-drag-handle {
  cursor: grab;
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.layer-drag-handle:active {
  cursor: grabbing;
}

.layer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.layer-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.layer-name {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-type {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.layer-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.layer-item:hover .layer-controls,
.layer-selected .layer-controls {
  opacity: 1;
}

.layer-ghost {
  opacity: 0.5;
  background: #dbeafe;
  border: 2px dashed #3b82f6;
}

.layer-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}

.layer-empty p {
  margin: 8px 0;
}

/* Scrollbar styling */
.layer-list::-webkit-scrollbar {
  width: 6px;
}

.layer-list::-webkit-scrollbar-track {
  background: transparent;
}

.layer-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.layer-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
