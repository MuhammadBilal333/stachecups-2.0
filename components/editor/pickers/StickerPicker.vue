<template>
  <div class="sticker-picker">
    <!-- Search Bar -->
    <div class="search-container">
      <q-input
        v-model="search"
        outlined
        dense
        placeholder="Search stickers"
        class="search-input"
        borderless
      >
        <template #prepend>
          <q-icon name="search" size="20px" color="grey-6" />
        </template>
      </q-input>
    </div>

    <!-- Helper Text -->
    <div class="helper-text">
      Click on a sticker to add it to your design
    </div>

    <!-- Stickers Grid -->
    <div class="stickers-grid">
      <div
        v-for="sticker in filteredStickers"
        :key="sticker"
        class="sticker-card"
        @click="$emit('select', `/stickers/${sticker}.png`)"
      >
        <div class="sticker-image-container">
          <q-img
            :src="`/stickers/${sticker}.png`"
            class="sticker-image"
            fit="contain"
          />
        </div>
        <div class="sticker-label">{{ formatLabel(sticker) }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
const search = ref()

defineEmits(['select'])

const stickers = ['astrology', 'book lovers', 'coffee and tea', 'music', 'outdoors', 'pet lovers', 'plants', 'positive vibes', 'travel']

const filteredStickers = computed(() => {
  return search.value ? stickers.filter(st => st.toLowerCase().includes(search.value.toLowerCase())) : stickers
})

const formatLabel = (sticker: string) => {
  return sticker.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
</script>

<style scoped>
.sticker-picker {
  width: 100%;
  padding: 0;
}

.search-container {
  padding: 0 0 16px 0;
}

.search-input {
  background: #f5f5f5;
  border-radius: 8px;
}

.search-input :deep(.q-field__control) {
  background: #f5f5f5;
  border-radius: 8px;
  height: 40px;
}

.search-input :deep(.q-field__native) {
  padding-left: 4px;
  font-size: 14px;
}

.helper-text {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 16px;
  line-height: 1.5;
}

.stickers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-bottom: 8px;
}

.sticker-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sticker-card:hover {
  border-color: #a855f7;
  background: #faf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
}

.sticker-image-container {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  overflow: hidden;
}

.sticker-image {
  width: 100%;
  height: 100%;
}

.sticker-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.4;
  width: 100%;
}

.sticker-card:hover .sticker-label {
  color: #7c3aed;
}
</style>
