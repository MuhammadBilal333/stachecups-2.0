<template>
  <!-- Konva-based drawing lines -->
  <template v-for="(line, index) in lines" :key="index">
    <v-line :config="getLineConfig(line)" />
  </template>

  <!-- Current drawing line -->
  <v-line v-if="isDrawing && currentLine.length > 0" :config="getCurrentLineConfig()" />
</template>

<script setup>
import Konva from 'konva';

const props = defineProps({
  width: {
    type: Number,
    default: 300
  },
  height: {
    type: Number,
    default: 150
  },
  lineWidth: {
    type: Number,
    default: 5
  },
  lineColor: {
    type: String,
    default: '#000000'
  },
  active: {
    type: Boolean,
    default: false
  },
  stage: {
    type: Object,
    default: null
  },
  selectedElementId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:drawing', 'draw-end']);

// Drawing state
const lines = ref([]);
const currentLine = ref([]);
const isDrawing = ref(false);

// Line configuration for completed lines
const getLineConfig = (line) => ({
  points: line.points,
  stroke: line.color,
  strokeWidth: line.width,
  tension: 0.5,
  lineCap: 'round',
  lineJoin: 'round',
  globalCompositeOperation: 'source-over'
});

// Current line configuration
const getCurrentLineConfig = () => ({
  points: currentLine.value,
  stroke: props.lineColor,
  strokeWidth: props.lineWidth,
  tension: 0.5,
  lineCap: 'round',
  lineJoin: 'round',
  globalCompositeOperation: 'source-over'
});

// Drawing event handlers
const handleMouseDown = (e) => {
  if (!props.active || !props.stage) return;

  isDrawing.value = true;
  const pos = props.stage.getPointerPosition();
  currentLine.value = [pos.x, pos.y];
};

const handleMouseMove = (e) => {
  if (!isDrawing.value || !props.active || !props.stage) return;

  const pos = props.stage.getPointerPosition();

  // Check bounds
  if (pos.x < 0 || pos.x > props.width || pos.y < 0 || pos.y > props.height) {
    return;
  }

  currentLine.value = currentLine.value.concat([pos.x, pos.y]);
};

const handleMouseUp = () => {
  if (!isDrawing.value) return;

  isDrawing.value = false;

  if (currentLine.value.length > 4) { // Minimum line length
    lines.value.push({
      points: [...currentLine.value],
      color: props.lineColor,
      width: props.lineWidth
    });
  }

  currentLine.value = [];
  emit('update:drawing', lines.value);
};

// Touch event handlers
const handleTouchStart = (e) => {
  if (!props.active) return;
  e.evt.preventDefault();

  const touch = e.evt.touches[0];
  const pos = stage.value.getPointerPosition();

  isDrawing.value = true;
  currentLine.value = [pos.x, pos.y];
};

const handleTouchMove = (e) => {
  if (!isDrawing.value || !props.active) return;
  e.evt.preventDefault();

  const pos = stage.value.getPointerPosition();

  // Check bounds
  if (pos.x < 0 || pos.x > props.width || pos.y < 0 || pos.y > props.height) {
    return;
  }

  currentLine.value = currentLine.value.concat([pos.x, pos.y]);
};

const handleTouchEnd = (e) => {
  if (!isDrawing.value) return;
  e.evt.preventDefault();

  isDrawing.value = false;

  if (currentLine.value.length > 4) {
    lines.value.push({
      points: [...currentLine.value],
      color: props.lineColor,
      width: props.lineWidth
    });
  }

  currentLine.value = [];
  emit('update:drawing', lines.value);
};

// Clear all drawings
const clearCanvas = () => {
  lines.value = [];
  currentLine.value = [];
  isDrawing.value = false;
  emit('update:drawing', null);
};

// Get drawing bounds and export as image
const getDrawingBounds = () => {
  if (lines.value.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  lines.value.forEach(line => {
    for (let i = 0; i < line.points.length; i += 2) {
      const x = line.points[i];
      const y = line.points[i + 1];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  });

  // Add padding
  const padding = 10;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(props.width, maxX + padding);
  maxY = Math.min(props.height, maxY + padding);

  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
    isEmpty: false
  };
};

const downloadDrawing = () => {
  const boundingBox = getDrawingBounds();

  if (!boundingBox || boundingBox.isEmpty || lines.value.length === 0) {
    return { imageData: null };
  }

  // Create a temporary stage to render just the drawing
  const tempStage = new Konva.Stage({
    container: document.createElement('div'),
    width: boundingBox.width,
    height: boundingBox.height
  });

  const tempLayer = new Konva.Layer();
  tempStage.add(tempLayer);

  // Add all lines to the temporary layer, offset by bounding box
  lines.value.forEach(line => {
    const adjustedPoints = [];
    for (let i = 0; i < line.points.length; i += 2) {
      adjustedPoints.push(line.points[i] - boundingBox.left);
      adjustedPoints.push(line.points[i + 1] - boundingBox.top);
    }

    const konvaLine = new Konva.Line({
      points: adjustedPoints,
      stroke: line.color,
      strokeWidth: line.width,
      tension: 0.5,
      lineCap: 'round',
      lineJoin: 'round'
    });

    tempLayer.add(konvaLine);
  });

  const imageData = tempStage.toDataURL({ mimeType: 'image/png' });

  // Clean up
  tempStage.destroy();

  return {
    imageData,
    ...boundingBox
  };
};

// Set up stage event listeners when active
watch(() => [props.active, props.stage], ([active, stage]) => {
  if (active && stage) {
    stage.on('mousedown touchstart', handleMouseDown);
    stage.on('mousemove touchmove', handleMouseMove);
    stage.on('mouseup touchend', handleMouseUp);
  } else if (stage) {
    stage.off('mousedown touchstart', handleMouseDown);
    stage.off('mousemove touchmove', handleMouseMove);
    stage.off('mouseup touchend', handleMouseUp);
  }
}, { immediate: true });

// Cleanup on unmount
onUnmounted(() => {
  if (props.stage) {
    props.stage.off('mousedown touchstart', handleMouseDown);
    props.stage.off('mousemove touchmove', handleMouseMove);
    props.stage.off('mouseup touchend', handleMouseUp);
  }
});

// Expose methods
defineExpose({
  clearCanvas,
  downloadDrawing
});
</script>

<style scoped>
/* No additional styles needed - Konva handles rendering */
</style>
