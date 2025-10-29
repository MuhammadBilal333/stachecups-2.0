<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { useCollectionStore } from '~/store/collection'

const collectionStore = useCollectionStore()
const route = useRoute()

// Initialize collections on app mount
onMounted(async () => {
  console.log('🎨 Initializing collection system...')

  // Load collections from JSON
  await collectionStore.loadCollections()

  // Set collection from URL if specified
  await collectionStore.setCollectionFromURL(route)

  console.log(`✅ Collection system initialized. Active: ${collectionStore.activeCollection}`)
})

// Watch for URL collection parameter changes
watch(() => route.query.collection, async (newCollection) => {
  if (newCollection && typeof newCollection === 'string') {
    await collectionStore.setCollection(newCollection, false)
  }
})
</script>
