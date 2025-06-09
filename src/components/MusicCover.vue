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
      <div class="wrapper">
        <div class="cube">
          <div class="float-wrapper wrapper">
            <div class="tilt-wrapper wrapper">
              <div class="spin-wrapper wrapper">
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
          </div>
        </div>

        <div class="shadow">
          <div class="tilt-wrapper wrapper">
            <div class="spin-wrapper wrapper">
              <div class="shadow-element" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useElementSize } from '@vueuse/core';
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';
import { defaultCubeParams, getFaces } from '~/composables/cube';
import type { Music } from '~/composables/music';
import { clamp } from '~/composables/utils';

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
const tiltVX = ref(0);
const tiltVY = ref(0);
const tiltX = ref(0);
const tiltY = ref(0);

onMounted(() => {
  if (!rootElement.value) return;

  let animationFrameId: ReturnType<typeof requestAnimationFrame>;

  const animateTilt = () => {
    tiltX.value += Math.sign(tiltVX.value) * Math.abs(tiltVX.value) ** 1.8 / 40;
    tiltY.value += Math.sign(tiltVY.value) * Math.abs(tiltVY.value) ** 1.8 / 40;
    tiltVX.value -= Math.sign(tiltVX.value);
    tiltVY.value -= Math.sign(tiltVY.value);
    if (tiltVX.value === 0 && tiltVY.value === 0) return;

    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(animateTilt);
  };

  rootElement.value.addEventListener('mousemove', (event) => {
    tiltVX.value = clamp(-event.movementY, -30, 30);
    tiltVY.value = clamp(event.movementX, -30, 30);
    animateTilt();
  });

  rootElement.value.addEventListener('mouseleave', async () => {
    await nextTick();
    tiltVX.value = 0;
    tiltVY.value = 0;
    tiltX.value = 0;
    tiltY.value = 0;
  });
});
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
  // 10^6 seems the max before visual glitches
  --_flatness: pow(10, 6);
  --width: v-bind('width');
  --tilt-x-value: v-bind('tiltX');
  --tilt-y-value: v-bind('tiltY');
  // filter: blur(0.01rem);

  display: grid;
  place-items: flex-start center;
  aspect-ratio: 1;
  width: 100%;

  .music-cover-image {

    position: relative;
    width: 70%;

    .wrapper {
      perspective: calc(10px * var(--_flatness));
      position: absolute;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
    }

    .float-wrapper {
    }

    .spin-wrapper {
      transform: rotateY(-45deg);
    }

    .tilt-wrapper {
      transform: rotate3d(0, 0, 0, 0deg);
      transition: all 200ms;
      transition-timing-function: cubic-bezier(1,1.43,.58,1.44);
    }

    .cube {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      pointer-events: none;

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
        transform: scaleY(-1) rotateY(90deg)  translateX(50%) rotateY(90deg) rotateZ(-90deg);
      }
      .left {
        transform: scaleZ(-1) translateX(-50%) rotateY(-90deg) rotateZ(180deg);
      }
      .right {
        transform: translateX(50%) rotateY(90deg) ;
      }
      .top {
        transform: translateY(-50%) rotateX(90deg);
      }
      .bottom {
        transform: scaleX(-1) translateY(50%) rotateX(-90deg) ;
      }
    }

    .shadow {
      position: absolute;
      width: 100%;
      aspect-ratio: 1;
      pointer-events: none;
      z-index: -1;
      --shadow-tilt-x-value: var(--tilt-x-value);

      .tilt-wrapper {
        --tilt-x-value: clamp(
          -5,
          calc(var(--shadow-tilt-x-value) * 0.1),
          5
        );
      }

      .shadow-element {
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

    .cube,
    .shadow {
      transform-style: preserve-3d;
      transform-origin: center;
      rotate: x -24deg;
    }

    &.rotate {
      .spin-wrapper {
        animation: spin 15s infinite linear;
      }
    }

    &.float {
      .float-wrapper {
        animation: float 4s -2s infinite ease-in-out alternate-reverse;
      }

      .shadow-element {
        animation: float-shadow 4s -2s infinite ease-in-out alternate-reverse;
      }
    }
  }

  &:hover {
    .tilt-wrapper {
      transition-duration: calc(100ms - 1ms * clamp(
        -100,
        max(abs(var(--tilt-x-value)), abs(var(--tilt-y-value))),
        100
      ));

      transform: rotate3d(
        var(--tilt-x-value),
        var(--tilt-y-value),
        0,
        clamp(
          -80deg,
          calc(1deg * max(abs(var(--tilt-x-value)), abs(var(--tilt-y-value)))),
          80deg
        )
      );
    }
  }
}
</style>
