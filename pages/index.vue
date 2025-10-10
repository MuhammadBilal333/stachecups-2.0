<template>
  <div class="landing-page">
    <div class="container mx-auto px-4 py-16 text-center">
      <h1 class="text-5xl font-bold mb-6 text-gray-900">
        Welcome to Stachecups
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Design your custom cup with our intuitive editor
      </p>
      <NuxtLink to="/customizer" class="btn-primary inline-block">
        Start Designing
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Landing page
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  max-width: 800px;
}

h1 {
  color: white;
}

p {
  color: rgba(255, 255, 255, 0.9);
}
</style>

