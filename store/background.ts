import { defineStore } from 'pinia'
import chroma from 'chroma-js'

export interface Pattern {
  id: string
  name: string
  category: string
  type: 'stripes' | 'dots' | 'chevron' | 'grid' | 'waves' | 'geometric'
  preview: string // base64 or url
  config?: any
}

export interface BackgroundState {
  type: 'none' | 'solid' | 'pattern' | 'image'
  solidColor: string
  pattern: Pattern | null
  imageUrl: string | null
  opacity: number
}

export const useBackgroundStore = defineStore('background', {
  state: () => ({
    // Current background
    backgroundType: 'none' as 'none' | 'solid' | 'pattern' | 'image',
    solidColor: '#FFFFFF',
    selectedPattern: null as Pattern | null,
    imageUrl: null as string | null,
    opacity: 1,

    // Color picker state
    colorFormat: 'hex' as 'hex' | 'rgb' | 'cmyk',
    recentColors: [] as string[],
    
    // Pattern categories
    patternCategories: [
      'All',
      'Stripes',
      'Dots',
      'Geometric',
      'Abstract',
      'Nature',
      'Textures'
    ],
    selectedCategory: 'All',
    searchQuery: '',

    // UI state
    showColorPicker: false,
    showPatternPicker: false,
    showVarianceDisclaimer: false,
  }),

  getters: {
    currentBackground: (state): BackgroundState => ({
      type: state.backgroundType,
      solidColor: state.solidColor,
      pattern: state.selectedPattern,
      imageUrl: state.imageUrl,
      opacity: state.opacity,
    }),

    hasBackground: (state): boolean => {
      return state.backgroundType !== 'none'
    },

    // Color conversion getters
    colorAsHex: (state): string => {
      try {
        return chroma(state.solidColor).hex()
      } catch {
        return '#FFFFFF'
      }
    },

    colorAsRgb: (state): { r: number; g: number; b: number } => {
      try {
        const [r, g, b] = chroma(state.solidColor).rgb()
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
      } catch {
        return { r: 255, g: 255, b: 255 }
      }
    },

    colorAsCmyk: (state): { c: number; m: number; y: number; k: number } => {
      try {
        const [c, m, y, k] = chroma(state.solidColor).cmyk()
        return { 
          c: Math.round(c * 100), 
          m: Math.round(m * 100), 
          y: Math.round(y * 100), 
          k: Math.round(k * 100) 
        }
      } catch {
        return { c: 0, m: 0, y: 0, k: 0 }
      }
    },

    // Get filtered patterns (will be used when we load patterns)
    filteredPatterns: (state) => (patterns: Pattern[]) => {
      let filtered = patterns

      // Filter by category
      if (state.selectedCategory !== 'All') {
        filtered = filtered.filter(p => p.category === state.selectedCategory)
      }

      // Filter by search
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        )
      }

      return filtered
    },
  },

  actions: {
    // Background type actions
    setBackgroundType(type: 'none' | 'solid' | 'pattern' | 'image') {
      this.backgroundType = type
      
      // Show disclaimer when user first selects a background
      if (type !== 'none' && !localStorage.getItem('background-disclaimer-shown')) {
        this.showVarianceDisclaimer = true
        localStorage.setItem('background-disclaimer-shown', 'true')
      }
    },

    clearBackground() {
      this.backgroundType = 'none'
      this.selectedPattern = null
      this.imageUrl = null
    },

    // Solid color actions
    setSolidColor(color: string) {
      try {
        // Validate and normalize color
        this.solidColor = chroma(color).hex()
        this.backgroundType = 'solid'
        this.addToRecentColors(this.solidColor)
      } catch (error) {
        console.error('Invalid color:', color)
      }
    },

    setColorFromRgb(r: number, g: number, b: number) {
      this.solidColor = chroma.rgb(r, g, b).hex()
      this.backgroundType = 'solid'
      this.addToRecentColors(this.solidColor)
    },

    setColorFromCmyk(c: number, m: number, y: number, k: number) {
      // Convert percentage back to 0-1 range
      this.solidColor = chroma.cmyk(c/100, m/100, y/100, k/100).hex()
      this.backgroundType = 'solid'
      this.addToRecentColors(this.solidColor)
    },

    setColorFormat(format: 'hex' | 'rgb' | 'cmyk') {
      this.colorFormat = format
    },

    addToRecentColors(color: string) {
      // Remove if already exists
      this.recentColors = this.recentColors.filter(c => c !== color)
      // Add to beginning
      this.recentColors.unshift(color)
      // Keep only last 12
      this.recentColors = this.recentColors.slice(0, 12)
    },

    // Pattern actions
    setPattern(pattern: Pattern) {
      this.selectedPattern = pattern
      this.backgroundType = 'pattern'
    },

    clearPattern() {
      this.selectedPattern = null
      if (this.backgroundType === 'pattern') {
        this.backgroundType = 'none'
      }
    },

    setPatternCategory(category: string) {
      this.selectedCategory = category
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    // Image background
    setImageBackground(url: string) {
      this.imageUrl = url
      this.backgroundType = 'image'
    },

    // Opacity
    setOpacity(opacity: number) {
      this.opacity = Math.max(0, Math.min(1, opacity))
    },

    // UI toggles
    toggleColorPicker() {
      this.showColorPicker = !this.showColorPicker
      if (this.showColorPicker) {
        this.showPatternPicker = false
      }
    },

    togglePatternPicker() {
      this.showPatternPicker = !this.showPatternPicker
      if (this.showPatternPicker) {
        this.showColorPicker = false
      }
    },

    closeAllPickers() {
      this.showColorPicker = false
      this.showPatternPicker = false
    },

    dismissDisclaimer() {
      this.showVarianceDisclaimer = false
    },
  },
})

