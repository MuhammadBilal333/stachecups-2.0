<template>
  <div class="modern-draw-toolbar">
    <div class="toolbar-section">
      <div class="section-header">
        <q-icon name="mdi-brush" size="16px" class="section-icon" />
        <span class="section-title">Brush Size</span>
      </div>
      <div class="brush-size-grid">
        <button
          v-for="size in brushSizes"
          :key="size.value"
          class="size-option"
          :class="{ active: brushSize === size.value }"
          @click="updateBrushSize(size.value)"
          :title="size.label"
        >
          <div class="size-indicator" :class="`size-${size.value}`"></div>
          <span class="size-label">{{ size.label }}</span>
        </button>
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-section">
      <div class="section-header">
        <q-icon name="mdi-palette" size="16px" class="section-icon" />
        <span class="section-title">Color</span>
      </div>
      <div class="color-section">
        <div class="color-presets">
          <button
            v-for="color in colorPresets"
            :key="color"
            class="color-preset"
            :class="{ active: brushColor === color }"
            :style="{ backgroundColor: color }"
            @click="updateBrushColor(color)"
            :title="color"
          />
        </div>
        <div class="custom-color-wrapper">
          <input
            type="color"
            :value="brushColor"
            @input="updateBrushColor($event.target.value)"
            class="custom-color-picker"
            title="Custom color"
          />
          <span class="custom-color-label">Custom</span>
        </div>
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-section">
      <div class="action-buttons">
        <button class="modern-btn clear-btn" @click="$emit('clear')" title="Clear drawing">
          <q-icon name="mdi-delete-outline" size="16px" />
          <span>Clear</span>
        </button>
        <button class="modern-btn done-btn" @click="$emit('done')" title="Finish drawing">
          <q-icon name="mdi-check" size="16px" />
          <span>Done</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  brushSize: {
    type: Number,
    default: 5
  },
  brushColor: {
    type: String,
    default: '#000000'
  }
});

const emit = defineEmits(['update:brushSize', 'update:brushColor', 'clear', 'done', 'save']);

const brushSizes = ref([
  { value: 2, label: 'Small' },
  { value: 5, label: 'Medium' },
  { value: 10, label: 'Large' },
  { value: 15, label: 'XL' }
]);

const colorPresets = ref([
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
]);

const updateBrushSize = (size) => {
  emit('update:brushSize', size);
};

const updateBrushColor = (color) => {
  emit('update:brushColor', color);
};
</script>

<style scoped>
.modern-draw-toolbar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 173, 176, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 280px;
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.section-icon {
  color: #1EADB0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.brush-size-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.size-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.size-option:hover {
  border-color: #1EADB0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 173, 176, 0.15);
}

.size-option.active {
  border-color: #1EADB0;
  background: linear-gradient(135deg, rgba(30, 173, 176, 0.1) 0%, rgba(75, 85, 116, 0.1) 100%);
  box-shadow: 0 2px 8px rgba(30, 173, 176, 0.2);
}

.size-indicator {
  border-radius: 50%;
  background: #1EADB0;
  transition: all 0.2s ease;
}

.size-option.active .size-indicator {
  background: #1EADB0;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1EADB0;
}

.size-2 { width: 6px; height: 6px; }
.size-5 { width: 10px; height: 10px; }
.size-10 { width: 14px; height: 14px; }
.size-15 { width: 18px; height: 18px; }

.size-label {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.size-option.active .size-label {
  color: #1EADB0;
  font-weight: 600;
}

.toolbar-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(30, 173, 176, 0.2) 50%, transparent 100%);
}

.color-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.color-preset {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.color-preset:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-preset.active {
  border-color: #1EADB0;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #1EADB0;
  transform: scale(1.05);
}

.custom-color-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.custom-color-wrapper:hover {
  border-color: #1EADB0;
}

.custom-color-picker {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  outline: none;
}

.custom-color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 6px;
}

.custom-color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.custom-color-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.modern-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
  justify-content: center;
}

.clear-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.2);
}

.clear-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
  border-color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.done-btn {
  background: linear-gradient(135deg, #1EADB0 0%, #4B5574 100%);
  color: white;
  border: 2px solid transparent;
}

.done-btn:hover {
  background: linear-gradient(135deg, #1a9ca0 0%, #3d4758 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 173, 176, 0.4);
}
</style>
