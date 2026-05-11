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
import type { Music } from '~/composables/music';
import { useElementSize } from '@vueuse/core';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { defaultCubeParams, getFaces } from '~/composables/cube';
import { clamp } from '~/composables/utils';

const props = defineProps<{
  music: Music | undefined
  rotation?: number
  shadow?: boolean
  float?: boolean
}>();

const SALT = 'amalgame';
const hash = computed(() => `${SALT}${props.music?.id ?? ''}`);

const params = defaultCubeParams;
const faces = computed(() => getFaces(hash.value, params));

const rootElement = useTemplateRef('root');
const { width } = useElementSize(() => rootElement.value);

const rotation = computed(() => props.rotation ?? 0);

const tiltX = ref(0);
const tiltY = ref(0);

onMounted(() => {
  if (!rootElement.value) return;

  let rafId = 0;

  // spring state
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;

  // "impulse" coming from mouse velocity
  let impulseX = 0;
  let impulseY = 0;

  const step = () => {
    // spring back to 0
    const stiffness = 0.06;
    const damping = 0.82;

    vx += (0 - x) * stiffness + impulseX;
    vy += (0 - y) * stiffness + impulseY;

    impulseX *= 0.6;
    impulseY *= 0.6;

    vx *= damping;
    vy *= damping;

    x += vx;
    y += vy;

    tiltX.value = x;
    tiltY.value = y;

    const sleeping
      = Math.abs(x) < 0.01
        && Math.abs(y) < 0.01
        && Math.abs(vx) < 0.01
        && Math.abs(vy) < 0.01
        && Math.abs(impulseX) < 0.01
        && Math.abs(impulseY) < 0.01;

    if (!sleeping) rafId = requestAnimationFrame(step);
    else rafId = 0;
  };

  const wake = () => {
    if (!rafId) rafId = requestAnimationFrame(step);
  };

  const mouseMove = (e: MouseEvent) => {
    const rect = rootElement.value!.getBoundingClientRect();

    // distance from cube center
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const dist = Math.hypot(dx, dy);
    const influenceRadius = rect.width * 1.2;

    if (dist > influenceRadius) return;

    // proximity factor (1 near cube, 0 far)
    const proximity = 1 - dist / influenceRadius;

    // mouse velocity = main driver of tilt
    const speedX = e.movementX;
    const speedY = e.movementY;

    const strength = 0.015 + proximity * 0.04;

    // rotation lock: when spinning, remove horizontal tilt
    const isRotating = Math.abs(rotation.value) > 0;
    const rotationFactor = isRotating ? 0.05 : 1;

    // IMPORTANT: same direction as mouse movement
    impulseY += speedX * strength * rotationFactor; // horizontal tilt
    impulseX -= speedY * strength; // vertical tilt always allowed

    // clamp max tilt
    x = clamp(x, -20, 20);
    y = clamp(y, -20, 20);

    wake();
  };

  document.addEventListener('mousemove', mouseMove);
});
</script>

<style lang="scss" scoped>
@keyframes spin {
  from { transform: rotateY(-45deg); }
  to { transform: rotateY(-405deg); }
}

@keyframes float {
  from { transform: translateY(10%); }
  to { transform: translateY(-10%); }
}
@keyframes float-shadow {
  from { filter: blur(calc(0.9 * var(--width) * 0.2px)); }
  50% { filter: blur(calc( var(--width) * 0.2px)); }
  to { filter: blur(calc(1.1 * var(--width) * 0.2px)); }
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
    margin-top: 10%;

    .wrapper {
      perspective: calc(10px * var(--_flatness));
      position: absolute;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
    }

    .float-wrapper {
      will-change: transform;
    }

    .spin-wrapper {
      --_rotation: calc(v-bind('rotation') * -25deg);
      transform: rotateY(-45deg);
      rotate: y var(--_rotation);
      transition: rotate 0.3s linear;
      will-change: transform;
    }

    .tilt-wrapper {
      transform:
        rotateX(calc(var(--tilt-x-value) * 1deg))
        rotateY(calc(var(--tilt-y-value) * 1deg));
      will-change: transform;
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

    &.float {
      .float-wrapper {
        animation: float 4s -2s infinite ease-in-out alternate-reverse;
      }

      .shadow-element {
        animation: float-shadow 4s -2s infinite ease-in-out alternate-reverse;
      }
    }
  }
}
</style>
