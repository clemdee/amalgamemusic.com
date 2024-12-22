<template>
  <button
    :disabled="props.disabled"
    class="play-button"
  >
    <iconify-icon
      v-if="props.loading"
      icon="svg-spinners:ring-resize"
      title="loading"
    />
    <iconify-icon
      v-else-if="props.playing"
      icon="line-md:pause"
      title="pause"
    />
    <iconify-icon
      v-else
      icon="line-md:play"
      title="play"
    />
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  playing: boolean
  loading?: boolean
  disabled?: boolean
}>();
</script>

<style lang="scss" scoped>
.play-button {
  --size: 4rem;
  width: var(--size);
  height: var(--size);
  border-radius: 1rem;
  background-color: #0007;
  box-shadow: 0 0.3rem 0.5rem #0002;

  iconify-icon {
    font-size: 2rem;
  }
}
</style>
