<template>
  <div class="music-cover">
    <div
      class="image"
      :class="{ shadow }"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  url: string
  shadow?: boolean
}>();

const url = computed(() => `url(${props.url})`);
const shadow = computed(() => props.shadow);
</script>

<style lang="scss" scoped>
.music-cover {
  display: grid;
  place-items: center;
  aspect-ratio: 1;

  .image {
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    background-image: v-bind('url');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;

    &.shadow {
      filter: drop-shadow(0.05rem 1rem 0.4rem #fff4);
    }
  }
}
</style>
