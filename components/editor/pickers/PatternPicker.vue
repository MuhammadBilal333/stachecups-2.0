<template>
  <div class="pattern-picker-container">
    <!-- Search Bar -->
    <div class="q-px-md q-pt-xs q-pb-sm">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search patterns..."
        clearable
        class="search-input"
        borderless
      >
      
      </q-input>
    </div>

    <!-- Category Tabs -->
<q-tabs
  v-model="selectedCategory"
  dense
  class="text-grey q-px-md flex flex-wrap max-w-[300px] overflow-scroll"
  active-color="primary"
  indicator-color="primary"
  align="left"
  no-caps
  scrollable="true"
>
  <q-tab
    v-for="category in backgroundStore.patternCategories"
    :key="category"
    :name="category"
    :label="category"
  />
</q-tabs>

    <q-separator />

    <!-- Pattern Grid -->
    <div class="pattern-grid-container">
      <div v-if="filteredPatterns.length === 0" class="text-center text-grey q-py-lg">
        <q-icon name="sentiment_dissatisfied" size="36px" />
        <div class="q-mt-sm text-caption">No patterns found</div>
      </div>

      <div v-else class="pattern-grid">
        <div
          v-for="pattern in filteredPatterns"
          :key="pattern.id"
          class="pattern-card"
          :class="{ 'selected': isSelected(pattern) }"
          @click="selectPattern(pattern)"
        >
          <div class="pattern-preview" :style="{ backgroundImage: `url(${pattern.preview})` }">
            <q-icon
              v-if="isSelected(pattern)"
              name="check_circle"
              color="primary"
              size="18px"
              class="check-icon"
            />
          </div>
          <div class="pattern-name">{{ pattern.name }}</div>
        </div>
      </div>
    </div>

    <q-separator />

    <!-- Custom Pattern Options (if pattern selected) -->
    <div v-if="backgroundStore.selectedPattern" class="q-px-md q-py-sm">
      <div class="text-caption text-grey-7 q-mb-xs" style="font-size: 11px; font-weight: 600;">Customize Pattern</div>

      <!-- Opacity Slider -->
      <div>
        <div class="text-caption text-grey-7 q-mb-xs" style="font-size: 11px;">
          Opacity: <span class="text-primary text-weight-medium">{{ Math.round(opacity * 100) }}%</span>
        </div>
        <q-slider
          v-model="opacity"
          :min="0.1"
          :max="1"
          :step="0.1"
          color="primary"
          @update:model-value:instant="updateOpacity"
        />
      </div>
    </div>

    <q-separator />

    <!-- Clear Pattern -->
    <div v-if="backgroundStore.selectedPattern" class="q-px-md q-pb-sm q-pt-xs">
      <q-btn
        flat
        color="negative"
        label="Remove Pattern"
        class="full-width"
        icon="close"
        size="sm"
        no-caps
        @click="clearPattern"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBackgroundStore } from '~/store/background'
import type { Pattern } from '~/store/background'
import { initializePatterns } from '~/utils/patternGenerator'
import { useQuasar } from 'quasar'

const backgroundStore = useBackgroundStore()
const $q = useQuasar()

const patterns = ref<Pattern[]>([])
const selectedCategory = ref('All')
const searchQuery = ref('')
const opacity = ref(1)

// Filtered patterns
const filteredPatterns = computed(() => {
  let filtered = patterns.value

  // Filter by category
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }

  // Filter by search
  if (searchQuery.value?.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Check if pattern is selected
const isSelected = (pattern: Pattern) => {
  return backgroundStore.selectedPattern?.id === pattern.id
}

// Select pattern - INSTANT APPLY (Fixed selection bug)
const selectPattern = async (pattern: Pattern) => {
  // Use store method for proper state management
  backgroundStore.setPattern(pattern)
  
  // Wait a moment for the pattern to be processed
  await nextTick()
  
  // Force immediate canvas update with a small delay to ensure pattern is ready
  setTimeout(() => {
    const event = new CustomEvent('background-changed')
    window.dispatchEvent(event)
  }, 50)
}

// Update opacity - INSTANT APPLY
const updateOpacity = (value: number) => {
  backgroundStore.setOpacity(value)
  // Opacity change applies instantly
}

// Clear pattern - INSTANT APPLY
const clearPattern = () => {
  backgroundStore.clearPattern()
  $q.notify({
    message: 'Pattern removed',
    color: 'info',
    position: 'top',
    timeout: 800,
    icon: 'check_circle'
  })
}

// Watch category changes
watch(selectedCategory, (newCategory) => {
  backgroundStore.setPatternCategory(newCategory)
})

// Watch search query
watch(searchQuery, (newQuery) => {
  backgroundStore.setSearchQuery(newQuery || '')
})

// Initialize patterns on mount
onMounted(() => {
  patterns.value = initializePatterns()
  
  // Set initial opacity from store
  opacity.value = backgroundStore.opacity
  
  // Sync selected category
  selectedCategory.value = backgroundStore.selectedCategory
})
</script>

<style scoped>
.pattern-picker-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-input {
  background: #f5f5f5;
  border-radius: 8px;
}

.search-input :deep(.q-field__control) {
  background: #f5f5f5;
  border-radius: 8px;
  height: 36px;
}

.search-input :deep(.q-field__native) {
  padding-left: 4px;
  font-size: 13px;
}

.pattern-grid-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding: 8px 12px;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
}

.pattern-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
  transition: all 0.15s ease;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
}

.pattern-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  border-color: #7c3aed;
}

.pattern-card.selected {
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
}

.pattern-preview {
  width: 100%;
  aspect-ratio: 1;
  background-size: 50%;
  background-repeat: repeat;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.check-icon {
  background: white;
  border-radius: 50%;
  padding: 2px;
}

.pattern-name {
  padding: 4px 6px;
  text-align: center;
  font-size: 9px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: white;
  border-top: 1px solid #f3f4f6;
  line-height: 1.2;
}

.pattern-card.selected .pattern-name {
  color: #7c3aed;
  font-weight: 600;
  background: #faf5ff;
}

/* Better scrollbar */
.pattern-grid-container::-webkit-scrollbar {
  width: 5px;
}

.pattern-grid-container::-webkit-scrollbar-track {
  background: transparent;
}

.pattern-grid-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.pattern-grid-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>

