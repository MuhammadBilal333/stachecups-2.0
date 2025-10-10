<template>
  <div>
    <div
        class="bg-white q-px-sm q-py-md toolbar-container"
        :class="{'shadow-1': $q.screen.gt.sm }"
        :style="{ 'border-radius': $q.screen.lt.md ? '0' : '32px' }"
    >
      <div :class="{'flex justify-between no-wrap': $q.screen.xs, 'flex justify-center q-gutter-x-lg no-wrap': $q.screen.sm, 'q-gutter-y-lg': !$q.screen.lt.md }">
        <div>
          <toolbar-btn>
            <q-icon name="mdi-sticker-plus-outline" />
            <div>Stickers</div>
            <q-menu anchor="top right" style="border-radius: 32px" :offset="[16, 0]">
              <toolbar-sticker-picker @select="$emit('add-image', $event)" />
            </q-menu>
          </toolbar-btn>
        </div>

        <div>
          <toolbar-btn>
            <q-icon name="mood" />
            <div>Elements</div>
            <q-menu anchor="top right" style="border-radius: 32px" :offset="[0, 0]">
              <EmojiPicker :native="true" @select="handleEmojiSelect" />
            </q-menu>
          </toolbar-btn>
        </div>

        <div>
          <toolbar-btn :color="textToolActive ? 'primary' : ''"  :flat="!textToolActive" @click="activateTextTool">
            <q-icon name="text_fields" />
            <div>Text</div>
          </toolbar-btn>
        </div>

        <div>
          <toolbar-btn :color="drawToolActive ? 'primary' : ''" :flat="!drawToolActive" @click="activateDrawTool">
            <q-icon name="brush" />
            <div>Draw</div>
          </toolbar-btn>
        </div>

        <div>
          <toolbar-btn @click="fileInputRef.pickFiles()">
            <q-icon name="upload" />
            <div>Upload</div>
          </toolbar-btn>
        </div>

        <q-separator :vertical="$q.screen.lt.md" />

        <div>
          <toolbar-btn @click="handleCheckout">
            <q-icon name="add_shopping_cart" />
            <div class="text-no-wrap">All done!</div>
          </toolbar-btn>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <q-file
        ref="fileInputRef"
        v-model="fileInput"
        style="display: none"
        accept="image/*"
        @update:model-value="handleFileSelected"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css';
import ToolbarBtn from '~/components/ui/toolbar/Btn.vue';
import ToolbarStickerPicker from '~/components/ui/toolbar/StickerPicker.vue';

// Quasar setup
const $q = useQuasar();

defineProps({
  textToolActive: {
    type: Boolean,
    default: false,
  },
  drawToolActive: {
    type: Boolean,
    default: false,
  }
})

// Emits
const emit = defineEmits(['upload', 'activate-text-tool', 'activate-draw-tool', 'add-emoji', 'checkout', 'add-image']);

// State
const fileInput = ref(null);
const fileInputRef = ref(null);

// Methods
const activateTextTool = () => {
  emit('activate-text-tool');
};

const activateDrawTool = () => {
  emit('activate-draw-tool');
};

const handleFileSelected = (file) => {
  if (file) {
    emit('upload', file);

    // Reset the input after emitting
    nextTick(() => {
      fileInput.value = null;
    });
  }
};

const handleEmojiSelect = (emoji) => {
  emit('add-emoji', emoji);
};

const handleCheckout = () => {
  emit('checkout')
};
</script>

<style scoped>
.toolbar-container {
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .toolbar-container {
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
