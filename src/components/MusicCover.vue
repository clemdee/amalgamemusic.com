<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div
    ref="root"
    class="music-cover"
  >
    <div
      v-if="props.music"
      class="music-cover-image"
      :class="{
        rotate: props.rotate,
        float: props.float,
      }"
    >
      <div class="wrap">
        <div class="cube">
          <div class="float-wrapper">
            <svg
              v-for="face in faces"
              :key="face.name"
              :class="face.name"
              viewBox="0 0 2 2"
            >
              <template v-for="y in 2" :key="y">
                <template v-for="x in 2" :key="x">
                  <path
                    :d="`M ${x - 1}, ${y - 1} l 0, 1 l 1 0 Z`"
                    :fill="face.colors[(y - 1) * 4 + (x - 1) * 2]"
                    stroke="none"
                  />
                  <path
                    :d="`M ${x}, ${y} l 0, -1 l -1 0 Z`"
                    :fill="face.colors[(y - 1) * 4 + (x - 1) * 2 + 1]"
                    stroke="none"
                  />
                </template>
              </template>
            </svg>
          </div>
        </div>

        <div class="shadow" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useElementSize } from '@vueuse/core';
import { computed, useTemplateRef } from 'vue';
import { defaultCubeParams, getFaces } from '~/composables/cube';
import type { Music } from '~/composables/music';

const props = defineProps<{
  music: Music | undefined
  rotate?: boolean
  shadow?: boolean
  float?: boolean
}>();

const SALT = 'amalgame';
const hash = computed(() => `${SALT}${props.music?.id ?? ''}`);

const params = defaultCubeParams;
const faces = computed(() => getFaces(hash.value, params));

const rootElement = useTemplateRef('root');
const { width } = useElementSize(() => rootElement.value);
</script>

<style lang="scss" scoped>
@keyframes spin {
  from { transform: rotateY(-45deg); }
  to { transform: rotateY(-405deg); }
}

@keyframes float {
  from { transform: translateY(30%); }
  to { transform: translateY(-30%); }
}
@keyframes float-shadow {
  from { filter: blur(calc(0.4 * var(--width) * 0.2px)); }
  50% { filter: blur(calc( var(--width) * 0.2px)); }
  to { filter: blur(calc(1.5 * var(--width) * 0.2px)); }
}

.music-cover {
  --width: v-bind('width');
  // filter: blur(0.01rem);

  display: grid;
  place-items: center;
  aspect-ratio: 1;
  width: 100%;

  .music-cover-image {
    width: 70%;

    .wrap {
      // 10^6 seems the max before visual glitches
      --_flatness: pow(10, 6);
      --x-rotation: -24deg;

      perspective: calc(10px * var(--_flatness));

      .cube {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        transform-style: preserve-3d;
        transform: rotateY(-45deg);
        transform-origin: center;
        pointer-events: none;
        rotate: x var(--x-rotation);

        .float-wrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        svg {
          position: absolute;
          width: 100%;
          height: 100%;
          aspect-ratio: 1;
          backface-visibility: hidden;
          opacity: 1;
        }

        .front {
          transform: rotateX(90deg) translateY(50%) rotateX(-90deg) rotateZ(-90deg);
        }
        .back {
          transform: rotateY(90deg)  translateX(50%) rotateY(90deg) rotateZ(-90deg);
        }
        .left {
          transform: translateX(-50%) rotateY(-90deg) rotateZ(180deg);
        }
        .right {
          transform: translateX(50%) rotateY(90deg) ;
        }
        .top {
          transform: translateY(-50%) rotateX(90deg);
        }
        .bottom {
          transform: translateY(50%) rotateX(-90deg);
        }
      }

      .shadow {
        position: absolute;
        width: 100%;
        aspect-ratio: 1;
        transform-style: preserve-3d;
        transform: rotateY(-45deg);
        transform-origin: center;
        pointer-events: none;
        z-index: -1;
        rotate: x var(--x-rotation);

        &::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          aspect-ratio: 1;
          backface-visibility: visible;
          opacity: 1;
          background-color: gray;
          transform: translateY(25%) rotateX(90deg);
          filter: blur(calc(var(--width) * 0.2px));
        }
      }
    }

    &.rotate {
      .cube, .shadow {
        animation: spin 15s infinite linear;
      }
    }

    &.float {
      .float-wrapper {
        animation: float 4s -2s infinite ease-in-out alternate-reverse;
      }

      .shadow::before {
        animation: float-shadow 4s -2s infinite ease-in-out alternate-reverse;
      }
    }
  }
}
</style>
