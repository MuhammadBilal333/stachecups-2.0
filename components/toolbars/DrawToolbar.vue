<template>
  <div class="draw-toolbar" >
    <div class="toolbar-group">
      <span class="tool-label">Brush Size:</span>
      <div class="brush-size-controls">
        <button
          class="size-btn"
          :class="{ active: brushSize === 2 }"
          @click="updateBrushSize(2)"
          title="Small"
          style="cursor: pointer !important;"
        >
          <div class="size-preview size-small"></div>
        </button>
        <button
          class="size-btn"
          :class="{ active: brushSize === 5 }"
          @click="updateBrushSize(5)"
          title="Medium"
          style="cursor: pointer !important;"
        >
          <div class="size-preview size-medium"></div>
        </button>
        <button
          class="size-btn"
          :class="{ active: brushSize === 10 }"
          @click="updateBrushSize(10)"
          title="Large"
          style="cursor: pointer !important;"
        >
          <div class="size-preview size-large"></div>
        </button>
        <button
          class="size-btn"
          :class="{ active: brushSize === 15 }"
          @click="updateBrushSize(15)"
          title="Extra Large"
          style="cursor: pointer !important;"
        >
          <div class="size-preview size-xlarge"></div>
        </button>
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <span class="tool-label">Color:</span>
      <div class="color-picker-wrapper">
        <input
          type="color"
          :value="brushColor"
          @input="updateBrushColor($event.target.value)"
          class="color-picker"
          title="Select brush color"
          style="cursor: pointer !important;"
        />
        <span class="color-preview" :style="{ backgroundColor: brushColor }"></span>
      </div>
    </div>

    <div class="toolbar-divider"></div>

    <div class="toolbar-group">
      <button class="action-btn clear-btn" @click="$emit('clear')" title="Clear drawing" style="cursor: pointer !important;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span style="cursor: pointer !important;">Clear</span>
      </button>
      <button class="action-btn done-btn" @click="$emit('done')" title="Finish drawing">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span style="cursor: pointer !important;">Done</span>
      </button>
    </div>
  </div>
</template>

<script setup>
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

const updateBrushSize = (size) => {
  emit('update:brushSize', size);
};

const updateBrushColor = (color) => {
  emit('update:brushColor', color);
};
</script>

<style scoped>
.draw-toolbar {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 16px;
  white-space: nowrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-divider {
  width: 1px;
  height: 32px;
  background: rgba(0, 0, 0, 0.1);
}

.tool-label {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.brush-size-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.size-btn {
  border: none;
  background: transparent;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 32px;
  min-height: 32px;
}

.size-btn:hover {
  background: rgba(59, 130, 246, 0.1);
}

.size-btn.active {
  background: #3b82f6;
}

.size-btn.active .size-preview {
  background-color: white;
}

.size-preview {
  border-radius: 50%;
  background-color: #4b5563;
  transition: background-color 0.2s ease;
}

.size-small {
  width: 4px;
  height: 4px;
}

.size-medium {
  width: 8px;
  height: 8px;
}

.size-large {
  width: 12px;
  height: 12px;
}

.size-xlarge {
  width: 16px;
  height: 16px;
}

.color-picker-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker {
  width: 36px;
  height: 36px;
  cursor: pointer;
  background: none;
  border: none;
  outline: none;
  transition: all 0.2s ease;
}

.color-picker:hover {
  transform: scale(1.05);
  border-color: #3b82f6;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 80px;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 80px;
}

.color-picker::-moz-color-swatch {
  border: none;
  border-radius: 2px;
}

.color-preview {
  display: inline-block;
  width: 24px;
  height: 24px;
  cursor: not-allowed !important;
  border-radius: 50px;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn svg {
  pointer-events: none;
}

.clear-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer !important;
}

.clear-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.done-btn {
  background: #3b82f6;
  color: white;
  cursor: pointer !important;
}

.done-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

@media (max-width: 768px) {
  .draw-toolbar {
    flex-wrap: wrap;
    padding: 10px 12px;
    gap: 12px;
  }

  .toolbar-divider {
    display: none;
  }

  .tool-label {
    font-size: 12px;
  }

  .action-btn span {
    display: none;
  }

  .action-btn {
    padding: 8px;
    min-width: 36px;
    justify-content: center;
  }
}
</style>
