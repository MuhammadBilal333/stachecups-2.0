import { nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useEditorStore } from '~/store/editor'
import { useDrawToolStore } from '~/store/drawTool'
import { useTextEditorStore } from '~/store/textEditor'
import type { AnyElement } from '~/types/editor'
import { generateImageId, generateTextId, generateEmojiId, generateDrawingId } from '~/utils/idGenerator'
import { validateImageFile, fileToDataURL } from '~/utils/fileValidation'
import { handleError, showSuccessNotification, ErrorType } from '~/utils/errorHandler'

export function useElementOperations() {
  const editorStore = useEditorStore()
  const drawToolStore = useDrawToolStore()
  const textEditorStore = useTextEditorStore()
  const $q = useQuasar()
  
  const addImageFromUrl = (url: string) => {
    const id = generateImageId()

    editorStore.addElement({
      id,
      type: 'image',
      src: url,
      position: { x: 100, y: 100 },
      scale: 1,
      rotation: 0,
      width: 200,
      height: 200,
    } as AnyElement)

    return id
  }

  const addImageFromFile = async (file: File): Promise<string> => {
    // Validate the file
    const validationResult = await validateImageFile(file)
    if (!validationResult.valid && validationResult.error) {
      handleError(validationResult.error, ErrorType.FILE_UPLOAD)
      throw validationResult.error
    }

    try {
      const dataURL = await fileToDataURL(file)
      const id = generateImageId()

      editorStore.addElement({
        id,
        type: 'image',
        src: dataURL,
        position: { x: 100, y: 100 },
        scale: 1,
        rotation: 0,
        width: 200,
        height: 200,
      } as AnyElement)

      showSuccessNotification('Image added successfully')
      return id
    } catch (error) {
      handleError(error as Error, ErrorType.FILE_UPLOAD)
      throw error
    }
  }
  
  const addEmoji = (emoji: string) => {
    const id = generateEmojiId()

    editorStore.addElement({
      id,
      content: emoji,
      emoji: emoji,
      type: 'emoji',
      position: { x: 50, y: 50 },
      scale: 5,
      rotation: 0,
      width: 100,
      height: 100,
      editable: false,
    } as AnyElement)

    return id
  }

  const addText = (x: number, y: number) => {
    const id = generateTextId()

    const newText: AnyElement = {
      id,
      content: '',
      position: { x, y },
      scale: 1,
      rotation: 0,
      font: textEditorStore.selectedFont,
      color: textEditorStore.selectedFontColor,
      fontSize: 16,
      bold: false,
      italic: false,
      underline: false,
      transformation: '',
      editable: true,
      type: 'text',
      width: 300,
      height: 100,
    } as AnyElement

    editorStore.addElement(newText)
    return id
  }

  const addDrawing = (imageData: string, bounds: { left: number; top: number; width: number; height: number }) => {
    const id = generateDrawingId()

    const centerX = bounds.left + bounds.width / 2
    const centerY = bounds.top + bounds.height / 2

    editorStore.addElement({
      id,
      type: 'image',
      src: imageData,
      position: { x: centerX, y: centerY },
      scale: 1,
      rotation: 0,
      width: bounds.width,
      height: bounds.height,
      isDrawing: true,
      originalWidth: bounds.width,
      originalHeight: bounds.height,
    } as AnyElement)

    return id
  }

  const duplicate = (elementId: string) => {
    const element = editorStore.elements.find(el => el.id === elementId)
    if (!element) return null

    let newId: string
    if (element.type === 'image') {
      newId = generateImageId()
    } else if (element.type === 'emoji') {
      newId = generateEmojiId()
    } else {
      newId = generateTextId()
    }

    const duplicated = {
      ...element,
      id: newId,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
    }

    editorStore.addElement(duplicated)
    editorStore.selectElement(newId)

    showSuccessNotification('Element duplicated successfully')
    return newId
  }
  
  const deleteElement = (elementId: string) => {
    if (editorStore.isElementLocked(elementId)) {
      $q.notify({
        message: 'Element is locked and cannot be deleted',
        color: 'warning',
      })
      return false
    }
    
    editorStore.deleteElement(elementId)
    return true
  }
  
  const rotateElement = (elementId: string) => {
    const element = editorStore.elements.find(el => el.id === elementId)
    if (!element) return
    
    const newRotation = (element.rotation || 0) + 90
    editorStore.updateElement(elementId, { rotation: newRotation })
    
    $q.notify({
      message: `Element rotated by 90° (${newRotation}° total)`,
      color: 'positive',
      timeout: 1500,
    })
  }
  
  const bringToFront = (elementId: string, konvaCanvasRef?: any) => {
    const index = editorStore.elements.findIndex(el => el.id === elementId)
    if (index === -1) return
    
    const element = editorStore.elements[index]
    const elements = [...editorStore.elements]
    elements.splice(index, 1)
    elements.push(element)
    editorStore.elements = elements
    
    // Trigger Konva stage redraw if available
    if (konvaCanvasRef) {
      nextTick(() => {
        const stage = konvaCanvasRef.getStage?.()
        if (stage) {
          stage.batchDraw()
        }
      })
    }
  }
  
  const sendToBack = (elementId: string, konvaCanvasRef?: any) => {
    const index = editorStore.elements.findIndex(el => el.id === elementId)
    if (index === -1) return
    
    const element = editorStore.elements[index]
    const elements = [...editorStore.elements]
    elements.splice(index, 1)
    elements.unshift(element)
    editorStore.elements = elements
    
    // Trigger Konva stage redraw if available
    if (konvaCanvasRef) {
      nextTick(() => {
        const stage = konvaCanvasRef.getStage?.()
        if (stage) {
          stage.batchDraw()
        }
      })
    }
  }
  
  const updateTextFont = (elementId: string, font: string) => {
    const element = editorStore.elements.find(el => el.id === elementId)
    if (!element) return

    // For monograms, regenerate content based on layout style when font changes
    if (element.type === 'monogram' && element.monogramLetters && element.layoutStyle) {
      const { first, middle, last } = element.monogramLetters
      const layout = element.layoutStyle
      let regeneratedContent = ''

      // Regenerate content based on layout style (same logic as MonogramPicker)
      const letterCount = [first, middle, last].filter(l => l && String(l).length > 0).length
      const f = (first || '').toUpperCase()
      const m = (middle || '').toUpperCase()
      const l = (last || '').toUpperCase()

      if (letterCount === 1) {
        regeneratedContent = f
      } else if (letterCount === 2) {
        switch (layout) {
          case 'horizontal':
            regeneratedContent = `${f} ${l}`
            break
          case 'stacked':
          case 'vertical':
            regeneratedContent = `${f}\n${l}`
            break
          case 'circle':
          default:
            regeneratedContent = `${f}${l}`
        }
      } else {
        // For 3 letters
        switch (layout) {
          case 'traditional':
            regeneratedContent = `${f}${l}${m}` // First-Last-Middle
            break
          case 'horizontal':
            regeneratedContent = `${f}${m}${l}`
            break
          case 'stacked':
          case 'vertical':
            regeneratedContent = `${f}\n${m}\n${l}`
            break
          case 'circle':
          default:
            regeneratedContent = `${f}${m}${l}`
        }
      }

      editorStore.updateElement(elementId, {
        font,
        content: regeneratedContent
      })
    } else {
      // Regular text element - just update font
      editorStore.updateElement(elementId, { font })
    }

    textEditorStore.setSelectedFont(font)

    if (textEditorStore.isEditingText) {
      textEditorStore.setEditingFontFamily(font)
    }
  }
  
  const updateTextColor = (elementId: string, color: string) => {
    editorStore.updateElement(elementId, { color })
    textEditorStore.setSelectedFontColor(color)
    
    if (textEditorStore.isEditingText) {
      textEditorStore.setEditingColor(color)
    }
  }
  
  const changeImageSource = (elementId: string, newSrc: string) => {
    editorStore.updateElement(elementId, {
      src: newSrc,
      isDrawing: false,
      originalWidth: undefined,
      originalHeight: undefined,
    })
  }
  
  return {
    addImageFromUrl,
    addImageFromFile,
    addEmoji,
    addText,
    addDrawing,
    duplicate,
    deleteElement,
    rotateElement,
    bringToFront,
    sendToBack,
    updateTextFont,
    updateTextColor,
    changeImageSource,
  }
}

