<template>
  <button
    :disabled="disabled"
    @click="handleClick"
    :class="[
      'flex items-center gap-2 w-full px-3.5 py-2.5 mb-2',
      'bg-gray-50 border border-gray-200 rounded-md',
      'text-sm text-gray-700 transition-all duration-200',
      'hover:bg-gray-100 hover:border-gray-300',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      buttonClass
    ]"
  >
    <span v-if="icon" class="text-xl">{{ icon }}</span>
    <slot></slot>
  </button>
</template>

<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  buttonClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (!props.disabled) {
    emit('click');
  }
};
</script>

