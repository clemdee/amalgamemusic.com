<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div
    ref="root"
    class="auto-scrolling-text"
    :class="{
      'animation': isAnimating,
      'animation-end': isAnimationEnd,
    }"
    :title="text"
    @mouseenter="isAnimating = true"
  >
    <div class="wrapper">
      <span ref="span">
        {{ props.text }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useElementSize } from '@vueuse/core';
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import { wait } from '~/composables/utils';

const props = defineProps<{
  text: string
}>();

const rootElement = useTemplateRef('root');
const spanElement = useTemplateRef('span');

const isAnimating = ref(false);
const isAnimationEnd = ref(false);

const { width } = useElementSize(() => rootElement.value);
const textWidth = ref(0);

watch([width, () => props.text], async () => {
  await nextTick();
  if (!rootElement.value) return;
  if (!spanElement.value) return;
  const spanWidth = spanElement.value.offsetWidth ?? 0;
  textWidth.value = spanWidth;
}, { immediate: true });

const scrollWidth = computed(() => {
  if (textWidth.value < width.value) {
    return 0;
  }
  else {
    return textWidth.value - width.value;
  }
});

onMounted(() => {
  if (!spanElement.value) return;
  spanElement.value.addEventListener('animationend', async () => {
    isAnimationEnd.value = true;
    await wait(2000);
    isAnimating.value = false;
    isAnimationEnd.value = false;
  });
});
</script>

<style lang="scss" scoped>
@keyframes --scroll {
  from {
    margin-left: 0%;
  }
  to {
    margin-left: calc(0px - var(--scroll-width) * 1px);
  }
}

.auto-scrolling-text {
  --scroll-width: v-bind('scrollWidth');
  --padding: 0.4rem;
  display: flex;
  overflow: hidden;
  width: 100%;

  .wrapper {
    text-overflow: clip ellipsis;
    overflow: hidden;
    text-wrap: nowrap;
    span {
      display: inline;
    }
  }

  &.animation {
    span {
      animation: --scroll 10s linear forwards;
    }
  }

  &.animation:not(.animation-end) {
    .wrapper {
      mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 var(--padding),
        #000 calc(100% - var(--padding)),
        transparent 100%
      );
    }
  }

  &.animation-end {
   .wrapper {
      text-overflow: ellipsis clip;
      mask-image: linear-gradient(
        to right,
        transparent 0,
        #000 var(--padding) 100%
      );
    }
  }
}
</style>
