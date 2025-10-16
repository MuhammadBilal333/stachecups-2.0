<template>
  <div class="w-full px-4 overflow-y-scroll py-2">
    <!-- Search Bar -->
    <div class="mb-4">
      <div class="relative">
        <input
          v-model="search"
          type="text"
          placeholder="Search stickers"
          class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none text-sm"
        />
        <svg
          class="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z" />
        </svg>
      </div>
    </div>

    <!-- Helper Text -->
    <div class="text-xs text-gray-500 mb-4 text-center sm:text-left">
      Click on a sticker to add it to your design
    </div>

    <!-- Stickers Grid -->
    <div
      class="grid grid-cols-2 sm:grid-cols-3 overflow-y-scroll md:grid-cols-4 lg:grid-cols-2 gap-3 pb-2"
    >
      <div
        v-for="sticker in filteredStickers"
        :key="sticker"
        @click="$emit('select', `/stickers/${sticker}.png`)"
        class="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer transition-all hover:border-purple-500 hover:bg-purple-50 hover:shadow-md active:scale-95"
      >
        <div
          class="w-full aspect-square flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden"
        >
          <img
            :src="`/stickers/${sticker}.png`"
            alt="sticker"
            class="w-full h-full object-contain"
          />
        </div>
        <div class="text-sm font-medium text-gray-700 text-center hover:text-purple-600">
          {{ formatLabel(sticker) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const search = ref('')

defineEmits(['select'])

const stickers = [
  'astrology',
  'book lovers',
  'coffee and tea',
  'music',
  'outdoors',
  'pet lovers',
  'plants',
  'positive vibes',
  'travel'
]

const filteredStickers = computed(() => {
  return search.value
    ? stickers.filter(st =>
        st.toLowerCase().includes(search.value.toLowerCase())
      )
    : stickers
})

const formatLabel = (sticker: string) => {
  return sticker
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
/* optional small enhancement for smoother tap on mobile */
button, div {
  -webkit-tap-highlight-color: transparent;
}
</style>
