import { defineStore } from 'pinia'
import type { AnyElement, ViewMode, DrawToolOptions, TextToolOptions } from '~/types/editor'
import { ELEMENT_CONFIG, DRAW_CONFIG } from '~/config/constants'

export const useEditorStore = defineStore('editor', {
  state: () => ({
    // Elements
    elements: [] as AnyElement[],
    selectedElementId: null as string | null,
    lockedElements: new Set<string>(),

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

    unlockedElements: (state): AnyElement[] => {
      return state.elements.filter((el) => !state.lockedElements.has(el.id))
    },

    hasElements: (state): boolean => {
      return state.elements.length > 0
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
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
