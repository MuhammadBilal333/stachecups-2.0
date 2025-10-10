import { useEditorStore } from '~/store/editor'
import { useDrawToolStore } from '~/store/drawTool'
import { useTextEditorStore } from '~/store/textEditor'
import type { AnyElement } from '~/types/editor'

export function useElementOperations() {
  const editorStore = useEditorStore()
  const drawToolStore = useDrawToolStore()
  const textEditorStore = useTextEditorStore()
  const $q = useQuasar()
  
  const nextImageId = ref(1)
  
  const addImageFromUrl = (url: string) => {
    const id = `img-${nextImageId.value++}`
    
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
  
  const addImageFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const id = `img-${nextImageId.value++}`
        
        editorStore.addElement({
          id,
          type: 'image',
          src: event.target?.result as string,
          position: { x: 100, y: 100 },
          scale: 1,
          rotation: 0,
          width: 200,
          height: 200,
        } as AnyElement)
        
        resolve(id)
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }
  
  const addEmoji = (emoji: string) => {
    const id = textEditorStore.getNextTextId()
    
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
    const id = textEditorStore.getNextTextId()
    
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
    const id = drawToolStore.getNextDrawingId()
    
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
      newId = `img-${nextImageId.value++}`
    } else {
      newId = textEditorStore.getNextTextId()
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
    editorStore.updateElement(elementId, { font })
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

