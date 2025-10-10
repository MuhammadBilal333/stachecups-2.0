import { defineStore } from 'pinia'

interface TextEditState {
  content: string
  position: { x: number; y: number }
  fontSize: number
  fontFamily: string
  color: string
  width: number
  height: number
}

export const useTextEditorStore = defineStore('textEditor', {
  state: () => ({
    textToolActive: false,
    isEditingText: false,
    editingElementId: null as string | null,
    selectedFont: 'Roboto',
    selectedFontColor: '#FF5CA0',
    editingTextContent: '',
    editingTextPosition: { x: 0, y: 0 },
    editingTextFontSize: 16,
    editingTextFontFamily: 'Roboto',
    editingTextColor: '#FF5CA0',
    editingTextWidth: 300,
    editingTextHeight: 150,
    nextTextId: 1,
  }),

  getters: {
    isActive: (state) => state.textToolActive || state.isEditingText,
    
    editingState: (state): TextEditState => ({
      content: state.editingTextContent,
      position: state.editingTextPosition,
      fontSize: state.editingTextFontSize,
      fontFamily: state.editingTextFontFamily,
      color: state.editingTextColor,
      width: state.editingTextWidth,
      height: state.editingTextHeight,
    }),
  },

  actions: {
    activateTextTool() {
      this.textToolActive = true
    },

    deactivateTextTool() {
      this.textToolActive = false
    },

    startEditing(options?: Partial<TextEditState & { elementId?: string }>) {
      this.isEditingText = true
      this.editingElementId = options?.elementId || null
      
      if (options) {
        this.editingTextContent = options.content || ''
        this.editingTextPosition = options.position || { x: 0, y: 0 }
        this.editingTextFontSize = options.fontSize || 16
        this.editingTextFontFamily = options.fontFamily || 'Roboto'
        this.editingTextColor = options.color || '#FF5CA0'
        this.editingTextWidth = options.width || 400
        this.editingTextHeight = options.height || 150
      }
    },

    finishEditing() {
      this.isEditingText = false
      this.editingElementId = null
    },

    cancelEditing() {
      this.isEditingText = false
      this.editingTextContent = ''
      this.editingElementId = null
    },

    setEditingContent(content: string) {
      this.editingTextContent = content
    },

    setEditingPosition(x: number, y: number) {
      this.editingTextPosition = { x, y }
    },

    setEditingFontSize(size: number) {
      this.editingTextFontSize = size
    },

    setEditingFontFamily(family: string) {
      this.editingTextFontFamily = family
    },

    setEditingColor(color: string) {
      this.editingTextColor = color
    },

    setEditingDimensions(width: number, height: number) {
      this.editingTextWidth = width
      this.editingTextHeight = height
    },

    setSelectedFont(font: string) {
      this.selectedFont = font
    },

    setSelectedFontColor(color: string) {
      this.selectedFontColor = color
    },

    getNextTextId(): string {
      return `txt-${this.nextTextId++}`
    },

    reset() {
      this.textToolActive = false
      this.isEditingText = false
      this.editingTextContent = ''
      this.selectedFont = 'Roboto'
      this.selectedFontColor = '#FF5CA0'
    },
  },
})

