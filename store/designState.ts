import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash-es'
import { z } from 'zod'
import { useEditorStore } from './editor'
import { useProductStore } from './product'
import { useBackgroundStore } from './background'

// Zod validation schemas
const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

const ElementSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'emoji', 'monogram']),
  position: PositionSchema,
  scale: z.number(),
  rotation: z.number(),
  // Allow any additional properties
}).passthrough()

const BackgroundSchema = z.object({
  type: z.enum(['none', 'solid', 'pattern', 'image']),
  solidColor: z.string().optional(),
  pattern: z.any().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  opacity: z.number(),
}).passthrough()

const ProductSchema = z.object({
  type: z.string(),
  size: z.string(),
  width: z.number(),
  height: z.number(),
})

const DesignStateSchema = z.object({
  version: z.string(),
  timestamp: z.number(),
  product: ProductSchema,
  elements: z.array(ElementSchema),
  background: BackgroundSchema.nullable(),
  selectedElementId: z.string().nullable(),
  lockedElements: z.array(z.string()),
  hiddenElements: z.array(z.string()),
})

export type DesignState = z.infer<typeof DesignStateSchema>

const AUTOSAVE_KEY = 'stachecups_design_autosave'
const AUTOSAVE_INTERVAL = 3000 // 3 seconds
const DESIGN_VERSION = '2.0' // Increment version for breaking changes

export const useDesignStateStore = defineStore('designState', {
  state: () => ({
    lastSaveTime: null as Date | null,
    isSaving: false,
    hasUnsavedChanges: false,
    autosaveEnabled: true,
    autosaveTimer: null as ReturnType<typeof setTimeout> | null,
    lastSaveHash: '',
    isInitialized: false,
  }),

  getters: {
    timeSinceLastSave: (state): string | null => {
      if (!state.lastSaveTime) return null

      const now = new Date()
      const diff = now.getTime() - state.lastSaveTime.getTime()
      const seconds = Math.floor(diff / 1000)

      if (seconds < 60) return 'Just now'
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
      return `${Math.floor(seconds / 3600)}h ago`
    },
  },

  actions: {
    /**
     * Capture current design state from all stores with deep cloning
     */
    captureCurrentState(): DesignState {
      console.log('📸 Capturing current design state...')

      const editorStore = useEditorStore()
      const productStore = useProductStore()
      const backgroundStore = useBackgroundStore()

      // Deep clone to avoid reference issues
      const elements = cloneDeep(editorStore.elements)
      const background = cloneDeep(backgroundStore.currentBackground)

      const state: DesignState = {
        version: DESIGN_VERSION,
        timestamp: Date.now(),
        product: {
          type: productStore.currentProduct.type,
          size: productStore.currentProduct.size,
          width: productStore.currentProduct.width,
          height: productStore.currentProduct.height,
        },
        elements: elements,
        background: background || null,
        selectedElementId: editorStore.selectedElementId,
        lockedElements: Array.from(editorStore.lockedElements),
        hiddenElements: Array.from(editorStore.hiddenElements),
      }

      console.log('✅ State captured:', {
        version: state.version,
        elements: state.elements.length,
        hasBackground: !!state.background && state.background.type !== 'none',
        product: `${state.product.type} ${state.product.size}`,
      })

      return state
    },

    /**
     * Validate design state structure
     */
    validateState(state: any): state is DesignState {
      try {
        DesignStateSchema.parse(state)
        return true
      } catch (error) {
        console.error('❌ Invalid design state:', error)
        return false
      }
    },

    /**
     * Restore design state to all stores with validation
     */
    async restoreState(designState: DesignState): Promise<boolean> {
      try {
        console.log('🔄 Starting restore with validated state')
        console.log('📊 State details:', {
          version: designState.version,
          elements: designState.elements.length,
          background: designState.background?.type || 'none',
          product: `${designState.product.type} ${designState.product.size}`,
        })

        // Validate state structure
        if (!this.validateState(designState)) {
          console.error('❌ State validation failed')
          return false
        }

        const editorStore = useEditorStore()
        const productStore = useProductStore()
        const backgroundStore = useBackgroundStore()

        // Step 1: Restore product first (affects canvas dimensions)
        console.log('📦 Step 1: Restoring product...')
        productStore.setProduct({
          type: designState.product.type,
          size: designState.product.size,
          width: designState.product.width,
          height: designState.product.height,
        })
        console.log('✅ Product restored')

        // Step 2: Clear existing elements
        console.log('🧹 Step 2: Clearing existing elements...')
        editorStore.clearElements()
        console.log('✅ Elements cleared')

        // Step 3: Restore background
        console.log('🎨 Step 3: Restoring background...')
        if (designState.background && designState.background.type !== 'none') {
          const bg = designState.background

          if (bg.type === 'solid' && bg.solidColor) {
            console.log(`  → Setting solid color: ${bg.solidColor}`)
            backgroundStore.setSolidColor(bg.solidColor, false)
          } else if (bg.type === 'pattern' && bg.pattern) {
            console.log(`  → Setting pattern: ${bg.pattern.name}`)
            backgroundStore.setPattern(bg.pattern)
          } else if (bg.type === 'image' && bg.imageUrl) {
            console.log(`  → Setting image: ${bg.imageUrl}`)
            backgroundStore.setImageBackground(bg.imageUrl)
          }

          if (bg.opacity !== undefined && bg.opacity !== 1) {
            console.log(`  → Setting opacity: ${bg.opacity}`)
            backgroundStore.setOpacity(bg.opacity)
          }
        } else {
          console.log('  → Clearing background')
          backgroundStore.clearBackground()
        }
        console.log('✅ Background restored')

        // Step 4: Restore elements with deep clone
        console.log('📝 Step 4: Restoring elements...')
        const elementsToRestore = cloneDeep(designState.elements)

        console.log(`  → Processing ${elementsToRestore.length} elements`)
        for (const element of elementsToRestore) {
          // Ensure required properties
          element.position = element.position || { x: 100, y: 100 }
          element.scale = element.scale ?? 1
          element.rotation = element.rotation ?? 0

          console.log(`  ✓ ${element.type} [${element.id}] at (${element.position.x}, ${element.position.y})`)

          // Add to store
          editorStore.addElement(element)
        }
        console.log(`✅ ${elementsToRestore.length} elements restored`)

        // Step 5: Restore selection
        console.log('🎯 Step 5: Restoring selection...')
        editorStore.selectElement(designState.selectedElementId)
        console.log(`  → Selected: ${designState.selectedElementId || 'none'}`)

        // Step 6: Restore locked/hidden states
        console.log('🔒 Step 6: Restoring locked/hidden states...')
        editorStore.lockedElements.clear()
        if (designState.lockedElements) {
          designState.lockedElements.forEach(id => {
            editorStore.lockedElements.add(id)
          })
          console.log(`  → Locked ${designState.lockedElements.length} elements`)
        }

        editorStore.hiddenElements.clear()
        if (designState.hiddenElements) {
          designState.hiddenElements.forEach(id => {
            editorStore.hiddenElements.add(id)
          })
          console.log(`  → Hidden ${designState.hiddenElements.length} elements`)
        }
        console.log('✅ States restored')

        // Update hash
        this.lastSaveHash = this.getStateHash()
        this.hasUnsavedChanges = false

        console.log('✅ RESTORE COMPLETE - All steps finished')
        console.log('📊 Final check:', {
          elementsInStore: editorStore.elements.length,
          selectedId: editorStore.selectedElementId,
          background: backgroundStore.backgroundType,
        })

        return true
      } catch (error) {
        console.error('❌ RESTORE FAILED:', error)
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
        return false
      }
    },

    /**
     * Generate hash of current state to detect changes
     */
    getStateHash(): string {
      const state = this.captureCurrentState()
      const { timestamp, ...stateWithoutTime } = state
      return JSON.stringify(stateWithoutTime)
    },

    /**
     * Check if state has changed since last save
     */
    hasStateChanged(): boolean {
      const editorStore = useEditorStore()

      // Don't save if no elements and no background
      if (editorStore.elements.length === 0) {
        return false
      }

      const currentHash = this.getStateHash()
      return currentHash !== this.lastSaveHash
    },

    /**
     * Save to localStorage with validation
     */
    saveToLocalStorage(): boolean {
      try {
        const editorStore = useEditorStore()

        // Don't save empty designs
        if (editorStore.elements.length === 0) {
          console.log('📭 Skipping save - no elements')
          return true
        }

        // Only save if state has changed
        if (!this.hasStateChanged()) {
          return true
        }

        this.isSaving = true
        const state = this.captureCurrentState()

        // Validate before saving
        if (!this.validateState(state)) {
          console.error('❌ Cannot save - invalid state')
          this.isSaving = false
          return false
        }

        console.log('💾 Saving to localStorage:', {
          elements: state.elements.length,
          background: state.background?.type || 'none',
          product: `${state.product.type} ${state.product.size}`,
          size: JSON.stringify(state).length + ' bytes',
        })

        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state))

        this.lastSaveTime = new Date()
        this.lastSaveHash = this.getStateHash()
        this.hasUnsavedChanges = false
        this.isSaving = false

        console.log('✅ Save complete')
        return true
      } catch (error) {
        console.error('❌ Save failed:', error)
        this.isSaving = false
        return false
      }
    },

    /**
     * Load from localStorage with validation
     */
    loadFromLocalStorage(): DesignState | null {
      try {
        const saved = localStorage.getItem(AUTOSAVE_KEY)
        if (!saved) {
          console.log('📭 No saved design in localStorage')
          return null
        }

        console.log('📬 Loading from localStorage...')
        const state = JSON.parse(saved)

        // Validate structure
        if (!this.validateState(state)) {
          console.warn('⚠️ Invalid saved state - clearing localStorage')
          this.clearLocalStorage()
          return null
        }

        // Check version compatibility
        if (state.version !== DESIGN_VERSION) {
          console.warn(`⚠️ Version mismatch: saved=${state.version}, current=${DESIGN_VERSION}`)
          // Could add migration logic here
        }

        console.log('✅ Loaded design:', {
          version: state.version,
          elements: state.elements.length,
          background: state.background?.type || 'none',
          timestamp: new Date(state.timestamp).toLocaleString(),
        })

        return state
      } catch (error) {
        console.error('❌ Load failed:', error)
        console.warn('⚠️ Clearing corrupt localStorage data')
        this.clearLocalStorage()
        return null
      }
    },

    /**
     * Clear localStorage
     */
    clearLocalStorage() {
      console.log('🧹 Clearing localStorage')
      localStorage.removeItem(AUTOSAVE_KEY)
      this.lastSaveHash = ''
      this.hasUnsavedChanges = false
    },

    /**
     * Generate shareable link with validation
     */
    generateShareableLink(): string {
      try {
        const state = this.captureCurrentState()

        // Validate before encoding
        if (!this.validateState(state)) {
          console.error('❌ Cannot generate link - invalid state')
          return ''
        }

        const json = JSON.stringify(state)
        const encoded = btoa(unescape(encodeURIComponent(json)))

        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const path = typeof window !== 'undefined' ? window.location.pathname : ''

        const link = `${baseUrl}${path}?design=${encoded}`

        console.log('🔗 Generated shareable link:', {
          size: encoded.length + ' characters',
          elements: state.elements.length,
        })

        return link
      } catch (error) {
        console.error('❌ Failed to generate link:', error)
        return ''
      }
    },

    /**
     * Load from URL parameter with validation
     */
    loadFromUrl(): boolean {
      try {
        if (typeof window === 'undefined') return false

        const urlParams = new URLSearchParams(window.location.search)
        const designParam = urlParams.get('design')

        if (!designParam) return false

        console.log('🔗 Loading from URL parameter...')

        // Decode
        const json = decodeURIComponent(escape(atob(designParam)))
        const state = JSON.parse(json)

        // Validate
        if (!this.validateState(state)) {
          console.error('❌ Invalid URL design state')
          return false
        }

        // Restore
        return this.restoreState(state) as unknown as boolean
      } catch (error) {
        console.error('❌ Failed to load from URL:', error)
        return false
      }
    },

    /**
     * Start autosave with validation
     */
    startAutosave() {
      if (!this.autosaveEnabled) return

      console.log('🚀 Starting autosave (every 3 seconds)...')

      // Clear any existing timer
      this.stopAutosave()

      // Setup interval
      this.autosaveTimer = setInterval(() => {
        if (this.hasStateChanged()) {
          this.saveToLocalStorage()
        }
      }, AUTOSAVE_INTERVAL)

      this.isInitialized = true
    },

    /**
     * Stop autosave
     */
    stopAutosave() {
      if (this.autosaveTimer) {
        clearInterval(this.autosaveTimer)
        this.autosaveTimer = null
        console.log('⏹️ Autosave stopped')
      }
    },

    /**
     * Export design as JSON file
     */
    exportAsJson() {
      const state = this.captureCurrentState()
      const json = JSON.stringify(state, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `stachecups-design-${Date.now()}.json`
      link.click()

      URL.revokeObjectURL(url)

      console.log('💾 Design exported as JSON')
    },

    /**
     * Import design from JSON file with validation
     */
    async importFromJson(file: File): Promise<boolean> {
      try {
        const text = await file.text()
        const state = JSON.parse(text)

        if (!this.validateState(state)) {
          throw new Error('Invalid design file structure')
        }

        return this.restoreState(state)
      } catch (error) {
        console.error('❌ Import failed:', error)
        return false
      }
    },

    /**
     * Create a new blank design
     */
    createNewDesign() {
      console.log('🆕 Creating new design...')

      const editorStore = useEditorStore()
      const backgroundStore = useBackgroundStore()

      editorStore.clearElements()
      editorStore.deselectAll()
      backgroundStore.clearBackground()

      this.clearLocalStorage()
      this.lastSaveHash = this.getStateHash()
      this.hasUnsavedChanges = false

      console.log('✅ New design created')
    },
  },
})
