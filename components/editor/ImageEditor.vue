<template>
  <div class="image-editor-container">
    <TopBar
      v-if="!uiStore.isCheckoutMode"
      :can-undo="canUndo"
      :can-redo="canRedo"
      :zoom="canvasZoom"
      @undo="undo"
      @redo="redo"
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @download="handleDownload"
      @publish="handleCheckout"
    />

    <PreviewCard
      v-if="uiStore.render"
      :zoom="uiStore.previewZoom"
      :canvas-element="getHiddenCanvas()"
      :is-checkout="uiStore.isCheckoutMode"
      @toggle-zoom="uiStore.togglePreviewZoom()"
    />

    <CheckoutSection
      v-if="['checkout', 'mockup'].includes(uiStore.visualization)"
      :canvas-element="uiStore.render ? getHiddenCanvas() : undefined"
      :is-checkout="uiStore.isCheckoutMode"
      @add-to-cart="addToCart"
      @go-back="uiStore.returnToDesign()"
    />

    <div class="canvas-section-container flex flex-col items-center justify-center pt-20" :style="{ transform: `scale(${canvasZoom})`, transformOrigin: 'center', transition: 'transform 0.2s ease' }">
      <CanvasSection
        v-show="uiStore.isDesignMode || (uiStore.isMockupMode && $q.screen.gt.sm)"
        ref="canvasSectionRef"
        :width="canvasWidth"
        :height="canvasHeight"
        :images="images"
        :texts="texts"
        :selected-element-id="selectedElementId || undefined"
        :locked-elements="lockedElements"
        :is-dragging="isDragging"
        :is-editing-text="textEditorStore.isEditingText"
        :draw-tool-active="drawToolStore.isActive"
        :brush-size="drawToolStore.brushSize"
        :brush-color="drawToolStore.brushColor"
        :hide-controls="uiStore.hideControls"
        :hide-everything="uiStore.hideEverything"
        :background-url="route.query.background_url as string | undefined"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :editing-content="textEditorStore.editingTextContent"
        :editing-position="textEditorStore.editingTextPosition"
        :editing-font-size="textEditorStore.editingTextFontSize"
        :editing-font-family="textEditorStore.editingTextFontFamily"
        :editing-color="textEditorStore.editingTextColor"
        :editing-width="textEditorStore.editingTextWidth"
        :editing-height="textEditorStore.editingTextHeight"
        @element-select="selectElement"
        @element-delete="handleDeleteElement"
        @element-update="handleElementUpdate"
        @edit-start="handleTextEditStart"
        @edit-finish="finishTextEditing"
        @drawing-update="drawToolStore.setCurrentDrawing($event)"
        @stage-click="handleStageClick"
        @texture-update="canvasOps.updateCupTexture()"
        @change-image="handleChangeImage"
        @edit-drawing="handleEditDrawing"
        @format-text="handleFormatText"
        @toggle-lock="editorStore.toggleLock($event)"
        @duplicate="handleDuplicate"
        @add-frame="handleAddFrame"
        @remove-frame="handleRemoveFrame"
        @rotate-element="elementOps.rotateElement($event)"
        @move-element="handleMoveElement"
        @bring-to-front="handleBringToFront"
        @send-to-back="handleSendToBack"
        @font-change="handleFontChange"
        @color-change="handleColorChange"
        @undo="undo"
        @redo="redo"
        @content-change="handleQuillContentChange"
        @finish-editing="finishTextEditing"
        @cancel-editing="cancelTextEditing"
        @editor-error="handleQuillError"
        @update:brush-size="drawToolStore.setBrushSize($event)"
        @update:brush-color="drawToolStore.setBrushColor($event)"
        @clear-drawing="clearDrawing"
        @finish-drawing="finishDrawing"
      />
    </div>

    <div v-show="!uiStore.isCheckoutMode" class="full-width justify-end flex q-pt-md">
      <q-btn-toggle
        v-if="$q.screen.lt.md"
        v-model="uiStore.visualization"
        style="border: 1px solid #027be3"
        no-caps
        rounded
        unelevated
        toggle-color="primary"
        color="white"
        text-color="primary"
        :options="[
          { label: 'Design', value: 'design' },
          { label: 'Mockup', value: 'mockup' },
        ]"
      />
    </div>

    <image-toolbar
      v-show="!uiStore.isCheckoutMode"
      :text-tool-active="textEditorStore.textToolActive"
      :draw-tool-active="drawToolStore.isActive"
      @upload="handleImageUpload"
      @add-image="handleImageUrl"
      @add-emoji="handleEmoji"
      @checkout="handleCheckout"
      @activate-text-tool="activateTextTool"
      @activate-draw-tool="activateDrawTool"
    />

    <FrameSelectionModal
      :visible="showFrameModal"
      :image-preview="pendingImageData || undefined"
      @select="handleFrameSelectionFromModal"
      @cancel="handleCancelFrameSelection"
      @update:visible="showFrameModal = $event"
    />

  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import TopBar from '~/components/editor/TopBar.vue'
import PreviewCard from '~/components/editor/sections/PreviewCard.vue'
import CheckoutSection from '~/components/editor/sections/CheckoutSection.vue'
import CanvasSection from '~/components/editor/sections/CanvasSection.vue'
import ImageToolbar from '~/components/editor/sidebar/Sidebar.vue'
import FrameSelectionModal from '~/components/editor/pickers/FrameSelectionModal.vue'
import { useEditorStore } from '~/store/editor'
import { useUIStore } from '~/store/ui'
import { useDrawToolStore } from '~/store/drawTool'
import { useTextEditorStore } from '~/store/textEditor'
import { useFramesStore } from '~/store/frames'
import { useHistory } from '~/composables/useHistory'
import { useCanvasOperations } from '~/composables/useCanvasOperations'
import { useElementOperations } from '~/composables/useElementOperations'

const $q = useQuasar()
const route = useRoute()

const editorStore = useEditorStore()
const uiStore = useUIStore()
const drawToolStore = useDrawToolStore()
const textEditorStore = useTextEditorStore()
const framesStore = useFramesStore()

const { saveState: saveHistoryState, undo, redo, canUndo, canRedo } = useHistory()
const canvasOps = useCanvasOperations()
const elementOps = useElementOperations()

// Simple refs needed for canvas
const isDragging = ref(false)
const nextDrawingId = ref(1)
const canvasZoom = ref(1)

// Frame selection modal state
const showFrameModal = ref(false)
const pendingImageData = ref<string | null>(null)
const pendingImageFile = ref<File | null>(null)
const pendingImageUrl = ref<string | null>(null)
const pendingElementId = ref<string | null>(null) // For adding frame to existing image


// Refs from CanvasSection
const canvasSectionRef = ref<any>(null)

// Getter functions (declare before use in watch)
const getHiddenCanvas = () => canvasSectionRef.value?.hiddenCanvas
const getKonvaCanvasRef = () => canvasSectionRef.value?.konvaCanvasRef
const getContainerRef = () => canvasSectionRef.value?.containerRef

// Canvas dimensions (reactive)
const canvasWidth = ref(952)
const canvasHeight = ref(550)

// Computed
const images = computed(() => editorStore.elements.filter(el => el.type === 'image'))
const texts = computed(() => editorStore.elements.filter(el => el.type === 'text' || el.type === 'emoji'))
const selectedElementId = computed({
  get: () => editorStore.selectedElementId,
  set: (val) => editorStore.selectElement(val)
})
const lockedElements = computed(() => editorStore.lockedElements)

// Update dimensions when container is available
watch(() => getContainerRef(), (container) => {
  if (container) {
    canvasWidth.value = container.offsetWidth || 952
    canvasHeight.value = container.offsetHeight || 550
  }
}, { immediate: true })

// Update composable refs when canvas section is mounted
watch(() => canvasSectionRef.value, (section) => {
  if (section) {
    canvasOps.containerRef.value = section.containerRef
    canvasOps.konvaCanvasRef.value = section.konvaCanvasRef
    canvasOps.hiddenCanvas.value = section.hiddenCanvas
  }
}, { immediate: true, flush: 'post' })

// Save state wrapper
const saveState = () => {
  saveHistoryState()
}

const activateTextTool = () => {
  textEditorStore.activateTextTool()
  drawToolStore.deactivate()
  editorStore.deselectAll()
}

const activateDrawTool = () => {
  drawToolStore.activate()
  textEditorStore.deactivateTextTool()
  editorStore.deselectAll()
  textEditorStore.finishEditing()
}

// ============================================
// IMAGE OPERATIONS
// ============================================

const handleImageUrl = async (url: string) => {
  // Stickers are added directly without frame selection
  const imageId = elementOps.addImageFromUrl(url)
  
  const element = editorStore.elements.find(el => el.id === imageId)
  if (element) {
    // Mark as sticker so it doesn't get frame options
    const updatedElement = {
      ...element,
      isSticker: true
    }
    editorStore.updateElement(imageId, updatedElement)
  }
  
  saveState()
  await nextTick()
  await nextTick()
  canvasOps.updateCupTexture()
  
  $q.notify({
    message: 'Sticker added!',
    color: 'positive',
    icon: 'check_circle',
    position: 'top',
  })
}

const handleImageUpload = async (file: File) => {
  try {
    // Convert file to data URL for preview
    const reader = new FileReader()
    reader.onload = (event) => {
      pendingImageData.value = event.target?.result as string
      pendingImageFile.value = file
      pendingImageUrl.value = null
      showFrameModal.value = true
    }
    reader.readAsDataURL(file)
  } catch (error) {
    $q.notify({
      message: 'Failed to load image',
      color: 'negative',
    })
  }
}

const handleFrameSelectionFromModal = async (frame: any) => {
  try {
    let imageId: string

    // Check if this is adding frame to existing image or new image upload
    if (pendingElementId.value) {
      // Adding frame to existing image
      imageId = pendingElementId.value
      const element = editorStore.elements.find(el => el.id === imageId)
      if (element) {
        const updatedElement = {
          ...element,
          frame: frame.id !== 'none' ? {
            id: frame.id,
            shape: frame.shape,
          } : undefined,
          imageCrop: frame.id !== 'none' ? {
            x: 0,
            y: 0,
            scale: 1,
          } : undefined
        }
        editorStore.updateElement(imageId, updatedElement)
      }
      
      $q.notify({
        message: frame.id === 'none' ? 'Frame removed' : `Frame added: ${frame.name}`,
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      })
    } else {
      // New image upload
      if (pendingImageFile.value) {
        imageId = await elementOps.addImageFromFile(pendingImageFile.value)
      } else if (pendingImageUrl.value) {
        imageId = elementOps.addImageFromUrl(pendingImageUrl.value)
      } else {
        throw new Error('No image data available')
      }

      // Apply frame if selected (not "none")
      if (frame.id !== 'none') {
        const element = editorStore.elements.find(el => el.id === imageId)
        if (element) {
          const updatedElement = {
            ...element,
            frame: {
              id: frame.id,
              shape: frame.shape,
            },
            imageCrop: {
              x: 0,
              y: 0,
              scale: 1,
            }
          }
          editorStore.updateElement(imageId, updatedElement)
        }
      }

      $q.notify({
        message: frame.id === 'none' ? 'Image added' : `Image added with ${frame.name} frame`,
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      })
    }

    saveState()
    await nextTick()
    await nextTick()
    // Use debounced texture update for frame changes to ensure proper rendering
    canvasOps.debouncedTextureUpdate()
  } catch (error) {
    $q.notify({
      message: 'Failed to process frame selection',
      color: 'negative',
    })
  } finally {
    // Clear pending state
    pendingImageData.value = null
    pendingImageFile.value = null
    pendingImageUrl.value = null
    pendingElementId.value = null
  }
}

const handleCancelFrameSelection = () => {
  // Clear pending state without adding image
  pendingImageData.value = null
  pendingImageFile.value = null
  pendingImageUrl.value = null
  pendingElementId.value = null
  
  $q.notify({
    message: pendingElementId.value ? 'Frame selection cancelled' : 'Image upload cancelled',
    color: 'info',
    position: 'top',
  })
}

const handleChangeImage = (elementId: string) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        elementOps.changeImageSource(elementId, event.target?.result as string)
        saveState()
        canvasOps.updateCupTexture()
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const handleEmoji = (emoji: any) => {
  elementOps.addEmoji(emoji.i)
  saveState()
  canvasOps.updateCupTexture()
}

const handleAdjustImage = (elementId: string) => {
  console.log('🎛️ Adjust Image triggered for:', elementId)
  // Image controls header removed - no action needed
}

const handleAddFrame = (elementId: string) => {
  const element = editorStore.elements.find(el => el.id === elementId) as any
  if (!element || element.type !== 'image') return

  // Show frame selection modal for existing image
  const imagePreview = element.src
  pendingImageData.value = imagePreview
  pendingImageFile.value = null
  pendingImageUrl.value = imagePreview
  pendingElementId.value = elementId // Store the element ID to update
  showFrameModal.value = true
}

const handleRemoveFrame = (elementId: string) => {
  const element = editorStore.elements.find(el => el.id === elementId) as any
  if (!element || element.type !== 'image') return

  $q.dialog({
    title: 'Remove Frame',
    message: 'Are you sure you want to remove the frame from this image?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      const updatedElement = {
        ...element,
        frame: undefined,
        imageCrop: undefined,
      }

      editorStore.updateElement(elementId, updatedElement)
      saveState()
      // Use debounced texture update for frame removal to ensure proper rendering
      canvasOps.debouncedTextureUpdate()

      $q.notify({
        message: 'Frame removed successfully',
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      })
    } catch (error) {
      $q.notify({
        message: 'Failed to remove frame',
        color: 'negative',
      })
    }
  })
}


const handleTextEditStart = (elementId?: string) => {
  const id = elementId || selectedElementId.value
  if (!id) return
  
  handleFormatText(id)
}

const addNewText = (x: number, y: number) => {
  const id = elementOps.addText(x, y)
  
  nextTick(() => {
    nextTick(() => {
      const canvasContainer = getContainerRef()
      
      let screenX = x
      let screenY = y
      
      if (canvasContainer) {
        const containerRect = canvasContainer.getBoundingClientRect()
        screenX = containerRect.left + x
        screenY = containerRect.top + y
      }
      
      textEditorStore.startEditing({
        elementId: id,
        content: '',
        position: { x: screenX, y: screenY },
        fontSize: 16,
        fontFamily: textEditorStore.selectedFont,
        color: textEditorStore.selectedFontColor,
        width: 400,
        height: 100,
      })
    })
  })
  
  saveState()
}

const handleQuillContentChange = (content: string) => {
  textEditorStore.setEditingContent(content)
  
  if (selectedElementId.value) {
    editorStore.updateElement(selectedElementId.value, { content })
    canvasOps.debouncedTextureUpdate()
  }
}

const finishTextEditing = () => {
  if (selectedElementId.value && textEditorStore.editingTextContent) {
    editorStore.updateElement(selectedElementId.value, { 
      content: textEditorStore.editingTextContent 
    })
    saveState()
    canvasOps.immediateTextureUpdate()
  }
  
  textEditorStore.finishEditing()
}

const cancelTextEditing = () => {
  if (selectedElementId.value) {
    canvasOps.immediateTextureUpdate()
  }
  textEditorStore.cancelEditing()
}

const handleFormatText = (elementId: string) => {
  const element = editorStore.elements.find(el => el.id === elementId)
  if (!element || (element.type !== 'text' && element.type !== 'emoji')) return
  
  const text = element as any
  
  nextTick(() => {
    const canvasContainer = getContainerRef()
    if (!canvasContainer) return
    
    const containerRect = canvasContainer.getBoundingClientRect()
    const currentElement = editorStore.elements.find(el => el.id === elementId)
    const currentPosition = currentElement?.position || text.position
    
    const screenX = containerRect.left + currentPosition.x
    const screenY = containerRect.top + currentPosition.y
    
    const textElement = currentElement as any
    const fontSize = textElement?.fontSize || 16
    
    textEditorStore.startEditing({
      elementId: elementId,
      content: textElement?.content || '',
      position: { x: screenX, y: screenY },
      fontSize: fontSize,
      fontFamily: textElement?.font || 'Roboto',
      color: textElement?.color || '#FF5CA0',
      width: 300,
      height: fontSize * 2,
    })
  })
}

const handleFontChange = (elementId: string, newFont: string) => {
  elementOps.updateTextFont(elementId, newFont)
  saveState()
  canvasOps.updateCupTexture()
}

const handleColorChange = (elementId: string, newColor: string) => {
  elementOps.updateTextColor(elementId, newColor)
  saveState()
  canvasOps.updateCupTexture()
}

const clearDrawing = () => {
  const konvaRef = getKonvaCanvasRef()
  const drawTool = konvaRef?.getDrawTool()
  if (drawTool) {
    drawTool.clearCanvas()
  }
  drawToolStore.clearCurrentDrawing()
}

const saveDrawing = async () => {
  const konvaRef = getKonvaCanvasRef()
  const drawTool = konvaRef?.getDrawTool()
  if (!drawTool) return;

  const data = drawTool.downloadDrawing();
  if (!data.imageData) return;

  const id = `draw-${nextDrawingId.value++}`;

  const centerX = data.left + data.width / 2;
  const centerY = data.top + data.height / 2;

  // Add element through the store instead of pushing to computed property
  editorStore.addElement({
    id,
    type: 'image',
    src: data.imageData,
    position: { x: centerX, y: centerY },
    scale: 1,
    rotation: 0,
    width: data.width,
    height: data.height,
    isDrawing: true,
    originalWidth: data.width,
    originalHeight: data.height,
  });

  editorStore.selectElement(id);
  saveState();

  // Wait for DOM updates before updating texture
  await nextTick();
  await nextTick();
  canvasOps.updateCupTexture();
  clearDrawing();
}

const finishDrawing = async () => {
  await saveDrawing()
  drawToolStore.deactivate()
}

const handleEditDrawing = (elementId: string) => {
  const element = editorStore.elements.find(el => el.id === elementId)
  if (element && (element as any).isDrawing) {
    editorStore.deleteElement(elementId)
    saveState()
    canvasOps.updateCupTexture()
  }
  
  editorStore.deselectAll()
  drawToolStore.activate()
  textEditorStore.deactivateTextTool()
  textEditorStore.finishEditing()
}

const selectElement = (id: string) => {
  if (textEditorStore.isEditingText && textEditorStore.editingElementId !== id) {
    finishTextEditing()
  }
  
  editorStore.selectElement(id)
  
  const element = editorStore.elements.find(el => el.id === id)
  if (element && element.type === 'text') {
    const textEl = element as any
    textEditorStore.setSelectedFont(textEl.font)
    textEditorStore.setSelectedFontColor(textEl.color)
  } else if (element && element.type === 'emoji') {
    textEditorStore.setSelectedFont('Emoji')
    textEditorStore.setSelectedFontColor('#000000')
  }
}

const handleDeleteElement = (id: string) => {
  if (elementOps.deleteElement(id)) {
    saveState()
    canvasOps.updateCupTexture()
  }
}

const handleDuplicate = (elementId: string) => {
  elementOps.duplicate(elementId)
  saveState()
  canvasOps.updateCupTexture()
}

const handleBringToFront = (elementId: string) => {
  elementOps.bringToFront(elementId, getKonvaCanvasRef())
  saveState()
  nextTick(() => {
    canvasOps.immediateTextureUpdate()
  })
}

const handleSendToBack = (elementId: string) => {
  elementOps.sendToBack(elementId, getKonvaCanvasRef())
  saveState()
  nextTick(() => {
    canvasOps.immediateTextureUpdate()
  })
}

const handleElementUpdate = (elementId: string, updatedElement: any) => {
  if (editorStore.isElementLocked(elementId)) {
    return
  }
  
  const currentElement = editorStore.elements.find(el => el.id === elementId)
  if (!currentElement) return
  
  const merged = { ...currentElement, ...updatedElement }
  editorStore.updateElement(elementId, merged)
  
  if (textEditorStore.isEditingText && 
      textEditorStore.editingElementId === elementId &&
      (merged.type === 'text' || merged.type === 'emoji') && 
      merged.position && 
      (merged.position.x !== currentElement.position.x || merged.position.y !== currentElement.position.y)) {
    
    updateEditorPositionIfEditing(elementId)
  }
  
  clearTimeout((saveState as any).timeout)
  ;(saveState as any).timeout = setTimeout(() => {
    saveState()
  }, 300)
  canvasOps.debouncedTextureUpdate()
}

const handleMoveElement = (elementId: string) => {
  updateEditorPositionIfEditing(elementId)
}

const updateEditorPositionIfEditing = (elementId: string) => {
  if (textEditorStore.isEditingText) {
    const element = editorStore.elements.find(el => el.id === elementId)
    
    if (element && (element.type === 'text' || element.type === 'emoji')) {
      const canvasContainer = getContainerRef()
      
      if (canvasContainer) {
        const containerRect = canvasContainer.getBoundingClientRect()
        const screenX = containerRect.left + element.position.x
        const screenY = containerRect.top + element.position.y
        
        textEditorStore.setEditingPosition(screenX, screenY)
      }
    }
  }
}

const handleStageClick = (e: any) => {
  // Only cancel editing if clicking on empty stage (not on an element)
  if (textEditorStore.isEditingText) {
    const stage = e.target?.getStage?.()
    if (!e.target || e.target === stage) {
      finishTextEditing()
      return
    }
  }

  if (textEditorStore.textToolActive) {
    const konvaRef = getKonvaCanvasRef()
    const stage = konvaRef?.getStage()
    if (stage) {
      const pos = stage.getPointerPosition()
      if (pos) {
        addNewText(pos.x, pos.y)
      } else {
        addNewText(200, 100)
      }
      textEditorStore.deactivateTextTool()
    }
    return
  }

  editorStore.deselectAll()
}

const handleCheckout = async () => {
  try {
    uiStore.setVisualization('design')
    await nextTick()
    uiStore.prepareForExport()
    await nextTick()
    await canvasOps.updateCupTexture(true)
    uiStore.showCheckout()
  } finally {
    uiStore.restoreAfterExport()
  }
}

const handleDownload = async () => {
  try {
    const canvas = getHiddenCanvas()
    if (!canvas) {
      $q.notify({
        message: 'Canvas not ready for download',
        color: 'negative',
      })
      return
    }

    // Create a download link
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `stachecups-design-${new Date().getTime()}.png`
    link.href = dataUrl
    link.click()

    $q.notify({
      message: 'Design downloaded successfully!',
      color: 'positive',
      icon: 'download',
    })
  } catch (error) {
    $q.notify({
      message: 'Failed to download design',
      color: 'negative',
    })
  }
}

function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1]
  const bstr = atob(arr[arr.length - 1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

const addToCart = async () => {
  $q.loading.show()
  
  try {
    const fileName = `${new Date().toISOString()}.png`
    const { data: response } = await axios.post('/api/s3', { fileName })
    
    const options = {
      headers: {
        'Content-Type': 'image/png',
      },
    }
    
    const canvas = getHiddenCanvas()
    if (!canvas) {
      throw new Error('Canvas not ready')
    }
    
    const file = dataURLtoFile(
      canvas.toDataURL('image/png'),
      fileName
    )
    
    await axios.put(response, file, options)
    
    window.top?.postMessage(response.split('?')[0], '*')
  } finally {
    $q.loading.hide()
  }
}

const handleQuillError = (error: any) => {
  $q.notify({
    message: error.message || 'Text editor error occurred',
    color: 'negative',
    timeout: 3000,
  })
}

const handleZoomIn = () => {
  canvasZoom.value = Math.min(canvasZoom.value + 0.25, 2)
}

const handleZoomOut = () => {
  canvasZoom.value = Math.max(canvasZoom.value - 0.25, 0.25)
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && textEditorStore.isEditingText) {
    textEditorStore.cancelEditing()
  }
  
  if (
    (e.key === 'Delete' || e.key === 'Backspace') &&
    selectedElementId.value &&
    !textEditorStore.isEditingText
  ) {
    handleDeleteElement(selectedElementId.value)
  }
  
  if ((e.ctrlKey || e.metaKey) && !textEditorStore.isEditingText) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
      e.preventDefault()
      redo()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  setTimeout(() => canvasOps.updateCanvasDimensions(), 200)
  setTimeout(() => saveState(), 500)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.image-editor-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}
</style>

