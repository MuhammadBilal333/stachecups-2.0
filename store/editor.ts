import { defineStore } from 'pinia'
import type { AnyElement, ViewMode, DrawToolOptions, TextToolOptions } from '~/types/editor'
import { ELEMENT_CONFIG, DRAW_CONFIG } from '~/config/constants'
import { generateElementId } from '~/utils/idGenerator'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    // Elements
    elements: [] as AnyElement[],
    selectedElementId: null as string | null,
    lockedElements: new Set<string>(),
    hiddenElements: new Set<string>(),

    // Tools
    currentTool: null as 'select' | 'text' | 'draw' | null,
    drawMode: false,
    textToolActive: false,

    // Draw Tool Options
    drawOptions: {
      brushSize: DRAW_CONFIG.DEFAULT_BRUSH_SIZE,
      color: DRAW_CONFIG.DEFAULT_COLOR,
    } as DrawToolOptions,

    // Text Tool Options
    textOptions: {
      font: 'sans',
      fontSize: ELEMENT_CONFIG.TEXT_DEFAULT_SIZE,
      color: ELEMENT_CONFIG.TEXT_DEFAULT_COLOR,
      bold: false,
      italic: false,
      underline: false,
    } as TextToolOptions,

    // View
    viewMode: 'design' as ViewMode,

    // Product
    cupType: 'bandit',
    cupSize: '23oz',
    canvasWidth: 800,
    canvasHeight: 600,
  }),

  getters: {
    selectedElement: (state): AnyElement | undefined => {
      return state.elements.find((el) => el.id === state.selectedElementId)
    },

    isElementLocked: (state) => {
      return (id: string) => state.lockedElements.has(id)
    },

    isElementHidden: (state) => {
      return (id: string) => state.hiddenElements.has(id)
    },

    visibleElements: (state): AnyElement[] => {
      return state.elements.filter((el) => !state.hiddenElements.has(el.id))
    },

    unlockedElements: (state): AnyElement[] => {
      return state.elements.filter((el) => !state.lockedElements.has(el.id))
    },

    hasElements: (state): boolean => {
      return state.elements.length > 0
    },

    // Layer panel organized elements (bottom to top, reverse for display)
    layeredElements: (state): AnyElement[] => {
      return [...state.elements].reverse()
    },
  },

  actions: {
    // Element Management
    addElement(element: AnyElement) {
      // Ensure element has valid position and defaults
      if (!element.position || typeof element.position.x !== 'number' || typeof element.position.y !== 'number') {
        element.position = { x: 100, y: 100 }
      }
      if (typeof element.scale !== 'number') {
        element.scale = 1
      }
      if (typeof element.rotation !== 'number') {
        element.rotation = 0
      }

      this.elements.push(element)
      this.selectedElementId = element.id
    },

    updateElement(id: string, updates: Partial<AnyElement>) {
      const index = this.elements.findIndex((el) => el.id === id)
      if (index !== -1) {
        this.elements[index] = { ...this.elements[index], ...updates } as AnyElement
      }
    },

    deleteElement(id: string) {
      this.elements = this.elements.filter((el) => el.id !== id)
      if (this.selectedElementId === id) {
        this.selectedElementId = null
      }
      this.lockedElements.delete(id)
    },

    duplicateElement(id: string) {
      const element = this.elements.find((el) => el.id === id)
      if (!element) return

      const newElement: AnyElement = {
        ...element,
        id: generateElementId(element.type),
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20,
        },
      }

      this.addElement(newElement)
    },

    clearElements() {
      this.elements = []
      this.selectedElementId = null
      this.lockedElements.clear()
    },

    // Selection
    selectElement(id: string | null) {
      this.selectedElementId = id
    },

    deselectAll() {
      this.selectedElementId = null
    },

    // Locking
    toggleLock(id: string) {
      if (this.lockedElements.has(id)) {
        this.lockedElements.delete(id)
      } else {
        this.lockedElements.add(id)
      }
    },

    lockElement(id: string) {
      this.lockedElements.add(id)
    },

    unlockElement(id: string) {
      this.lockedElements.delete(id)
    },

    // Visibility
    toggleVisibility(id: string) {
      if (this.hiddenElements.has(id)) {
        this.hiddenElements.delete(id)
      } else {
        this.hiddenElements.add(id)
        // Deselect if hiding selected element
        if (this.selectedElementId === id) {
          this.selectedElementId = null
        }
      }
    },

    hideElement(id: string) {
      this.hiddenElements.add(id)
      if (this.selectedElementId === id) {
        this.selectedElementId = null
      }
    },

    showElement(id: string) {
      this.hiddenElements.delete(id)
    },

    // Layer Reordering
    moveElementToIndex(id: string, newIndex: number) {
      const currentIndex = this.elements.findIndex((el) => el.id === id)
      if (currentIndex === -1) return

      const element = this.elements[currentIndex]
      const newElements = [...this.elements]
      newElements.splice(currentIndex, 1)
      newElements.splice(newIndex, 0, element)
      this.elements = newElements
    },

    bringToFront(id: string) {
      const index = this.elements.findIndex((el) => el.id === id)
      if (index === -1 || index === this.elements.length - 1) return

      const element = this.elements[index]
      const newElements = [...this.elements]
      newElements.splice(index, 1)
      newElements.push(element)
      this.elements = newElements
    },

    sendToBack(id: string) {
      const index = this.elements.findIndex((el) => el.id === id)
      if (index === -1 || index === 0) return

      const element = this.elements[index]
      const newElements = [...this.elements]
      newElements.splice(index, 1)
      newElements.unshift(element)
      this.elements = newElements
    },

    moveUp(id: string) {
      const index = this.elements.findIndex((el) => el.id === id)
      if (index === -1 || index === this.elements.length - 1) return

      const element = this.elements[index]
      const newElements = [...this.elements]
      newElements.splice(index, 1)
      newElements.splice(index + 1, 0, element)
      this.elements = newElements
    },

    moveDown(id: string) {
      const index = this.elements.findIndex((el) => el.id === id)
      if (index === -1 || index === 0) return

      const element = this.elements[index]
      const newElements = [...this.elements]
      newElements.splice(index, 1)
      newElements.splice(index - 1, 0, element)
      this.elements = newElements
    },

    // Alignment
    alignElements(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
      const selectedId = this.selectedElementId
      if (!selectedId) return

      const element = this.elements.find((el) => el.id === selectedId)
      if (!element) return

      const canvasWidth = this.canvasWidth
      const canvasHeight = this.canvasHeight
      const elementWidth = element.width * (element.scale || 1)
      const elementHeight = element.height * (element.scale || 1)

      switch (alignment) {
        case 'left':
          element.position.x = 0
          break
        case 'center':
          element.position.x = (canvasWidth - elementWidth) / 2
          break
        case 'right':
          element.position.x = canvasWidth - elementWidth
          break
        case 'top':
          element.position.y = 0
          break
        case 'middle':
          element.position.y = (canvasHeight - elementHeight) / 2
          break
        case 'bottom':
          element.position.y = canvasHeight - elementHeight
          break
      }
    },

    // Tools
    setTool(tool: 'select' | 'text' | 'draw' | null) {
      this.currentTool = tool
      this.drawMode = tool === 'draw'
      this.textToolActive = tool === 'text'
    },

    activateDrawMode() {
      this.setTool('draw')
    },

    deactivateDrawMode() {
      if (this.currentTool === 'draw') {
        this.setTool('select')
      }
    },

    activateTextTool() {
      this.setTool('text')
    },

    deactivateTextTool() {
      if (this.currentTool === 'text') {
        this.setTool('select')
      }
    },

    // Draw Options
    updateDrawOptions(options: Partial<DrawToolOptions>) {
      this.drawOptions = { ...this.drawOptions, ...options }
    },

    // Text Options
    updateTextOptions(options: Partial<TextToolOptions>) {
      this.textOptions = { ...this.textOptions, ...options }
    },

    // View Mode
    setViewMode(mode: ViewMode) {
      this.viewMode = mode
    },

    // Product Configuration
    setProduct(type: string, size: string, width: number, height: number) {
      this.cupType = type
      this.cupSize = size
      this.canvasWidth = width
      this.canvasHeight = height
    },

    // State Management
    setState(state: { elements: AnyElement[]; selectedElementId: string | null }) {
      // Ensure all elements have valid positions when restoring state
      this.elements = state.elements.map(el => {
        if (!el.position || typeof el.position.x !== 'number' || typeof el.position.y !== 'number') {
          el.position = { x: 100, y: 100 }
        }
        if (typeof el.scale !== 'number') {
          el.scale = 1
        }
        if (typeof el.rotation !== 'number') {
          el.rotation = 0
        }
        return el
      })
      this.selectedElementId = state.selectedElementId
    },

    getState(): { elements: AnyElement[]; selectedElementId: string | null } {
      return {
        elements: JSON.parse(JSON.stringify(this.elements)),
        selectedElementId: this.selectedElementId,
      }
    },
  },
})
