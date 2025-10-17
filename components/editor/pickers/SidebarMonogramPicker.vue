<template>
  <div class="sidebar-monogram-picker">
    <!-- Step 1: Template Selection -->
    <div class="monogram-step" :class="{ active: currentStep === 1 }">
      <div class="step-header">
        <div class="step-number">1</div>
        <div class="step-title">Choose Style</div>
      </div>
      
      <div class="templates-grid">
        <div
          v-for="template in templates"
          :key="template.id"
          class="template-card"
          :class="{ selected: selectedTemplate?.id === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-preview">
            <div class="template-icon" :class="template.layoutStyle">
              {{ getTemplateIcon(template.layoutStyle) }}
            </div>
          </div>
          <div class="template-name">{{ template.name }}</div>
        </div>
      </div>
    </div>

    <!-- Step 2: Letters Input -->
    <div class="monogram-step" :class="{ active: currentStep === 2 }" v-if="selectedTemplate">
      <div class="step-header">
        <div class="step-number">2</div>
        <div class="step-title">Enter Letters</div>
      </div>

      <div class="letters-input-section">
        <div class="input-grid">
          <div v-if="selectedTemplate.letterCount >= 1" class="letter-input-group">
            <label class="input-label">First Name</label>
            <q-input
              v-model="firstLetter"
              maxlength="1"
              outlined
              dense
              class="letter-input"
              @input="updatePreview"
            />
          </div>
          
          <div v-if="selectedTemplate.letterCount >= 2" class="letter-input-group">
            <label class="input-label">Last Name</label>
            <q-input
              v-model="lastLetter"
              maxlength="1"
              outlined
              dense
              class="letter-input"
              @input="updatePreview"
            />
          </div>
          
          <div v-if="selectedTemplate.letterCount >= 3" class="letter-input-group">
            <label class="input-label">Middle Name</label>
            <q-input
              v-model="middleLetter"
              maxlength="1"
              outlined
              dense
              class="letter-input"
              @input="updatePreview"
            />
          </div>
        </div>

        <!-- Quick Letter Buttons -->
        <div class="quick-letters">
          <div class="quick-letters-title">Quick Select</div>
          <div class="quick-letters-grid">
            <button
              v-for="letter in quickLetters"
              :key="letter"
              class="quick-letter-btn"
              @click="insertLetter(letter)"
            >
              {{ letter }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Customization -->
    <div class="monogram-step" :class="{ active: currentStep === 3 }" v-if="selectedTemplate && isValid">
      <div class="step-header">
        <div class="step-number">3</div>
        <div class="step-title">Customize</div>
      </div>

      <div class="customization-panel">
        <!-- Font Selection -->
        <div class="customization-group">
          <label class="group-label">Font Style</label>
          <div class="font-grid">
            <div
              v-for="font in monogramFonts"
              :key="font.value"
              class="font-option"
              :class="{ selected: selectedFont === font.value }"
              @click="selectedFont = font.value"
            >
              <div class="font-preview" :style="{ fontFamily: font.value }">
                {{ previewText }}
              </div>
              <div class="font-name">{{ font.label }}</div>
            </div>
          </div>
        </div>

        <!-- Size and Color -->
        <div class="customization-row">
          <div class="customization-item">
            <label class="item-label">Size</label>
            <q-slider
              v-model="fontSize"
              :min="24"
              :max="128"
              :step="4"
              label
              label-always
              class="size-slider"
            />
            <div class="size-value">{{ fontSize }}px</div>
          </div>

          <div class="customization-item">
            <label class="item-label">Color</label>
            <div class="color-picker-wrapper">
              <input
                v-model="color"
                type="color"
                class="color-input"
              />
              <div class="color-presets">
                <button
                  v-for="preset in colorPresets"
                  :key="preset"
                  class="color-preset"
                  :style="{ backgroundColor: preset }"
                  @click="color = preset"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Spacing (for applicable layouts) -->
        <div v-if="['horizontal', 'stacked', 'vertical'].includes(selectedTemplate.layoutStyle)" class="customization-item">
          <label class="item-label">Letter Spacing</label>
          <q-slider
            v-model="spacing"
            :min="0"
            :max="50"
            :step="2"
            label
            label-always
            class="spacing-slider"
          />
          <div class="spacing-value">{{ spacing }}px</div>
        </div>
      </div>
    </div>

    <!-- Live Preview -->
    <div class="preview-section" v-if="selectedTemplate">
      <div class="preview-header">
        <q-icon name="mdi-eye" size="16px" />
        <span>Preview</span>
      </div>
      <div class="preview-container">
        <div class="monogram-preview" :style="previewStyle">
          {{ previewText }}
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons" v-if="selectedTemplate && isValid">
      <q-btn
        flat
        label="Cancel"
        color="grey-7"
        class="cancel-btn"
        @click="handleCancel"
      />
      <q-btn
        :label="editingElement ? 'Update' : 'Add Monogram'"
        color="primary"
        class="add-btn"
        @click="handleAdd"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMonogramStore } from '~/store/monogram'
import { MONOGRAM_TEMPLATES, CUSTOM_MONOGRAM_FONTS } from '~/config/fonts'

const props = defineProps<{
  editingElement?: any
}>()

const emit = defineEmits(['add', 'update', 'cancel'])

const monogramStore = useMonogramStore()

// State
const currentStep = ref(1)
const selectedTemplate = ref<any>(null)
const firstLetter = ref('')
const middleLetter = ref('')
const lastLetter = ref('')
const selectedFont = ref('monogram_kk')
const fontSize = ref(48)
const color = ref('#000000')
const spacing = ref(10)

// Constants
const templates = MONOGRAM_TEMPLATES
const monogramFonts = CUSTOM_MONOGRAM_FONTS
const quickLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const colorPresets = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
]

// Computed
const isValid = computed(() => {
  if (!selectedTemplate.value) return false
  
  if (selectedTemplate.value.letterCount === 1) {
    return firstLetter.value.length > 0
  }
  if (selectedTemplate.value.letterCount === 2) {
    return firstLetter.value.length > 0 && lastLetter.value.length > 0
  }
  if (selectedTemplate.value.letterCount === 3) {
    return firstLetter.value.length > 0 && 
           middleLetter.value.length > 0 && 
           lastLetter.value.length > 0
  }
  
  return false
})

const previewText = computed(() => {
  if (!selectedTemplate.value) return ''
  
  const layout = selectedTemplate.value.layoutStyle
  const f = firstLetter.value.toUpperCase()
  const m = middleLetter.value.toUpperCase()
  const l = lastLetter.value.toUpperCase()

  if (selectedTemplate.value.letterCount === 1) {
    return f
  }
  
  if (selectedTemplate.value.letterCount === 2) {
    switch (layout) {
      case 'horizontal':
        return `${f} ${l}`
      case 'stacked':
      case 'vertical':
        return `${f}\n${l}`
      case 'circle':
        return `${f}${l}`
      default:
        return `${f}${l}`
    }
  }
  
  switch (layout) {
    case 'traditional':
      return `${f}${l}${m}`
    case 'horizontal':
      return `${f} ${m} ${l}`
    case 'stacked':
    case 'vertical':
      return `${f}\n${m}\n${l}`
    case 'circle':
      return `${f}${m}${l}`
    default:
      return `${f}${m}${l}`
  }
})

const previewStyle = computed(() => {
  const layout = selectedTemplate.value?.layoutStyle

  const calculatedLineHeight = layout === 'stacked' || layout === 'vertical'
    ? `${fontSize.value + spacing.value}px`
    : 'normal'

  return {
    fontFamily: selectedFont.value,
    fontSize: `${fontSize.value}px`,
    color: color.value,
    letterSpacing: layout === 'horizontal' ? `${spacing.value}px` : '0px',
    lineHeight: calculatedLineHeight,
    whiteSpace: layout === 'stacked' || layout === 'vertical' ? 'pre-line' : 'normal',
  }
})

// Methods
const selectTemplate = (template: any) => {
  selectedTemplate.value = template
  currentStep.value = 2
  updatePreview()
}

const insertLetter = (letter: string) => {
  if (!selectedTemplate.value) return
  
  if (selectedTemplate.value.letterCount >= 1 && !firstLetter.value) {
    firstLetter.value = letter
  } else if (selectedTemplate.value.letterCount >= 2 && !lastLetter.value) {
    lastLetter.value = letter
  } else if (selectedTemplate.value.letterCount >= 3 && !middleLetter.value) {
    middleLetter.value = letter
  }
  
  updatePreview()
}

const updatePreview = () => {
  if (isValid.value && currentStep.value < 3) {
    currentStep.value = 3
  }
  
  // If we're editing an existing monogram, emit update events for real-time changes
  if (props.editingElement && isValid.value) {
    const config = {
      type: 'monogram',
      template: selectedTemplate.value,
      letters: {
        first: firstLetter.value.toUpperCase(),
        middle: middleLetter.value.toUpperCase(),
        last: lastLetter.value.toUpperCase(),
      },
      font: selectedFont.value,
      fontSize: fontSize.value,
      color: color.value,
      spacing: spacing.value,
      content: previewText.value,
      layoutStyle: selectedTemplate.value?.layoutStyle,
    }
    emit('update', config)
  }
}

const getTemplateIcon = (layoutStyle: string) => {
  const icons: Record<string, string> = {
    'circle': '◯',
    'stacked': '☰',
    'horizontal': '━',
    'vertical': '┃',
    'traditional': '⊕',
  }
  return icons[layoutStyle] || '◯'
}

const handleAdd = () => {
  const config = {
    type: 'monogram',
    template: selectedTemplate.value,
    letters: {
      first: firstLetter.value.toUpperCase(),
      middle: middleLetter.value.toUpperCase(),
      last: lastLetter.value.toUpperCase(),
    },
    font: selectedFont.value,
    fontSize: fontSize.value,
    color: color.value,
    spacing: spacing.value,
    content: previewText.value,
    layoutStyle: selectedTemplate.value?.layoutStyle,
  }

  if (props.editingElement) {
    emit('update', config)
  } else {
    emit('add', config)
  }

  resetForm()
}

const handleCancel = () => {
  emit('cancel')
  resetForm()
}

const resetForm = () => {
  currentStep.value = 1
  selectedTemplate.value = null
  firstLetter.value = ''
  middleLetter.value = ''
  lastLetter.value = ''
  selectedFont.value = 'monogram_kk'
  fontSize.value = 48
  color.value = '#000000'
  spacing.value = 10
}

// Watch for editing element
watch(() => props.editingElement, (element) => {
  if (element && element.type === 'monogram') {
    firstLetter.value = element.monogramLetters?.first || ''
    middleLetter.value = element.monogramLetters?.middle || ''
    lastLetter.value = element.monogramLetters?.last || ''
    selectedFont.value = element.font || 'monogram_kk'
    fontSize.value = element.fontSize || 48
    color.value = element.color || '#000000'
    spacing.value = element.letterSpacing || 10

    const template = templates.find(t => t.layoutStyle === element.layoutStyle)
    if (template) {
      selectedTemplate.value = template
      currentStep.value = 3
    }
  }
}, { immediate: true })

// Watch for customization changes to trigger real-time updates
watch([selectedFont, fontSize, color, spacing], () => {
  if (props.editingElement && isValid.value) {
    updatePreview()
  }
}, { deep: true })
</script>

<style scoped lang="scss">
.sidebar-monogram-picker {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.monogram-step {
  opacity: 0.5;
  transition: all 0.3s ease;
  
  &.active {
    opacity: 1;
  }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  .step-number {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
  }
  
  .step-title {
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
  }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.template-card {
  padding: 12px 8px;
  border: 2px solid #e8eaf0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  background: white;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #1EADB0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(30, 173, 176, 0.15);
  }

  &.selected {
    border-color: #1EADB0;
    background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
    box-shadow: 0 2px 8px rgba(30, 173, 176, 0.2);
  }
}

.template-preview {
  margin-bottom: 8px;
}

.template-icon {
  font-size: 24px;
  color: #1EADB0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
  filter: drop-shadow(0 1px 2px rgba(30, 173, 176, 0.3));
  
  &.circle {
    border: 2px solid #1EADB0;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
  }
  
  &.stacked {
    line-height: 0.8;
  }
  
  &.horizontal {
    letter-spacing: 2px;
  }
  
  &.vertical {
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
  
  &.traditional {
    font-weight: bold;
  }
}

.template-name {
  font-weight: 600;
  font-size: 11px;
  color: #2d3748;
}

.letters-input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.letter-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 10px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.letter-input {
  .q-field__control {
    height: 36px;
    border-radius: 8px;
  }
  
  .q-field__native {
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    text-transform: uppercase;
  }
}

.quick-letters {
  .quick-letters-title {
    font-size: 10px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
}

.quick-letters-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.quick-letter-btn {
  width: 24px;
  height: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  color: #4a5568;
  font-weight: 600;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #1EADB0;
    background: rgba(30, 173, 176, 0.05);
    color: #1EADB0;
  }
}

.customization-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.customization-group {
  .group-label {
    font-size: 10px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    display: block;
  }
}

.font-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.font-option {
  padding: 8px 6px;
  border: 1px solid #e8eaf0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  background: white;
  
  &:hover {
    border-color: #1EADB0;
    background: rgba(30, 173, 176, 0.05);
  }
  
  &.selected {
    border-color: #1EADB0;
    background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  }
}

.font-preview {
  font-size: 12px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
  min-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-name {
  font-size: 9px;
  color: #718096;
  font-weight: 500;
}

.customization-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.customization-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-label {
  font-size: 10px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.size-slider, .spacing-slider {
  .q-slider__track {
    background: #e2e8f0;
  }
  
  .q-slider__thumb {
    background: #1EADB0;
  }
}

.size-value, .spacing-value {
  font-size: 10px;
  color: #718096;
  text-align: center;
  font-weight: 500;
}

.color-picker-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-input {
  width: 100%;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.color-preset {
  width: 20px;
  height: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: #1EADB0;
  }
}

.preview-section {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.preview-container {
  text-align: center;
}

.monogram-preview {
  font-size: 32px;
  font-weight: bold;
  padding: 20px 12px;
  background: white;
  border-radius: 8px;
  white-space: pre-line;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 173, 176, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  
  .cancel-btn {
    flex: 1;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 12px;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
  
  .add-btn {
    flex: 2;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
    box-shadow: 0 2px 8px rgba(30, 173, 176, 0.3);
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(30, 173, 176, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

// Scrollbar styling
.sidebar-monogram-picker::-webkit-scrollbar {
  width: 4px;
}

.sidebar-monogram-picker::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.sidebar-monogram-picker::-webkit-scrollbar-thumb {
  background: #1EADB0;
  border-radius: 2px;
  
  &:hover {
    background: #4B5574;
  }
}
</style>
