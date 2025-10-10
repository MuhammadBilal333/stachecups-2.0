import { defineStore } from 'pinia'

export const useDrawToolStore = defineStore('drawTool', {
  state: () => ({
    isActive: false,
    brushSize: 5,
    brushColor: '#000000',
    currentDrawing: null as any,
    nextDrawingId: 1,
  }),

  getters: {
    brushSettings: (state) => ({
      size: state.brushSize,
      color: state.brushColor,
    }),
  },

  actions: {
    activate() {
      this.isActive = true
    },

    deactivate() {
      this.isActive = false
      this.currentDrawing = null
    },

    toggle() {
      this.isActive = !this.isActive
      if (!this.isActive) {
        this.currentDrawing = null
      }
    },

    setBrushSize(size: number) {
      this.brushSize = Math.max(1, Math.min(50, size))
    },

    setBrushColor(color: string) {
      this.brushColor = color
    },

    setCurrentDrawing(drawing: any) {
      this.currentDrawing = drawing
    },

    clearCurrentDrawing() {
      this.currentDrawing = null
    },

    getNextDrawingId(): string {
      return `draw-${this.nextDrawingId++}`
    },

    reset() {
      this.isActive = false
      this.brushSize = 5
      this.brushColor = '#000000'
      this.currentDrawing = null
    },
  },
})

