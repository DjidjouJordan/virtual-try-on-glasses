<script setup lang="ts">
const colorMode = useColorMode()

const logo = computed(() => {
  return colorMode.value === 'dark'
    ? '/logo-dpglasses-light.png'
    : '/logo-dpglasses-dark.png'
})
</script>

<template>
  <img
    :src="logo"
    alt="DPGlasses"
    class="h-20 w-auto"
  >
</template>
