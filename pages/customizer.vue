<template>
  <EditorLayout>
    <!-- Main content slot -->
    <template #main-content>
      <ImageEditor />
    </template>
  </EditorLayout>
</template>

<script setup lang="ts">
import ImageEditor from '~/components/editor/ImageEditor.vue'
import EditorLayout from '~/components/layouts/EditorLayout.vue'
import 'quill/dist/quill.snow.css'

</script>
