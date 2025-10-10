export interface FontOption {
  label: string
  value: string
  fontFamily: string
}

export const AVAILABLE_FONTS: FontOption[] = [
  { label: 'Sans Serif', value: 'sans', fontFamily: 'Arial, sans-serif' },
  { label: 'Serif', value: 'serif', fontFamily: 'Georgia, serif' },
  { label: 'Monospace', value: 'mono', fontFamily: 'Courier New, monospace' },
  { label: 'Cursive', value: 'cursive', fontFamily: 'Comic Sans MS, cursive' },
  { label: 'Fantasy', value: 'fantasy', fontFamily: 'Impact, fantasy' },
  { label: 'Poppins', value: 'poppins', fontFamily: 'Poppins, sans-serif' },
  { label: 'Roboto', value: 'roboto', fontFamily: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: 'opensans', fontFamily: 'Open Sans, sans-serif' },
  { label: 'Lato', value: 'lato', fontFamily: 'Lato, sans-serif' },
]

export const CUSTOM_MONOGRAM_FONTS = [
  { label: 'Monogram KK', value: 'monogram_kk', path: '/fonts/monogram_kk.woff2' },
  { label: 'Round Monogram Center', value: 'round_monogram_center', path: '/fonts/round_monogram_center.woff2' },
  { label: 'Round Monogram Left', value: 'round_monogram_left', path: '/fonts/round_monogram_left.woff2' },
  { label: 'Round Monogram Right', value: 'round_monogram_right', path: '/fonts/round_monogram_right.woff2' },
]

export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96]

export function getFontFamily(fontValue: string): string {
  const font = AVAILABLE_FONTS.find((f) => f.value === fontValue)
  return font?.fontFamily || 'Arial, sans-serif'
}
