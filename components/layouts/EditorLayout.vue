<template>
  <div class="editor-layout p-6 min-h-screen bg-primaryBg">
    <!-- Preview Card (Top Right) - Desktop Only -->
    <slot name="preview-card" />
    
    <!-- Main Content Area -->
    <div class="editor-content relative">
      <slot name="main-content" />
     
      <slot />
    </div>
    
    <!-- Visualization Toggle (Mobile) -->
    <slot name="visualization-toggle" />
    
    <!-- Bottom Toolbar -->
    <slot name="bottom-toolbar" />
  </div>
</template>

<script setup>
// Layout wrapper for the editor

</script>

<style scoped>
.editor-layout {
  position: relative;
  min-height: 100vh;
}

.editor-content {
  position: relative;
}
</style>

