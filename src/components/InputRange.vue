<template>
  <div
    class="range"
    :class="{
      disabled: props.disabled,
    }"
    @pointerdown="pointerDownHandler"
    @pointermove="pointerMoveHandler"
  >
    <div class="track">
      <div class="current" />
      <div
        class="thumb"
        tabindex="0"
        @keydown.left="setTime(modelValue - step)"
        @keydown.down="setTime(modelValue - step)"
        @keydown.right="setTime(modelValue + step)"
        @keydown.up="setTime(modelValue + step)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { clamp } from '~/composables/utils';

const props = defineProps<{
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}>();

const modelValue = defineModel<number>({
  required: true,
});

const min = computed(() => Math.min(props.min ?? 0, props.max ?? 1));
const max = computed(() => Math.max(props.min ?? 0, props.max ?? 1));
const step = computed(() => props.step ?? (max.value - min.value) / 10);

const modelValuePercentage = computed({
  get () {
    return (modelValue.value - min.value) / (max.value - min.value);
  },
  set (valuePercentage) {
    modelValue.value = valuePercentage * (max.value - min.value) + min.value;
  },
});

const setTime = (value: number) => {
  modelValue.value = clamp(value, min.value, max.value);
};

const setTimeFromTrack = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const start = target.getBoundingClientRect().x;
  const end = start + target.clientWidth;
  const x = event.clientX;
  const percentage = (x - start) / (end - start);
  modelValuePercentage.value = percentage;
};

const isPointerDown = ref(false);

const pointerDownHandler = (event: MouseEvent) => {
  isPointerDown.value = true;
  setTimeFromTrack(event);
};

const pointerMoveHandler = (event: MouseEvent) => {
  if (!isPointerDown.value) return;
  setTimeFromTrack(event);
};

document.addEventListener('pointerup', () => {
  isPointerDown.value = false;
});
</script>

<style lang="scss" scoped>
.range {
  --percentage: v-bind('modelValuePercentage');
  position: relative;
  display: inline-grid;
  place-items: center;
  block-size: 2rem;
  inline-size: 100%;
  user-select: none;
  cursor: pointer;

  .track {
    --block-size: 0.3rem;
    position: relative;
    block-size: var(--block-size);
    inline-size: 100%;
    border-radius: 1rem;
    background-color: #446;
    transition: all linear 200ms;

    .current {
      position: absolute;
      inset-block: 0rem;
      inset-inline-start: 0rem;
      inline-size: calc(100% * var(--percentage));
      border-radius: inherit;
      background-color: var(--accent-color);
      transition: all linear 50ms;
    }

    .thumb {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-start: calc(100% * var(--percentage));
      translate: -50% -50%;
      aspect-ratio: 1;
      block-size: var(--block-size);
      border: 0rem solid black;
      border-radius: 100%;
      background-color: var(--accent-color);
      transition: all linear 50ms;
      outline-offset: 0.2rem;
    }
  }

  &.disabled {
    .range {
      cursor: default;

      .thumb {
        display: none;
      }
    }
  }

  &:not(.disabled):is(:hover, :focus-within) {
    .track {
      block-size: 0.5rem;
    }

    .thumb {
      block-size: 0.9rem;
      border: 0.05rem solid #888;
      background-color: #fff;
      transition: all linear 100ms;
      cursor: grab;
    }
  }
}
</style>
