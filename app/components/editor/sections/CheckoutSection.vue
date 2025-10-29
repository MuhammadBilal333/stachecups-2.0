<template>
  <div class="row">
    <div
      class="col-xs-12 mt-20 q-pa-lg"
      :class="{ 'col-md-6': isCheckout }"
    >
      <div
        v-if="!$q.screen.gt.sm && isCheckout"
        class="text-h5 q-pb-md"
        :class="$q.screen.gt.sm ? 'text-h5' : 'text-h6'"
        style="font-weight: 700 !important"
      >
        Congrats! Your custom cup is ready! 🎉
      </div>
      <q-card style="border-radius: 32px">
        <q-card-section>
          <cup-viewer
            :canvas-element="canvasElement"
            style="max-height: 60vh"
            class="q-pb-md"
          />
        </q-card-section>
      </q-card>
    </div>

    <div
      v-if="isCheckout"
      class="col-md-6 q-pa-md flex items-center"
    >
      <div>
        <div
          v-if="$q.screen.gt.sm"
          class="text-h5"
          style="font-weight: 700 !important"
        >
          Congrats! Your custom cup is ready! 🎉
        </div>
        <div
          :class="$q.screen.gt.sm ? 'text-h6' : 'text-body1'"
          style="font-weight: 400 !important"
          class="q-pb-md"
        >
          <div>
            Take a moment to review your design and make sure everything looks
            just right:
          </div>
          <div>✔ Check placement and details</div>
          <div>✔ Rotate to view all angles</div>

          <div>✔ Love it? Add to cart and make it yours!</div>
        </div>
        <div class="q-gutter-x-md">
          <q-btn
            label="Add to Cart"
            no-caps
            rounded
            color="secondary"
            @click="$emit('add-to-cart')"
          />
          <q-btn
            label="Go Back"
            no-caps
            rounded
            color="secondary"
            outline
            class="bg-white"
            @click="$emit('go-back')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CupViewer from '~/components/preview/CupViewer.vue'

defineProps({
  canvasElement: {
    type: Object,
    default: undefined,
  },
  isCheckout: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add-to-cart', 'go-back'])
</script>

