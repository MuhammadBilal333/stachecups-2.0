<template>
  <div class="collection-switcher">
    <!-- Current Collection Badge -->
    <div class="current-collection-badge">
      <q-chip
        :style="{ backgroundColor: collectionStore.branding?.primaryColor }"
        text-color="white"
        icon="collections"
        class="text-weight-bold"
      >
        <span v-if="collectionStore.branding?.badgeText">
          {{ collectionStore.branding.badgeText }}
        </span>
        <span v-else>
          {{ collectionStore.currentCollection?.name }}
        </span>
      </q-chip>
    </div>

    <!-- Collection Switcher Button -->
    <q-btn
      flat
      dense
      icon="swap_horiz"
      label="Switch Collection"
      @click="showSwitcher = true"
      class="q-ml-sm"
    >
      <q-tooltip>Switch to a different collection</q-tooltip>
    </q-btn>

    <!-- Collection Switcher Dialog -->
    <q-dialog v-model="showSwitcher" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Choose Collection</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showSwitcher = false" />
        </q-card-section>

        <q-card-section>
          <div class="text-caption text-grey-7 q-mb-md">
            Each collection has different assets, colors, and design rules.
          </div>

          <div class="collections-grid">
            <q-card
              v-for="collection in collectionStore.activeCollections"
              :key="collection.id"
              :class="[
                'collection-card',
                { 'current': collection.id === collectionStore.activeCollection }
              ]"
              @click="selectCollection(collection.id)"
              clickable
            >
              <q-card-section>
                <!-- Collection Banner/Logo -->
                <div v-if="collection.branding.banner" class="collection-banner">
                  <img :src="collection.branding.banner" :alt="collection.name" />
                </div>

                <!-- Collection Info -->
                <div class="text-h6 q-mt-sm">{{ collection.name }}</div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  {{ collection.description }}
                </div>

                <!-- Restrictions Badge -->
                <div v-if="collection.id !== 'general'" class="q-mt-sm">
                  <q-chip size="sm" color="orange" text-color="white" icon="lock">
                    Restricted
                  </q-chip>
                </div>

                <!-- Current Badge -->
                <div v-if="collection.id === collectionStore.activeCollection" class="q-mt-sm">
                  <q-chip size="sm" color="primary" text-color="white" icon="check">
                    Current
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showSwitcher = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Warning Dialog -->
    <q-dialog v-model="showWarning" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ collectionStore.switchWarning?.title || 'Switch Collection?' }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-body2">
            {{ warningMessage }}
          </div>

          <!-- Show restrictions for target collection -->
          <div v-if="targetCollection" class="q-mt-md">
            <div class="text-subtitle2 text-weight-bold">Collection Rules:</div>
            <q-list dense class="q-mt-sm">
              <q-item>
                <q-item-section avatar>
                  <q-icon
                    :name="targetCollection.rules.colorPicker.cmyk ? 'check' : 'close'"
                    :color="targetCollection.rules.colorPicker.cmyk ? 'positive' : 'negative'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Full Color Picker</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon
                    :name="targetCollection.rules.upload.enabled ? 'check' : 'close'"
                    :color="targetCollection.rules.upload.enabled ? 'positive' : 'negative'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Custom Uploads</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="targetCollection.rules.licensing.required">
                <q-item-section avatar>
                  <q-icon name="info" color="warning" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Licensed Assets</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="collectionStore.switchWarning?.cancelText || 'Cancel'"
            @click="cancelSwitch"
          />
          <q-btn
            unelevated
            color="primary"
            :label="collectionStore.switchWarning?.confirmText || 'Switch Collection'"
            @click="confirmSwitch"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Licensing Disclaimer (for restricted collections) -->
    <q-dialog v-model="showDisclaimer" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Important Licensing Information</div>
        </q-card-section>

        <q-card-section>
          <div class="text-body2">
            {{ collectionStore.licensingDisclaimer }}
          </div>

          <div v-if="collectionStore.currentRules?.licensing.brandGuidelines" class="q-mt-md">
            <q-btn
              flat
              color="primary"
              icon="open_in_new"
              label="View Brand Guidelines"
              :href="collectionStore.currentRules.licensing.brandGuidelines"
              target="_blank"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            unelevated
            color="primary"
            label="I Understand"
            @click="showDisclaimer = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { useCollectionStore } from '~/store/collection'
import { useEditorStore } from '~/store/editor'
import type { Collection } from '~/store/collection'

const collectionStore = useCollectionStore()
const editorStore = useEditorStore()

const showSwitcher = ref(false)
const showWarning = ref(false)
const showDisclaimer = ref(false)
const pendingCollectionId = ref<string | null>(null)
const targetCollection = ref<Collection | null>(null)

const warningMessage = computed(() => {
  if (!collectionStore.switchWarning || !targetCollection.value) return ''

  return collectionStore.switchWarning.message.replace(
    '{newCollection}',
    targetCollection.value.name
  )
})

const selectCollection = (collectionId: string) => {
  // If selecting current collection, just close
  if (collectionId === collectionStore.activeCollection) {
    showSwitcher.value = false
    return
  }

  // If user has elements, show warning
  if (editorStore.hasElements) {
    pendingCollectionId.value = collectionId
    targetCollection.value = collectionStore.getCollectionById(collectionId)
    showSwitcher.value = false
    showWarning.value = true
  } else {
    // No elements, switch directly
    switchToCollection(collectionId)
  }
}

const switchToCollection = (collectionId: string) => {
  collectionStore.confirmSwitchCollection(collectionId)

  // Clear all elements
  editorStore.clearElements()

  // Close dialogs
  showSwitcher.value = false
  showWarning.value = false

  // Show licensing disclaimer if required
  if (collectionStore.requiresLicensing && collectionStore.licensingDisclaimer) {
    showDisclaimer.value = true
  }

  // Emit event for parent to reload assets
  emits('collectionChanged', collectionId)
}

const confirmSwitch = () => {
  if (pendingCollectionId.value) {
    switchToCollection(pendingCollectionId.value)
    pendingCollectionId.value = null
    targetCollection.value = null
  }
}

const cancelSwitch = () => {
  showWarning.value = false
  pendingCollectionId.value = null
  targetCollection.value = null
}

const emits = defineEmits<{
  collectionChanged: [collectionId: string]
}>()

// Show disclaimer on mount if required
onMounted(() => {
  if (collectionStore.requiresLicensing && collectionStore.licensingDisclaimer) {
    showDisclaimer.value = true
  }
})
</script>

<style scoped lang="scss">
.collection-switcher {
  display: flex;
  align-items: center;
}

.current-collection-badge {
  display: flex;
  align-items: center;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.collection-card {
  border: 2px solid transparent;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: var(--q-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.current {
    border-color: var(--q-primary);
    background-color: rgba(var(--q-primary-rgb), 0.05);
  }
}

.collection-banner {
  width: 100%;
  height: 120px;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f5f5f5;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
