<template>
  <div class="konva-canvas-wrapper relative">
    <div v-if="!hideLabels" class="full-width full-height flex justify-between design-labels">
      <div class="label-front">Front</div>
      <q-separator vertical />
      <div class="label-back">Back</div>
    </div>

    <v-stage
      ref="stage"
      :config="stageConfig"
      :style="{ cursor: textToolActive ? 'text' : 'default' }"
      @click="handleStageClick"
      @contextmenu="handleStageContextMenu"
    >
      <v-layer ref="backgroundLayer">
        <v-rect
          v-if="backgroundStore.backgroundType === 'solid'"
          :config="{
            x: 0,
            y: 0,
            width: stageConfig.width,
            height: stageConfig.height,
            fill: backgroundStore.solidColor,
            opacity: backgroundStore.opacity,
            listening: false
          }"
        />
        <v-rect
          v-if="backgroundStore.backgroundType === 'pattern' && backgroundStore.selectedPattern"
          :config="{
            x: 0,
            y: 0,
            width: stageConfig.width,
            height: stageConfig.height,
            fillPatternImage: patternImage,
            fillPatternRepeat: 'repeat',
            opacity: backgroundStore.opacity,
            listening: false
          }"
        />
      </v-layer>

      <v-layer ref="staticLayer">
        <template v-for="(image, index) in images" :key="`loop-img-${image.id}`">
          <DesignElement
            v-if="showLoopedElements && shouldShowLeftLoop(image)"
            :element="{ ...image, position: { x: image.position.x - containerWidth, y: image.position.y } }"
            :is-selected="false"
            :is-dragging="false"
            :is-looped="true"
            element-type="image"
            @select="$emit('element-select', image.id)"
          />
          <DesignElement
            v-if="showLoopedElements && shouldShowRightLoop(image)"
            :element="{ ...image, position: { x: image.position.x + containerWidth, y: image.position.y } }"
            :is-selected="false"
            :is-dragging="false"
            :is-looped="true"
            element-type="image"
            @select="$emit('element-select', image.id)"
          />
        </template>

        <template v-for="(text, index) in texts" :key="`loop-txt-${text.id}`">
          <DesignElement
            v-if="showLoopedElements && shouldShowLeftLoop(text)"
            :element="{ ...text, position: { x: text.position.x - containerWidth, y: text.position.y } }"
            :is-selected="false"
            :is-dragging="false"
            :is-looped="true"
            element-type="text"
            @select="$emit('element-select', { id: text.id, type: 'text' })"
          />
          <DesignElement
            v-if="showLoopedElements && shouldShowRightLoop(text)"
            :element="{ ...text, position: { x: text.position.x + containerWidth, y: text.position.y } }"
            :is-selected="false"
            :is-dragging="false"
            :is-looped="true"
            element-type="text"
            @select="$emit('element-select', text.id)"
          />
        </template>
      </v-layer>

      <v-layer ref="dynamicLayer">
        <template v-for="(image, index) in visibleImages" :key="`img-${image.id}-${index}`">
          <DesignElement
            :element="{ ...image, zIndex: index }"
            :is-selected="selectedElementId === image.id"
            :is-dragging="isDragging"
            :is-locked="lockedElements.has(image.id)"
            :is-draw-tool-active="drawToolActive"
            :canvas-width="stageConfig.width"
            :canvas-height="stageConfig.height"
            element-type="image"
            @select="$emit('element-select', image.id)"
            @delete="$emit('element-delete', image.id)"
            @update:element="$emit('element-update', image.id, $event)"
            @edit-start="handleEditStart"
          />
        </template>

        <template v-for="(text, index) in visibleTexts" :key="`txt-${text.id}-${index}`">
          <DesignElement
            :element="{ ...text, zIndex: index + visibleImages.length }"
            :is-selected="selectedElementId === text.id"
            :is-dragging="isDragging"
            :is-editing="isEditingText && selectedElementId === text.id"
            :is-locked="lockedElements.has(text.id)"
            :is-draw-tool-active="drawToolActive"
            :canvas-width="stageConfig.width"
            :canvas-height="stageConfig.height"
            element-type="text"
            @select="$emit('element-select', text.id)"
            @delete="$emit('element-delete', text.id)"
            @edit-start="handleEditStart"
            @edit-finish="$emit('edit-finish')"
            @update:element="$emit('element-update', text.id, $event)"
          />
        </template>
      </v-layer>

      <v-layer ref="drawLayer" v-if="drawToolActive">
        <DrawTool
          ref="drawToolRef"
          :width="stageConfig.width"
          :height="stageConfig.height"
          :line-width="brushSize"
          :line-color="brushColor"
          :active="drawToolActive"
          :stage="stage?.getStage()"
          @update:drawing="$emit('drawing-update', $event)"
        
        />
      </v-layer>
    </v-stage>

    <div v-if="images.length === 0 && texts.length === 0 && !drawToolActive && !textToolActive" class="empty-state">
      Upload images or add text to begin designing
    </div>

    <!-- Text Tool Active Indicator -->
    <div v-if="textToolActive && !isEditingText" class="text-tool-active-indicator">
      <div class="text-tool-message">
        <q-icon name="mdi-cursor-text" size="24px" color="primary" />
        <span>Click anywhere on the canvas to add text</span>
      </div>
    </div>

    <FloatingToolbar
      :visible="!!selectedElement && !props.isEditingText && selectedElementType === 'image'"
      :element-position="selectedElementPosition"
      :element-size="selectedElementSize"
      :element-type="selectedElementType"
      :is-locked="props.selectedElementId ? props.lockedElements.has(props.selectedElementId) : false"
      :is-drawing="selectedElement?.isDrawing || false"
      :is-sticker="selectedElement?.isSticker || false"
      :has-frame="!!(selectedElement?.frame?.shape && selectedElement.frame.shape !== 'none')"
      @change-image="$emit('change-image', props.selectedElementId)"
      @edit-drawing="$emit('edit-drawing', props.selectedElementId)"
      @format-text="$emit('format-text', props.selectedElementId)"
      @toggle-lock="$emit('toggle-lock', props.selectedElementId)"
      @duplicate="$emit('duplicate', props.selectedElementId)"
      @add-frame="$emit('add-frame', props.selectedElementId)"
      @remove-frame="$emit('remove-frame', props.selectedElementId)"
      @delete="$emit('element-delete', props.selectedElementId)"
    />

    <TextFormatToolbar
      :visible="!!selectedElement && !props.isEditingText && selectedElementType === 'text'"
      :element-position="selectedElementPosition"
      :element-size="selectedElementSize"
      :is-locked="props.selectedElementId ? props.lockedElements.has(props.selectedElementId) : false"
      :is-bold="selectedElement?.bold || false"
      :is-italic="selectedElement?.italic || false"
      :is-underline="selectedElement?.transformation === 'underline'"
      @edit-text="$emit('format-text', props.selectedElementId)"
      @toggle-lock="$emit('toggle-lock', props.selectedElementId)"
      @duplicate="$emit('duplicate', props.selectedElementId)"
      @delete="$emit('element-delete', props.selectedElementId)"
      @bold-change="handleBoldChange"
      @italic-change="handleItalicChange"
      @underline-change="handleUnderlineChange"
    />

    <HelperButtons
      :visible="!!props.selectedElementId && !props.isEditingText"
      :element-position="selectedElementPosition"
      :element-size="selectedElementSize"
      :is-in-move-mode="isElementInMoveMode"
      @rotate="$emit('rotate-element', props.selectedElementId)"
      @move="$emit('move-element', props.selectedElementId)"
      @drag-move="handleDragMove"
    />

    <!-- Snap Guides -->
    <SnapGuides
      :canvas-width="stageConfig.width"
      :canvas-height="stageConfig.height"
      :selected-element="selectedElement"
      :other-elements="allElements"
      :show-center-guides="true"
      :snap-threshold="8"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import FloatingToolbar from '~/components/editor/sidebar/FloatingToolbar.vue'
import HelperButtons from '~/components/editor/canvas/HelperButtons.vue'
import TextFormatToolbar from '~/components/editor/sidebar/TextFormatToolbar.vue'
import DesignElement from '~/components/editor/canvas/DesignElement.vue'
import DrawTool from '~/components/editor/canvas/DrawTool.vue'
import SnapGuides from '~/components/editor/canvas/SnapGuides.vue'
import { useBackgroundStore } from '~/store/background'

const props = defineProps({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  images: { type: Array, default: () => [] },
  texts: { type: Array, default: () => [] },
  selectedElementId: { type: String, default: null },
  isDragging: { type: Boolean, default: false },
  isEditingText: { type: Boolean, default: false },
  drawToolActive: { type: Boolean, default: false },
  textToolActive: { type: Boolean, default: false },
  brushSize: { type: Number, default: 5 },
  brushColor: { type: String, default: '#000000'
  },
  hideLabels: {
    type: Boolean,
    default: false
  },
  showLoopedElements: {
    type: Boolean,
    default: true
  },
  backgroundUrl: {
    type: String,
    default: ''
  },
  lockedElements: {
    type: Set,
    default: () => new Set()
  },
  hiddenElements: {
    type: Set,
    default: () => new Set()
  }
});

const backgroundStore = useBackgroundStore();

// Filter visible elements
const visibleImages = computed(() => {
  return props.images.filter(img => !props.hiddenElements.has(img.id))
});

const visibleTexts = computed(() => {
  return props.texts.filter(txt => !props.hiddenElements.has(txt.id))
});

// All elements for SnapGuides
const allElements = computed(() => {
  return [...props.images, ...props.texts]
});

const emit = defineEmits([
  'element-select',
  'element-delete', 
  'element-update',
  'edit-start',
  'edit-finish',
  'drawing-update',
  'stage-click',
  'texture-update',
  'change-image',
  'edit-drawing',
  'format-text',
  'toggle-lock',
  'duplicate',
  'add-frame',
  'remove-frame',
  'rotate-element',
  'move-element',
  'underline-change'
]);

const stage = ref(null);
const staticLayer = ref(null);
const dynamicLayer = ref(null);
const drawLayer = ref(null);
const drawToolRef = ref(null);
const backgroundLayer = ref(null);
const patternImage = ref(null);

let batchDrawScheduled = false;
let batchDrawFrameId = null;

const containerWidth = computed(() => props.width);

const stageConfig = computed(() => ({
  width: props.width,
  height: props.height,
}));

const selectedElement = computed(() => {
  if (!props.selectedElementId) {
    return null;
  }

  const imageElement = props.images.find(img => img.id === props.selectedElementId);
  if (imageElement) {
    return { ...imageElement, type: 'image' };
  }

  const textElement = props.texts.find(txt => txt.id === props.selectedElementId);
  if (textElement) {
    if (textElement.type === 'emoji') {
      return { ...textElement, type: 'emoji' };
    }
    if (textElement.type === 'monogram') {
      return { ...textElement, type: 'monogram' };
    }
    return { ...textElement, type: 'text' };
  }

  return null;
});

watch(() => props.textToolActive, (newVal) => {
  // Text tool active state changed
}, { immediate: true });

const selectedElementType = computed(() => {
  return selectedElement.value ? selectedElement.value.type : null;
});


const selectedElementPosition = computed(() => {
  return selectedElement.value?.position || { x: 0, y: 0 };
});

const selectedElementSize = computed(() => {
  if (!selectedElement.value) return { width: 0, height: 0 };
  const scale = selectedElement.value.scale || 1;

  if (selectedElement.value.type === 'image') {
    if (selectedElement.value.isDrawing && selectedElement.value.originalWidth && selectedElement.value.originalHeight) {
      return { 
        width: selectedElement.value.originalWidth * scale, 
        height: selectedElement.value.originalHeight * scale 
      };
    }
    return { width: 200 * scale, height: 200 * scale };
  }

  if (selectedElement.value.type === 'text') {
    const fontSize = selectedElement.value.fontSize || 16;
    const content = selectedElement.value.content || 'Your text';
    const textContent = content.replace(/<[^>]*>/g, '').trim() || 'Your text';
    const textWidth = Math.max(80, textContent.length * fontSize * 0.6);
    const textHeight = fontSize * 1.5;
    return { width: textWidth * scale, height: textHeight * scale };
  }

  if (selectedElement.value.type === 'emoji') {
    const fontSize = selectedElement.value.fontSize || 5;
    const emojiWidth = Math.max(20, selectedElement.value.content?.length * fontSize * 0.7) || 20;
    const emojiHeight = fontSize * 1.7;
    return { width: emojiWidth * scale, height: emojiHeight * scale };
  }

  return { width: 100 * scale, height: 100 * scale };
});

const isElementInMoveMode = computed(() => false);

const handleEditStart = (elementId) => {
  emit('edit-start', elementId);
};

const handleFormatText = (elementId) => {
  emit('format-text', elementId);
};

const scheduleBatchDraw = () => {
  if (batchDrawScheduled) return;
  
  // Only run on client-side
  if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
    return;
  }
  
  batchDrawScheduled = true;
  batchDrawFrameId = requestAnimationFrame(() => {
    const stageNode = stage.value?.getStage();
    const backgroundLayerNode = backgroundLayer.value?.getNode();
    const staticLayerNode = staticLayer.value?.getNode();
    const dynamicLayerNode = dynamicLayer.value?.getNode();
    const drawLayerNode = drawLayer.value?.getNode();
    
    // Redraw all layers including background
    if (backgroundLayerNode) {
      backgroundLayerNode.batchDraw();
    }
    if (staticLayerNode) {
      staticLayerNode.batchDraw();
    }
    if (dynamicLayerNode) {
      dynamicLayerNode.batchDraw();
    }
    if (drawLayerNode) {
      drawLayerNode.batchDraw();
    }
    
    // Force stage redraw to ensure all changes are rendered
    if (stageNode) {
      stageNode.batchDraw();
    }
    
    batchDrawScheduled = false;
    batchDrawFrameId = null;
  });
};

const updateLoopedInstances = () => {
  const backgroundLayerNode = backgroundLayer.value?.getNode();
  const staticLayerNode = staticLayer.value?.getNode();
  
  if (backgroundLayerNode) {
    backgroundLayerNode.batchDraw();
  }
  if (staticLayerNode) {
    staticLayerNode.batchDraw();
  }
};

const handleDragMove = (newPosition) => {
  if (!newPosition || isNaN(newPosition.x) || isNaN(newPosition.y)) return;

  if (props.selectedElementId) {
    let element = props.images.find(el => el.id === props.selectedElementId) 
               || props.texts.find(el => el.id === props.selectedElementId);

    if (element) {
      const updatedElement = {
        ...element,
        position: newPosition
      };
      emit('element-update', props.selectedElementId, updatedElement);
      
      scheduleBatchDraw();
    }
  }
};

const shouldShowLeftLoop = (element) => {
  const centerX = props.width / 2;
  return element.position.x > centerX;
};

const shouldShowRightLoop = (element) => {
  const centerX = props.width / 2;
  return element.position.x < centerX;
};

const handleStageClick = (e) => {
  if (e.target === stage.value?.getStage()) {
    emit('stage-click', e);
  }
};

const handleStageContextMenu = (e) => {
  e.evt.preventDefault();
};
const handleFontChange = (newFont) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return;
  
  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId);
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      font: newFont
    };
    emit('element-update', props.selectedElementId, updatedText);
    scheduleBatchDraw();
  }
};

const handleColorChange = (newColor) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return;

  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId);
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      color: newColor
    };
    emit('element-update', props.selectedElementId, updatedText);
    scheduleBatchDraw();
  }
};


const handleFontSizeChange = (newSize) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return;
  
  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId);
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      fontSize: newSize
    };
    emit('element-update', props.selectedElementId, updatedText);
    scheduleBatchDraw();
  }
};

const handleBoldChange = (isBold) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return;
  
  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId);
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      bold: isBold
    };
    emit('element-update', props.selectedElementId, updatedText);
    scheduleBatchDraw();
  }
};

const handleItalicChange = (isItalic) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return;
  
  const textIndex = props.texts.findIndex(txt => txt.id === props.selectedElementId);
  if (textIndex !== -1) {
    const updatedText = {
      ...props.texts[textIndex],
      italic: isItalic
    };
    emit('element-update', props.selectedElementId, updatedText);
    scheduleBatchDraw();
  }
};

const handleUnderlineChange = (isUnderline) => {
  if (!props.selectedElementId || selectedElementType.value !== 'text') return;
  
  // Emit to ImageEditor with the correct signature (just the boolean value)
  emit('underline-change', isUnderline);
  scheduleBatchDraw();
};

const exportTexture = () => {
  if (!stage.value) return null;
  const konvaStage = stage.value.getStage();
  if (!konvaStage) return null;

  try {
    // Get dynamic layer node to temporarily hide hidden elements
    const dynamicLayerNode = dynamicLayer.value?.getNode();
    const staticLayerNode = staticLayer.value?.getNode();

    // Store original visibility states
    const hiddenNodesState = [];

    if (dynamicLayerNode) {
      // Find and hide all elements that are in hiddenElements set
      dynamicLayerNode.getChildren().forEach((node) => {
        const elementId = node.id();
        if (elementId && props.hiddenElements.has(elementId)) {
          hiddenNodesState.push({ node, wasVisible: node.visible() });
          node.visible(false);
        }
      });
    }

    if (staticLayerNode) {
      // Also hide looped instances of hidden elements
      staticLayerNode.getChildren().forEach((node) => {
        const elementId = node.id();
        if (elementId && props.hiddenElements.has(elementId)) {
          hiddenNodesState.push({ node, wasVisible: node.visible() });
          node.visible(false);
        }
      });
    }

    // Force redraw with hidden elements
    konvaStage.batchDraw();

    // Export texture
    const textureData = konvaStage.toDataURL({
      mimeType: 'image/png',
      quality: 1,
      pixelRatio: 2
    });

    // Restore original visibility states
    hiddenNodesState.forEach(({ node, wasVisible }) => {
      node.visible(wasVisible);
    });

    // Redraw to restore original state
    konvaStage.batchDraw();

    return textureData;
  } catch (error) {
    return null;
  }
};
const cleanupBatchDraw = () => {
  if (batchDrawFrameId && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(batchDrawFrameId);
    batchDrawFrameId = null;
  }
  batchDrawScheduled = false;
};

// Watch for pattern changes and load pattern image (Fixed reactivity)
watch(() => backgroundStore.selectedPattern, (newPattern, oldPattern) => {
  // Only run on client-side
  if (typeof window === 'undefined') return;
  
  // Clear previous pattern immediately to prevent showing old pattern
  patternImage.value = null;
  scheduleBatchDraw();
  emit('texture-update');
  
  if (newPattern && newPattern.preview) {
    // Load new pattern image with proper error handling
    const img = new Image();
    
    // Add a small delay to ensure the pattern preview is ready
    setTimeout(() => {
      img.onload = () => {
        // Double-check this is still the current pattern to prevent race conditions
        if (backgroundStore.selectedPattern?.id === newPattern.id) {
          patternImage.value = img;
          scheduleBatchDraw();
          emit('texture-update');
        }
      };
      img.onerror = () => {
        patternImage.value = null;
        scheduleBatchDraw();
        emit('texture-update');
      };
      img.src = newPattern.preview;
    }, 10);
  }
}, { immediate: true, deep: true });

// Watch for solid color or background type changes (Fixed reactivity)
watch([
  () => backgroundStore.solidColor,
  () => backgroundStore.backgroundType,
  () => backgroundStore.opacity,
  () => backgroundStore.selectedPattern?.id // Watch pattern ID for changes
], () => {
  scheduleBatchDraw();
  emit('texture-update');
}, { immediate: true, deep: true });

// Watch for element array changes (layer reordering) and force redraw
watch([
  () => props.images,
  () => props.texts,
  () => props.images.map(img => img.id).join(','),
  () => props.texts.map(txt => txt.id).join(',')
], (newVals, oldVals) => {
  // If all elements were cleared (both arrays empty)
  if (props.images.length === 0 && props.texts.length === 0 &&
      (oldVals[0]?.length > 0 || oldVals[1]?.length > 0)) {

    // Force clear all layers
    nextTick(() => {
      const dynamicLayerNode = dynamicLayer.value?.getNode();
      const staticLayerNode = staticLayer.value?.getNode();

      if (dynamicLayerNode) {
        // Destroy all children completely
        dynamicLayerNode.destroyChildren();
        dynamicLayerNode.batchDraw();
      }

      if (staticLayerNode) {
        staticLayerNode.destroyChildren();
        staticLayerNode.batchDraw();
      }

      // Force complete stage redraw
      const stageNode = stage.value?.getStage();
      if (stageNode) {
        stageNode.batchDraw();
      }
    });
  } else {
    nextTick(() => {
      scheduleBatchDraw();
    });
  }
}, { deep: true });

// Listen for custom background change events
onMounted(() => {
  const handleBackgroundChange = () => {
    scheduleBatchDraw();
    emit('texture-update');
  };
  
  window.addEventListener('background-changed', handleBackgroundChange);
  
  onUnmounted(() => {
    window.removeEventListener('background-changed', handleBackgroundChange);
  });
});

onUnmounted(() => {
  cleanupBatchDraw();
});

defineExpose({
  exportTexture,
  getStage: () => stage.value?.getStage(),
  getStaticLayer: () => staticLayer.value?.getNode(),
  getDynamicLayer: () => dynamicLayer.value?.getNode(),
  getDrawLayer: () => drawLayer.value?.getNode(),
  getDrawTool: () => drawToolRef.value,
  scheduleBatchDraw,
  updateLoopedInstances
});
</script>

<style scoped>
.konva-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.design-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.label-front, .label-back {
  width: 40%;
  color: #868DAA;
  text-align: center;
  font-size: 1rem;
  padding-top: 1rem;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #9ca3af;
  text-align: center;
  font-size: 1.25rem;
  pointer-events: none;
  z-index: 2;
}

.text-tool-active-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.05);
  border: 2px dashed #6366f1;
  border-radius: 12px;
  z-index: 5;
  pointer-events: none;
}

.text-tool-message {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  border: 1px solid #e0e7ff;
  font-weight: 500;
  color: #6366f1;
  font-size: 16px;
}

@media (max-width: 768px) {
  .label-front, .label-back {
    font-size: 0.875rem;
  }
}
</style>