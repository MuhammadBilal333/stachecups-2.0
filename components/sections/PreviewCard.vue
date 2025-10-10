<template>
  <q-card
    v-if="$q.screen.gt.sm && !isCheckout"
    class="absolute-top-right z-index-20 q-ma-md"
    :class="{
      'preview-card': !zoom,
      'preview-card-zoom': zoom,
    }"
  >
    <q-card-section class="relative-position">
      <q-btn
        icon="mdi-magnify"
        square
        outline
        class="absolute-top-right q-ma-sm"
        style="z-index: 2"
        dense
        @click="emit('toggle-zoom')"
      />
      <cup-viewer
        :canvas-element="canvasElement"
        :key="`preview-${zoom}`"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import CupViewer from '~/components/preview3D/CupViewer.vue'

const props = defineProps({
  zoom: Boolean,
  canvasElement: Object,
  isCheckout: Boolean,
})

const emit = defineEmits(['toggle-zoom'])
</script>

<style scoped>
.z-index-20 {
  z-index: 25 !important;
}

.preview-card {
  width: 200px;
  height: 210px;
  z-index: 1;
}

.preview-card-zoom {
  width: 50vw;
  height: 100vh;
  z-index: 10;
  top: -20px;
  position: fixed;
}
</style>

