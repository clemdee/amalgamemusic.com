<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="music-cover">
    <div
      ref="image"
      class="image"
      :class="{ shadow }"
    />
  </div>
</template>

<script lang="ts" setup>
import { useElementSize } from '@vueuse/core';
import { computed, useTemplateRef } from 'vue';

const props = defineProps<{
  url: string
  shadow?: boolean
}>();

const url = computed(() => `url(${props.url})`);
const shadow = computed(() => props.shadow);

const imageElement = useTemplateRef('image');
const { height } = useElementSize(() => imageElement.value);
</script>

<style lang="scss" scoped>
.music-cover {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  width: 100%;

  .image {
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    background-image: v-bind('url');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;

    &.shadow {
      --height: v-bind('height');

      filter: drop-shadow(
        calc(var(--height) * 0.015px)
        calc(var(--height) * 0.2px)
        calc(var(--height) * 0.08px)
        #fff4
      );
    }
  }
}
</style>
