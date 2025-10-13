<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="frame-selection-modal">
      <q-card-section class="modal-header">
        <div class="text-h6">Choose a Frame</div>
        <div class="text-subtitle2 text-grey-7">Select a frame for your image, or choose "No Frame" for standard editing</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="modal-body">
        <FramePicker @select="handleFrameSelect" />
      </q-card-section>

      <q-separator />

    <div class="flex gap-2 p-4 font-sans justify-between">
      <button
        class="bg-transparent border border-[#c6c3d2] text-gray-600 px-7 py-2.5 font-bold text-sm rounded-md max-h-11"
        @click="handleCancel"
      >
        Cancel
      </button>
      <button 
        class="bg-[#8b3dff] text-sm font-medium text-white hover:bg-[#7f60d4] max-h-11 transition-all duration-200 py-2.5 px-7 rounded-md disabled:opacity-50 disabled:cursor-not-allowed" 
        :disabled="!selectedFrame"
        @click="handleConfirmSelection"
      >
        {{ selectedFrame?.name === "No Frame" ? "No Frame" : "Select Frame" }}
      </button>
    </div>
    </q-card> 
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FramePicker from '~/components/editor/pickers/FramePicker.vue'
import { type Frame, type FrameShape } from '~/store/frames'

const props = defineProps<{
  visible: boolean
  imagePreview?: string | null
}>()

const emit = defineEmits(['select', 'cancel', 'update:visible'])

const showDialog = ref(props.visible)
const selectedFrame = ref<Frame | null>(null)

watch(() => props.visible, (newVal) => {
  showDialog.value = newVal
  if (newVal) {
    // Default to "No Frame" when modal opens
    selectedFrame.value = {
      id: "none",
      name: "No Frame", 
      shape: "none" as FrameShape,
      category: "basic" as const
    }
  }
})

watch(showDialog, (newVal) => {
  if (!newVal && props.visible) {
    emit('update:visible', false)
  }
})

const handleFrameSelect = (frame: Frame) => {
  selectedFrame.value = frame
}

const handleConfirmSelection = () => {
  if (selectedFrame.value) {
    emit('select', selectedFrame.value)
    showDialog.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  showDialog.value = false
}
</script>

<style scoped>
.frame-selection-modal {
  min-width: 400px;
  max-width: 500px;
}

.modal-header {
  padding: 20px 24px;
}

.modal-body {
  padding: 16px 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-actions {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 600px) {
  .frame-selection-modal {
    min-width: 90vw;
  }
}
</style>

