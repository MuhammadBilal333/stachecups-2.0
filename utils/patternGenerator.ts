import type { Pattern } from '~/store/background'

/**
 * Generate canvas-based patterns for backgrounds
 */
export class PatternGenerator {
  /**
   * Generate a striped pattern
   */
  static generateStripes(color1: string, color2: string, width = 20, angle = 0): string {
    const canvas = document.createElement('canvas')
    canvas.width = width * 2
    canvas.height = width * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Rotate context
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((angle * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Draw stripes
    ctx.fillStyle = color1
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = color2
    ctx.fillRect(0, 0, width, canvas.height)

    return canvas.toDataURL()
  }

  /**
   * Generate a dots pattern
   */
  static generateDots(color: string, bgColor: string, radius = 5, spacing = 20): string {
    const canvas = document.createElement('canvas')
    canvas.width = spacing
    canvas.height = spacing
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(spacing / 2, spacing / 2, radius, 0, Math.PI * 2)
    ctx.fill()

    return canvas.toDataURL()
  }

  /**
   * Generate a grid pattern
   */
  static generateGrid(color: string, bgColor: string, size = 20, lineWidth = 2): string {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(size, 0)
    ctx.moveTo(0, 0)
    ctx.lineTo(0, size)
    ctx.stroke()

    return canvas.toDataURL()
  }

  /**
   * Generate a chevron pattern
   */
  static generateChevron(color1: string, color2: string, size = 40): string {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.fillStyle = color1
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = color2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(size / 2, size / 2)
    ctx.lineTo(size, 0)
    ctx.lineTo(size, size / 4)
    ctx.lineTo(size / 2, size * 0.75)
    ctx.lineTo(0, size / 4)
    ctx.closePath()
    ctx.fill()

    return canvas.toDataURL()
  }

  /**
   * Generate a polka dots pattern
   */
  static generatePolkaDots(color: string, bgColor: string, radius = 8): string {
    const spacing = radius * 4
    const canvas = document.createElement('canvas')
    canvas.width = spacing
    canvas.height = spacing
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = color
    // Main dot
    ctx.beginPath()
    ctx.arc(spacing / 2, spacing / 2, radius, 0, Math.PI * 2)
    ctx.fill()

    return canvas.toDataURL()
  }

  /**
   * Generate a diagonal lines pattern
   */
  static generateDiagonalLines(color: string, bgColor: string, spacing = 10, lineWidth = 2): string {
    const canvas = document.createElement('canvas')
    const size = spacing * 2
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(0, size)
    ctx.lineTo(size, 0)
    ctx.stroke()

    return canvas.toDataURL()
  }

  /**
   * Generate zigzag pattern
   */
  static generateZigzag(color1: string, color2: string, size = 40): string {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size / 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    ctx.fillStyle = color1
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = color2
    ctx.beginPath()
    ctx.moveTo(0, canvas.height)
    ctx.lineTo(size / 4, 0)
    ctx.lineTo(size / 2, canvas.height)
    ctx.lineTo((size * 3) / 4, 0)
    ctx.lineTo(size, canvas.height)
    ctx.lineTo(size, canvas.height)
    ctx.lineTo(0, canvas.height)
    ctx.closePath()
    ctx.fill()

    return canvas.toDataURL()
  }
}

/**
 * Predefined pattern library
 */
export const defaultPatterns: Pattern[] = [
  // Stripes
  {
    id: 'stripe-1',
    name: 'Classic Stripes',
    category: 'Stripes',
    type: 'stripes',
    preview: '',
    config: { color1: '#000000', color2: '#FFFFFF', width: 20, angle: 0 }
  },
  {
    id: 'stripe-2',
    name: 'Diagonal Stripes',
    category: 'Stripes',
    type: 'stripes',
    preview: '',
    config: { color1: '#FF6B6B', color2: '#FFE66D', width: 15, angle: 45 }
  },
  {
    id: 'stripe-3',
    name: 'Thin Stripes',
    category: 'Stripes',
    type: 'stripes',
    preview: '',
    config: { color1: '#4ECDC4', color2: '#FFFFFF', width: 8, angle: 0 }
  },

  // Dots
  {
    id: 'dots-1',
    name: 'Polka Dots',
    category: 'Dots',
    type: 'dots',
    preview: '',
    config: { color: '#FF6B6B', bgColor: '#FFFFFF', radius: 8, spacing: 32 }
  },
  {
    id: 'dots-2',
    name: 'Small Dots',
    category: 'Dots',
    type: 'dots',
    preview: '',
    config: { color: '#4ECDC4', bgColor: '#F7F7F7', radius: 4, spacing: 20 }
  },
  {
    id: 'dots-3',
    name: 'Large Dots',
    category: 'Dots',
    type: 'dots',
    preview: '',
    config: { color: '#95E1D3', bgColor: '#FFFFFF', radius: 12, spacing: 40 }
  },

  // Geometric
  {
    id: 'geo-1',
    name: 'Grid',
    category: 'Geometric',
    type: 'grid',
    preview: '',
    config: { color: '#333333', bgColor: '#FFFFFF', size: 30, lineWidth: 1 }
  },
  {
    id: 'geo-2',
    name: 'Bold Grid',
    category: 'Geometric',
    type: 'grid',
    preview: '',
    config: { color: '#000000', bgColor: '#FFFFFF', size: 40, lineWidth: 3 }
  },
  {
    id: 'geo-3',
    name: 'Chevron',
    category: 'Geometric',
    type: 'chevron',
    preview: '',
    config: { color1: '#667EEA', color2: '#764BA2', size: 50 }
  },
  {
    id: 'geo-4',
    name: 'Zigzag',
    category: 'Geometric',
    type: 'geometric',
    preview: '',
    config: { color1: '#FF6B6B', color2: '#FFFFFF', size: 40 }
  },

  // Abstract
  {
    id: 'abstract-1',
    name: 'Diagonal Lines',
    category: 'Abstract',
    type: 'geometric',
    preview: '',
    config: { color: '#667EEA', bgColor: '#FFFFFF', spacing: 15, lineWidth: 2 }
  },
  {
    id: 'abstract-2',
    name: 'Thin Lines',
    category: 'Abstract',
    type: 'geometric',
    preview: '',
    config: { color: '#CCCCCC', bgColor: '#FFFFFF', spacing: 8, lineWidth: 1 }
  },
]

/**
 * Generate preview for a pattern
 */
export function generatePatternPreview(pattern: Pattern): string {
  const config = pattern.config || {}

  switch (pattern.type) {
    case 'stripes':
      return PatternGenerator.generateStripes(
        config.color1 || '#000000',
        config.color2 || '#FFFFFF',
        config.width || 20,
        config.angle || 0
      )
    
    case 'dots':
      return PatternGenerator.generateDots(
        config.color || '#000000',
        config.bgColor || '#FFFFFF',
        config.radius || 5,
        config.spacing || 20
      )
    
    case 'grid':
      return PatternGenerator.generateGrid(
        config.color || '#000000',
        config.bgColor || '#FFFFFF',
        config.size || 20,
        config.lineWidth || 2
      )
    
    case 'chevron':
      return PatternGenerator.generateChevron(
        config.color1 || '#000000',
        config.color2 || '#FFFFFF',
        config.size || 40
      )
    
    case 'geometric':
      if (pattern.id.includes('zigzag')) {
        return PatternGenerator.generateZigzag(
          config.color1 || '#000000',
          config.color2 || '#FFFFFF',
          config.size || 40
        )
      }
      return PatternGenerator.generateDiagonalLines(
        config.color || '#000000',
        config.bgColor || '#FFFFFF',
        config.spacing || 10,
        config.lineWidth || 2
      )
    
    default:
      return ''
  }
}

/**
 * Initialize patterns with previews
 */
export function initializePatterns(): Pattern[] {
  return defaultPatterns.map(pattern => ({
    ...pattern,
    preview: generatePatternPreview(pattern)
  }))
}

