<template>
  <v-group
    :config="groupConfig"
    @click="handleClick"
    @tap="handleClick"
    @dblclick="handleDoubleClick"
    @dbltap="handleDoubleClick"
    @dragstart="handleDragStart"
    @dragmove="handleDragMove"
    @dragend="handleDragEnd"
    @transformstart="handleTransformStart"
    @transform="handleTransform"
    @transformend="handleTransformEnd"
  >
    <v-group v-if="elementType === 'image'" :config="{ clipFunc: hasFrame ? getClipFunc : undefined }">
      <v-image
        ref="konvaImageRef"
        :config="imageConfig"
      />
    </v-group>
    
    <v-text
      v-else-if="(props.element.type === 'text' || props.element.type === 'monogram') && !isEditing"
      ref="konvaTextRef"
      :key="`text-${props.element.id}-${props.element.font}-${props.element.fontSize}-${props.element.content?.length || 0}`"
      :config="textConfig"
    />

    <v-text
      v-else-if="props.element.type === 'emoji' && !isEditing"
      ref="konvaTextRef"
      :config="textConfig"
    />
  </v-group>

  
  <textarea
    v-if="isEditing && elementType === 'text' && !isLooped"
    ref="textInputRef"
    v-model="editingText"
    class="konva-text-editor"
    :style="konvaTextEditorStyle"
    @blur="finishEditing"
    @keydown.enter.prevent="finishEditing"
    @keydown.escape.prevent="cancelEditing"
    @input="updateTextWidth"
    @keydown.stop
  />

  
</template>

<script setup>
import Konva from 'konva';
import { ref, computed, watch, nextTick, onMounted, onUnmounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  elementType: {
    type: String,
    required: true,
    validator: (value) => ['image', 'text', 'emoji', 'monogram'].includes(value)
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isDragging: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  isLooped: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isDrawToolActive: {
    type: Boolean,
    default: false
  },
  canvasWidth: {
    type: Number,
    default: 952
  },
  canvasHeight: {
    type: Number,
    default: 550
  }
});

const emit = defineEmits([
  'select',
  'delete',
  'edit-start',
  'edit-finish',
  'edit-content',
  'update:element'
]);

const konvaImageRef = ref(null);
const konvaTextRef = ref(null);
const textInputRef = ref(null);

const loadedImage = ref(null);
const originalImageSize = ref({ width: 0, height: 0 });
const editingText = ref('');

let batchDrawScheduled = false;
let batchDrawFrameId = null;
let textUpdateTimeout = null;
let pendingTextUpdate = null;

const baseFontSize = 16;

// Frame clipping support
const hasFrame = computed(() => {
  return props.element.frame && props.element.frame.shape && props.element.frame.shape !== 'none'
});

const getClipFunc = (ctx) => {
  if (!props.element.frame || !hasFrame.value) return;
  
  const shape = props.element.frame.shape;
  let width, height;
  
  if (props.element.isDrawing && props.element.originalWidth && props.element.originalHeight) {
    width = props.element.originalWidth;
    height = props.element.originalHeight;
  } else {
    width = originalImageSize.value.width;
    height = originalImageSize.value.height;
  }
  
  const centerX = 0;
  const centerY = 0;
  const radius = Math.min(width, height) / 2;
  
  ctx.beginPath();
  
  switch (shape) {
    case 'circle':
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      break;
      
    case 'square':
      ctx.rect(-width / 2, -height / 2, width, height);
      break;
      
    case 'rounded-square':
      const cornerRadius = Math.min(width, height) * 0.2;
      const x = -width / 2;
      const y = -height / 2;
      ctx.moveTo(x + cornerRadius, y);
      ctx.lineTo(x + width - cornerRadius, y);
      ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
      ctx.lineTo(x + width, y + height - cornerRadius);
      ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
      ctx.lineTo(x + cornerRadius, y + height);
      ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
      ctx.lineTo(x, y + cornerRadius);
      ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
      break;
      
    case 'heart':
      const heartScale = radius / 50;
      ctx.moveTo(0, -15 * heartScale);
      ctx.bezierCurveTo(-20 * heartScale, -35 * heartScale, -40 * heartScale, -15 * heartScale, 0, 20 * heartScale);
      ctx.bezierCurveTo(40 * heartScale, -15 * heartScale, 20 * heartScale, -35 * heartScale, 0, -15 * heartScale);
      break;
      
    case 'star':
      const starRadius = radius;
      const innerRadius = starRadius * 0.5;
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const r = i % 2 === 0 ? starRadius : innerRadius;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
      
    case 'hexagon':
      const hexRadius = radius;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = hexRadius * Math.cos(angle);
        const y = hexRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
      
    case 'octagon':
      const octRadius = radius;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x = octRadius * Math.cos(angle);
        const y = octRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
      
    case 'diamond':
      ctx.moveTo(0, -radius);
      ctx.lineTo(radius, 0);
      ctx.lineTo(0, radius);
      ctx.lineTo(-radius, 0);
      ctx.closePath();
      break;
      
    default:
      // No clipping
      ctx.rect(-width / 2, -height / 2, width, height);
  }
  
  ctx.closePath();
};

const getElementBounds = () => {
  const scale = props.element.scale || 1;
  const fontSize = props.element.fontSize || 16;
  
  if (props.elementType === 'text') {
    const content = stripHtml(props.element.content) || 'Your text';
    const textWidth = Math.max(30, content.length * fontSize * 0.6) * scale;
    const textHeight = (fontSize * 1.5) * scale;
    return { width: textWidth, height: textHeight };
  } else if (props.elementType === 'image') {
    if (props.element.isDrawing && props.element.originalWidth && props.element.originalHeight) {
      return { 
        width: props.element.originalWidth * scale, 
        height: props.element.originalHeight * scale 
      };
    }
    return { width: 200 * scale, height: 200 * scale };
  } else {
    return { width: 200 * scale, height: 200 * scale };
  }
};

const constrainPosition = (position) => {
  const bounds = getElementBounds();
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;
  
  const constrainedX = Math.max(halfWidth, Math.min(position.x, props.canvasWidth - halfWidth));
  const constrainedY = Math.max(halfHeight, Math.min(position.y, props.canvasHeight - halfHeight));
  
  return { x: constrainedX, y: constrainedY };
};

const groupConfig = computed(() => ({
  x: props.element.position?.x || 0,
  y: props.element.position?.y || 0,
  rotation: props.element.rotation || 0,
  scaleX: props.element.scale || 1,
  scaleY: props.element.scale || 1,
  draggable: !props.isLooped && !props.isEditing && !props.isLocked && !props.isDrawToolActive,
  opacity: props.isLooped ? 0.6 : (props.isLocked ? 0.7 : (props.isEditing ? 0.3 : (props.isDrawToolActive ? 0.5 : 1))),
  listening: !props.isLooped && !props.isDrawToolActive,
  id: props.element.id,
  dragBoundFunc: (pos) => {
    const bounds = getElementBounds();
    const halfWidth = bounds.width / 2;
    const halfHeight = bounds.height / 2;
    const newX = Math.max(halfWidth, Math.min(pos.x, props.canvasWidth - halfWidth));
    const newY = Math.max(halfHeight, Math.min(pos.y, props.canvasHeight - halfHeight));
    return { x: newX, y: newY };
  }
}));
const imageConfig = computed(() => {
  if (props.elementType !== 'image' || !loadedImage.value) return {};
  
  let width, height;
  
  if (props.element.isDrawing && props.element.originalWidth && props.element.originalHeight) {
    width = props.element.originalWidth;
    height = props.element.originalHeight;
  } else {
    width = originalImageSize.value.width;
    height = originalImageSize.value.height;
  }
  
  return {
    image: loadedImage.value,
    width: width,
    height: height,
    offsetX: width / 2,
    offsetY: height / 2,
    perfectDrawEnabled: false
  };
});


const stripHtml = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  let text = temp.textContent || temp.innerText || '';
  text = text.trim();
  text = text.replace(/\s+/g, ' ');
  return text;
};

const textConfig = computed(() => {
  // CRITICAL FIX: Don't early return based on elementType
  // Process based on actual element.type instead
  const elementRealType = props.element?.type || 'text';

  if(elementRealType === 'emoji') {
    const fontSize = props.element.fontSize || baseFontSize;
  
    const config = {
      text: props.element.content, 
      fontSize: fontSize,
      fontFamily: 'Roboto',
      fill: props.element.color || '#000000',
      fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
      textDecoration: props.element.underline ? 'underline' : (props.element.transformation || ''),
      align: 'center',
      verticalAlign: 'middle',
      width: Math.max(20, props.element.content.length * fontSize * 0.7),
      height: fontSize * 1.5,
      offsetX: Math.max(20, props.element.content.length * fontSize * 0.7) / 2,
      offsetY: (fontSize * 1.7) / 2,
      padding: 1,
      listening: true,
      perfectDrawEnabled: false
    };
    
    return config
  }else if(elementRealType === 'monogram'){
    const fontSize = props.element.fontSize || baseFontSize;
    const text = props.element.content || 'ABC';
    const layoutStyle = props.element.layoutStyle || 'horizontal';
    const font = props.element.font || 'monogram_kk';
    const letterSpacing = props.element.letterSpacing || 0;
    const spacing = props.element.spacing || 10;

    let width, height, lineHeight;

    if (layoutStyle === 'stacked' || layoutStyle === 'vertical') {
      const letters = text.split('\n').filter(line => line.trim().length > 0);
      const letterCount = letters.length;

      lineHeight = (fontSize + spacing) / fontSize;
      height = (fontSize * letterCount) + (spacing * (letterCount - 1)) + 40;

      const tempText = new Konva.Text({
        text: letters.join(''),
        fontSize: fontSize,
        fontFamily: font,
        fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
      });
      width = Math.max(tempText.width() + 40, fontSize * 2);
      tempText.destroy();

    } else if (layoutStyle === 'circle') {
      const tempText = new Konva.Text({
        text: text.replace(/\n/g, ''),
        fontSize: fontSize,
        fontFamily: font,
        fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
      });
      const textWidth = tempText.width();
      const textHeight = tempText.height();
      tempText.destroy();

      const maxDimension = Math.max(textWidth, textHeight);
      width = maxDimension + 60;
      height = maxDimension + 60;
      lineHeight = 1.2;

    } else {
      const displayText = layoutStyle === 'horizontal'
        ? text.replace(/\n/g, ' ')
        : text.replace(/\n/g, '');

      const tempText = new Konva.Text({
        text: displayText,
        fontSize: fontSize,
        fontFamily: font,
        fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
        letterSpacing: letterSpacing,
      });

      width = Math.max(tempText.width() + 40, fontSize * 3);
      height = Math.max(tempText.height() + 30, fontSize * 1.5);
      tempText.destroy();
      lineHeight = 1.2;
    }

    const config = {
      text: text,
      fontSize: fontSize,
      fontFamily: font,
      fill: props.element.color || '#000000',
      fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
      textDecoration: props.element.underline ? 'underline' : (props.element.transformation || ''),
      align: 'center',
      verticalAlign: 'middle',
      width: width,
      height: height,
      offsetX: width / 2,
      offsetY: height / 2,
      padding: 10,
      listening: true,
      perfectDrawEnabled: false,
      letterSpacing: letterSpacing,
      lineHeight: lineHeight,
    };

    if (props.element.stroke?.enabled) {
      config.stroke = props.element.stroke.color || '#FFFFFF';
      config.strokeWidth = props.element.stroke.width || 2;
    }

    if (props.element.shadow?.enabled) {
      config.shadowColor = props.element.shadow.color || '#000000';
      config.shadowBlur = props.element.shadow.blur || 5;
      config.shadowOffsetX = props.element.shadow.offsetX || 2;
      config.shadowOffsetY = props.element.shadow.offsetY || 2;
      config.shadowOpacity = props.element.shadow.opacity || 0.5;
    }

    if (props.element.engrave) {
      config.globalCompositeOperation = 'destination-out';
    }

    return config;
  }else{
    const fontSize = props.element.fontSize || baseFontSize;
    const text = stripHtml(props.element.content) || 'Your text';
    const font = props.element.font || 'Roboto';
    const letterSpacing = props.element.letterSpacing || 0;

    // CRITICAL FIX: Use Konva's measureText for accurate width
    const tempText = new Konva.Text({
      text: text,
      fontSize: fontSize,
      fontFamily: font,
      fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
      letterSpacing: letterSpacing,
      lineHeight: props.element.lineHeight || 1.2,
    });

    // Get actual measured dimensions
    let width = tempText.width();
    let height = tempText.height();

    // Add padding for safety
    width = Math.max(width + 20, 100);
    height = Math.max(height + 10, fontSize * 1.2);

    // Cleanup temp text
    tempText.destroy();

    const config = {
      text: text,
      fontSize: fontSize,
      fontFamily: font,
      fill: props.element.color || '#000000',
      fontStyle: `${props.element.bold ? 'bold' : 'normal'} ${props.element.italic ? 'italic' : 'normal'}`,
      textDecoration: props.element.underline ? 'underline' : (props.element.transformation || ''),
      align: 'center',
      verticalAlign: 'middle',
      width: width,
      height: height,
      offsetX: width / 2,
      offsetY: height / 2,
      padding: 10,
      listening: true,
      perfectDrawEnabled: false,
      letterSpacing: letterSpacing,
      lineHeight: props.element.lineHeight || 1.2,
    };

    if (props.element.stroke?.enabled) {
      config.stroke = props.element.stroke.color || '#FFFFFF';
      config.strokeWidth = props.element.stroke.width || 2;
    }

    if (props.element.shadow?.enabled) {
      config.shadowColor = props.element.shadow.color || '#000000';
      config.shadowBlur = props.element.shadow.blur || 5;
      config.shadowOffsetX = props.element.shadow.offsetX || 2;
      config.shadowOffsetY = props.element.shadow.offsetY || 2;
      config.shadowOpacity = props.element.shadow.opacity || 0.5;
    }

    if (props.element.engrave) {
      config.globalCompositeOperation = 'destination-out';
    }

    return config;
  }

});

const konvaTextEditorStyle = computed(() => {
  if (!konvaTextRef.value) return { display: 'none' };
  
  const textNode = konvaTextRef.value.getNode();
  const stage = textNode?.getStage();
  if (!stage || !textNode) return { display: 'none' };
  
  const container = stage.container();
  const containerRect = container.getBoundingClientRect();
  
  const textPosition = textNode.absolutePosition();
  const areaPosition = {
    x: containerRect.left + textPosition.x,
    y: containerRect.top + textPosition.y,
  };
  
  const textWidth = textNode.width();
  const textHeight = textNode.height();
  const fontSize = textNode.fontSize();
  
  return {
    position: 'fixed',
    left: `${areaPosition.x}px`,
    top: `${areaPosition.y}px`,
    width: `${textWidth}px`,
    height: `${textHeight}px`,
    fontSize: `${fontSize}px`,
    fontFamily: textNode.fontFamily(),
    color: textNode.fill(),
    transform: 'translateY(-2px)',
    transformOrigin: 'left top',
    zIndex: 2000,
    border: 'none',
    padding: '0px',
    margin: '0px',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.95)',
    outline: 'none',
    resize: 'none',
    lineHeight: textNode.lineHeight(),
    textAlign: textNode.align()
  };
});

const handleClick = (e) => {
  e.cancelBubble = true;
  if (!props.isLooped && !props.isDrawToolActive) {
    emit('select');
  }
};

const handleDoubleClick = (e) => {
  e.cancelBubble = true;
  if (props.elementType === 'text' && !props.isLocked && !props.isLooped && !props.isDrawToolActive) {
    startTextEditing();
  }
};

const startTextEditing = () => {
  editingText.value = props.element.content || 'Your text';
  emit('edit-start');
  
  nextTick(() => {
    if (textInputRef.value) {
      textInputRef.value.focus();
      textInputRef.value.select();
      updateTextWidth();
    }
  });
};

const finishEditing = () => {
  if (textUpdateTimeout) {
    clearTimeout(textUpdateTimeout);
    textUpdateTimeout = null;
  }
  
  const content = editingText.value.trim() || 'Your text';
  const newElement = {
    ...props.element,
    content: content
  };
  emit('update:element', newElement);
  emit('edit-finish');
  
  pendingTextUpdate = null;
};

const cancelEditing = () => {
  if (textUpdateTimeout) {
    clearTimeout(textUpdateTimeout);
    textUpdateTimeout = null;
  }
  
  editingText.value = props.element.content || '';
  emit('edit-finish');
  
  pendingTextUpdate = null;
};

const throttledTextUpdate = () => {
  if (textUpdateTimeout) {
    clearTimeout(textUpdateTimeout);
  }
  
  textUpdateTimeout = setTimeout(() => {
    if (pendingTextUpdate) {
      const newElement = {
        ...props.element,
        content: pendingTextUpdate
      };
      emit('update:element', newElement);
      scheduleBatchDraw();
      pendingTextUpdate = null;
    }
    textUpdateTimeout = null;
  }, 100);
};

const updateTextWidth = () => {
  if (textInputRef.value) {
    const fontSize = props.element.fontSize || baseFontSize;
    const scale = props.element.scale || 1;
    const scaledFontSize = fontSize * scale;
    const content = editingText.value || 'Your text';
    const minWidth = 80;
    const contentWidth = Math.max(minWidth, content.length * scaledFontSize * 0.6);
    textInputRef.value.style.width = `${contentWidth}px`;
  }
  
  pendingTextUpdate = editingText.value;
  throttledTextUpdate();
};

const handleDragStart = () => {};

const scheduleBatchDraw = () => {
  if (batchDrawScheduled) return;
  
  batchDrawScheduled = true;
  batchDrawFrameId = requestAnimationFrame(() => {
    const imageNode = konvaImageRef.value?.getNode();
    const textNode = konvaTextRef.value?.getNode();
    const node = imageNode || textNode;
    
    if (node) {
      const layer = node.getLayer();
      if (layer) {
        layer.batchDraw();
      }
    }
    
    batchDrawScheduled = false;
    batchDrawFrameId = null;
  });
};

const handleDragMove = (e) => {
  const node = e.target;
  const newElement = {
    ...props.element,
    position: {
      x: node.x(),
      y: node.y()
    }
  };
  emit('update:element', newElement);
  
  scheduleBatchDraw();
};

const handleDragEnd = (e) => {
  const node = e.target;
  const newElement = {
    ...props.element,
    position: {
      x: node.x(),
      y: node.y()
    }
  };
  emit('update:element', newElement);
};

const handleTransformStart = () => {};

const handleTransform = (e) => {
  const node = e.target;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  const newScale = Math.max(scaleX, scaleY);
  
  if (props.elementType === 'image') {
    node.scaleX(newScale);
    node.scaleY(newScale);
  }
  
  scheduleBatchDraw();
};

const handleTransformEnd = (e) => {
  const node = e.target;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();
  const newScale = props.elementType === 'image' 
    ? Math.max(scaleX, scaleY)
    : (scaleX + scaleY) / 2;
  
  const newElement = {
    ...props.element,
    position: { x: node.x(), y: node.y() },
    rotation: node.rotation(),
    scale: newScale
  };
  
  node.scaleX(1);
  node.scaleY(1);
  emit('update:element', newElement);
  
  nextTick(() => {
    node.getLayer()?.batchDraw();
  });
};
watch(() => props.element.src, (newSrc) => {
  if (props.elementType === 'image' && newSrc) {
    const img = new Image();
    img.onload = () => {
      loadedImage.value = img;
      
      if (props.element.isDrawing && props.element.originalWidth && props.element.originalHeight) {
        originalImageSize.value = {
          width: props.element.originalWidth,
          height: props.element.originalHeight
        };
      } else {
        const maxSize = 200;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        originalImageSize.value = {
          width: img.width * ratio,
          height: img.height * ratio
        };
      }
    };
    img.crossOrigin = 'anonymous';
    img.src = newSrc;
  }
}, { immediate: true });

watch(() => props.isEditing, (isEditing) => {
  if (isEditing && props.elementType === 'text') {
    editingText.value = props.element.content || 'Your text';
    nextTick(() => {
      if (textInputRef.value) {
        textInputRef.value.focus();
        textInputRef.value.select();
        updateTextWidth();
      }
    });
  }
});

watch(() => [props.element.fontSize, props.element.content, props.element.scale], () => {
  if (props.elementType === 'text' && !props.isLooped) {
    const currentPosition = props.element.position || { x: 0, y: 0 };
    const constrainedPos = constrainPosition(currentPosition);

    if (constrainedPos.x !== currentPosition.x || constrainedPos.y !== currentPosition.y) {
      const newElement = {
        ...props.element,
        position: constrainedPos
      };
      emit('update:element', newElement);
    }
  }
}, { deep: true });

// CRITICAL: Force redraw when text/monogram properties change
watch(
  () => [
    props.element.font,
    props.element.fontSize,
    props.element.layoutStyle,
    props.element.spacing,
    props.element.content,
    props.element.color,
    props.element.letterSpacing,
    props.element.lineHeight
  ],
  () => {
    if (props.elementType === 'text' || props.elementType === 'monogram') {
      nextTick(() => {
        scheduleBatchDraw();
      });
    }
  },
  { deep: true }
);

const transformer = ref(null);

watch(() => [props.isSelected, props.isLocked, loadedImage.value], ([selected, locked]) => {
  if (transformer.value) {
    transformer.value.destroy();
    transformer.value = null;
  }
  
  if (selected && !props.isLooped && !props.isEditing && !props.isDrawToolActive) {
    nextTick(() => {
      const imageNode = konvaImageRef.value?.getNode();
      const textNode = konvaTextRef.value?.getNode();
      const groupNode = imageNode?.getParent() || textNode?.getParent();
      
      if (groupNode && groupNode.getStage()) {
        groupNode.moveToTop();
        
        transformer.value = new Konva.Transformer({
          nodes: [groupNode],
          keepRatio: props.elementType === 'image',
          enabledAnchors: locked 
            ? [] 
            : ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          rotateEnabled: !locked,
          borderEnabled: true,
          borderStroke: locked ? '#f59e0b' : '#3b82f6',
          borderStrokeWidth: 2,
          anchorFill: locked ? '#f59e0b' : '#3b82f6',
          anchorStroke: '#ffffff',
          anchorStrokeWidth: 2,
          anchorSize: 12,
          anchorCornerRadius: 2,
          rotateAnchorOffset: 40,
          rotateAnchorCursor: 'grab',
          boundBoxFunc: (oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }
        });
        
        const layer = groupNode.getLayer();
        layer.add(transformer.value);
        transformer.value.moveToTop();
        scheduleBatchDraw();
      }
    });
  }
}, { immediate: true, deep: true });

const cleanupBatchDraw = () => {
  if (batchDrawFrameId) {
    cancelAnimationFrame(batchDrawFrameId);
    batchDrawFrameId = null;
  }
  batchDrawScheduled = false;
};

const cleanupTextThrottling = () => {
  if (textUpdateTimeout) {
    clearTimeout(textUpdateTimeout);
    textUpdateTimeout = null;
  }
  pendingTextUpdate = null;
};

// Listen for fonts-loaded event and force redraw
let fontsLoadedListener = null;

onMounted(() => {
  if (typeof window !== 'undefined') {
    fontsLoadedListener = () => {
      nextTick(() => {
        scheduleBatchDraw();
      });
    };
    window.addEventListener('fonts-loaded', fontsLoadedListener);
  }
});

onUnmounted(() => {
  if (transformer.value) {
    transformer.value.destroy();
    transformer.value = null;
  }
  cleanupBatchDraw();
  cleanupTextThrottling();

  // Remove fonts-loaded listener
  if (fontsLoadedListener && typeof window !== 'undefined') {
    window.removeEventListener('fonts-loaded', fontsLoadedListener);
  }
});
</script>

<style scoped>
.konva-text-editor {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 2px;

  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.konva-text-editor:focus {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>