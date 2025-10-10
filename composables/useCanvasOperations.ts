import { ref, computed, nextTick } from 'vue'
import { PRODUCT_DIMENSIONS } from '~/config/products'

export function useCanvasOperations() {
  const route = useRoute()

  const containerRef = ref<HTMLElement | null>(null)
  const konvaCanvasRef = ref<any>(null)
  const hiddenCanvas = ref<HTMLCanvasElement | null>(null)
  
  const selectedProduct = ref(route.query.type as string || 'bandit')
  const selectedStyle = ref(route.query.size as string || '16oz')
  
  const getProductDimensions = (type: string, size: string) => {
    return PRODUCT_DIMENSIONS.find(
      (it) => it.style === size && it.name === type
    )
  }
  
  const initialDimensions = getProductDimensions(selectedProduct.value, selectedStyle.value)
  const canvasWidth = ref(initialDimensions?.width || 252.02)
  const canvasHeight = ref(initialDimensions?.height || 145.63)
  
  const containerWidth = computed(() => containerRef.value?.offsetWidth || 952)
  
  const updateCanvasDimensions = () => {
    const dimensions = PRODUCT_DIMENSIONS.find(
      (it) => it.style === selectedStyle.value && it.name === selectedProduct.value
    )
    
    if (!dimensions) return
    
    canvasWidth.value = dimensions.width
    canvasHeight.value = dimensions.height
    
    if (containerRef.value) {
      containerRef.value.style.setProperty('--canvas-width', `${canvasWidth.value}mm`)
      containerRef.value.style.setProperty('--canvas-height', `${canvasHeight.value}mm`)
      
      const pixelsPerMm = 3.779528
      containerRef.value.style.setProperty('--canvas-width-px', `${canvasWidth.value * pixelsPerMm}px`)
      containerRef.value.style.setProperty('--canvas-height-px', `${canvasHeight.value * pixelsPerMm}px`)
      containerRef.value.style.setProperty('--canvas-aspect-ratio', `${canvasWidth.value / canvasHeight.value}/1`)
    }
  }
  
  const updateCupTexture = async (hideSelection = false) => {
    if (!konvaCanvasRef.value || !hiddenCanvas.value) return

    const canvas = hiddenCanvas.value
    const dimensions = PRODUCT_DIMENSIONS.find(
      (it) => it.style === selectedStyle.value && it.name === selectedProduct.value
    )

    if (!dimensions) return

    const pixelsPerMm = 3.779528
    canvas.width = dimensions.width * pixelsPerMm
    canvas.height = dimensions.height * pixelsPerMm
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    try {
      const stage = konvaCanvasRef.value.getStage()
      if (stage) {
        const konvaDataURL = stage.toDataURL({
          mimeType: 'image/png',
          quality: 1,
          pixelRatio: 2,
        })

        if (konvaDataURL && konvaDataURL !== 'data:,') {
          const img = new Image()
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.drawImage(
              img,
              0, 0, img.width, img.height,
              0, 0, canvas.width, canvas.height
            )

            canvas.dispatchEvent(new Event('update'))
          }
          img.crossOrigin = 'anonymous'
          img.src = konvaDataURL
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          canvas.dispatchEvent(new Event('update'))
        }
      }
    } catch (error) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      canvas.dispatchEvent(new Event('update'))
    }
  }
  
  let textureUpdateTimeout: ReturnType<typeof setTimeout> | null = null
  const debouncedTextureUpdate = () => {
    if (textureUpdateTimeout) clearTimeout(textureUpdateTimeout)
    textureUpdateTimeout = setTimeout(() => {
      updateCupTexture()
    }, 150)
  }

  const immediateTextureUpdate = () => {
    if (textureUpdateTimeout) clearTimeout(textureUpdateTimeout)
    nextTick(() => {
      updateCupTexture()
    })
  }
  
  return {
    containerRef,
    konvaCanvasRef,
    hiddenCanvas,
    selectedProduct,
    selectedStyle,
    canvasWidth,
    canvasHeight,
    containerWidth,
    updateCanvasDimensions,
    updateCupTexture,
    debouncedTextureUpdate,
    immediateTextureUpdate,
  }
}

