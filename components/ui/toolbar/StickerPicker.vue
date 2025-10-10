<template>
  <q-card style="width: 300px !important;">
    <q-card-section>
      <div class="flex justify-between items-center">
        <div class="text-bold">Stickers</div>
        <q-btn icon="close" flat round dense v-close-popup />
      </div>
      <div>
        <q-input v-model="search" outlined style="background-color: #f4f4f7" dense placeholder="Search">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="text-italic text-caption">Click on the sticker to add it to your Cup</div>
      <div class="row q-py-sm">
        <div v-for="sticker in filteredStickers" :key="sticker" class="col-6 cursor-pointer">
          <q-card flat bordered class="q-ma-xs text-center" @click="$emit('select', `/stickers/${sticker}.png`)">
            <div>
              <q-img :src="`/stickers/${sticker}.png`" width="120px" height="120px" />
              <div class="text-capitalize">{{sticker}}</div>
            </div>
          </q-card>
        </div>

      </div>
    </q-card-section>
  </q-card>
</template>
<script lang="ts" setup>
const search = ref()

defineEmits(['select'])

const stickers = ['astrology', 'book lovers', 'coffee and tea', 'music', 'outdoors', 'pet lovers', 'plants', 'positive vibes', 'travel']

const filteredStickers = computed(() => {
  return search.value ? stickers.filter(st => st.toLowerCase().includes(search.value.toLowerCase())) : stickers
})
</script>
