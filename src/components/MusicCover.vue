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
import { refAutoReset, useElementBounding, useEventListener } from '@vueuse/core';
import { computed, onMounted, onUnmounted, reactive, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { defaultCubeParams, getFaces } from '~/composables/cube';
import { createSharedRaf } from '~/composables/sharedRaf';
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
const rect = reactive(useElementBounding(rootElement));

const rotation = computed(() => props.rotation ?? 0);

const isRotating = refAutoReset(false, 500);
watch(rotation, () => {
  isRotating.value = true;
});

interface Tilt {
  // Actual tilt position
  x: number
  y: number
  // Spring state
  vx: number
  vy: number
  // Impulse coming from mouse velocity
  impulseX: number
  impulseY: number
}

const tilt = reactive<Tilt>({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  impulseX: 0,
  impulseY: 0,
});

const TILT = {
  influenceFactor: 0.6,
  stiffness: 0.06,
  damping: 0.82,
  impulseBase: 0.015,
  impulseFactor: 0.03,
  impulseDamping: 0.6,
  maxTilt: 20,
};

const isTilting = (tilt: Tilt) => {
  return Math.abs(tilt.x) > 0.01
    || Math.abs(tilt.y) > 0.01
    || Math.abs(tilt.vx) > 0.01
    || Math.abs(tilt.vy) > 0.01
    || Math.abs(tilt.impulseX) > 0.01
    || Math.abs(tilt.impulseY) > 0.01;
};

onMounted(() => {
  if (!rootElement.value) return;

  const animateTiltRaf = () => {
    tilt.vx += (-tilt.x) * TILT.stiffness + tilt.impulseX;
    tilt.vy += (-tilt.y) * TILT.stiffness + tilt.impulseY;

    tilt.impulseX *= TILT.impulseDamping;
    tilt.impulseY *= TILT.impulseDamping;

    tilt.vx *= TILT.damping;
    tilt.vy *= TILT.damping;

    tilt.x = clamp(tilt.x + tilt.vx, -TILT.maxTilt, TILT.maxTilt);
    tilt.y = clamp(tilt.y + tilt.vy, -TILT.maxTilt, TILT.maxTilt);

    if (!isTilting(tilt)) {
      raf.cancel(animateTiltRaf);
    }
  };

  const startTiltRaf = () => {
    raf.request(animateTiltRaf);
  };

  const watchHandler = watchEffect(() => {
    const cubeCenterX = rect.left + rect.width / 2;
    const cubeCenterY = rect.top + rect.height / 2;

    const distanceX = pointer.value.x - cubeCenterX;
    const distanceY = pointer.value.y - cubeCenterY;

    const distance = Math.hypot(distanceX, distanceY);
    const influenceRadius = rect.width * TILT.influenceFactor;

    if (distance > influenceRadius) return;

    // Proximity factor (1 near cube, 0 far)
    const proximity = 1 - (distance / influenceRadius);

    const dx = pointer.value.vx;
    const dy = pointer.value.vy;

    const strength = TILT.impulseBase + proximity * TILT.impulseFactor;

    // Remove horizontal tilt if rotating
    const rotationXFactor = isRotating.value ? 0.05 : 1;

    tilt.impulseX -= dy * strength;
    tilt.impulseY += dx * strength * rotationXFactor;

    startTiltRaf();
  });

  useEventListener(
    rootElement,
    'contentvisibilityautostatechange',
    (event: ContentVisibilityAutoStateChangeEvent) => {
      if (event.skipped) {
        watchHandler.pause();
        raf.cancel(animateTiltRaf);
      }
      else {
        watchHandler.resume();
      }
    },
  );

  onUnmounted(() => {
    watchHandler.stop();
  });
});
</script>

<script lang="ts">
export interface GlobalPointer {
  x: number
  y: number
  vx: number
  vy: number
}

export const pointer = ref<GlobalPointer>({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
});

let lastX = 0;
let lastY = 0;
let lastScrollX = window.scrollX;
let lastScrollY = window.scrollY;
const raw = { x: 0, y: 0 };

const raf = createSharedRaf({ fpsLimit: 60 });

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  document.addEventListener('pointermove', (e) => {
    raw.x = e.clientX;
    raw.y = e.clientY;
  }, { passive: true });

  // Compute pointer every frame
  let scrollingElement: Element | null;
  raf.request(() => {
    if (!scrollingElement) {
      scrollingElement = document.querySelector('#main');
      if (!scrollingElement) return;
    }
    const scrollDX = scrollingElement.scrollLeft - lastScrollX;
    const scrollDY = scrollingElement.scrollTop - lastScrollY;

    const vx = (raw.x - lastX) + scrollDX;
    const vy = (raw.y - lastY) + scrollDY;

    pointer.value = {
      x: raw.x,
      y: raw.y,
      vx,
      vy,
    };

    lastX = raw.x;
    lastY = raw.y;
    lastScrollX = scrollingElement.scrollLeft;
    lastScrollY = scrollingElement.scrollTop;
  });
}
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
  --width: v-bind('rect.width');
  --tilt-x: v-bind('tilt.x');
  --tilt-y: v-bind('tilt.y');
  // filter: blur(0.01rem);

  display: grid;
  place-items: flex-start center;
  aspect-ratio: 1;
  width: 100%;

  .music-cover-image {
    position: relative;
    width: 70%;
    margin-top: 10%;
    contain: layout size;

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
        rotateX(calc(var(--tilt-x) * 1deg))
        rotateY(calc(var(--tilt-y) * 1deg));
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
      --shadow-tilt-x: var(--tilt-x);

      .tilt-wrapper {
        --tilt-x: clamp(
          -5,
          calc(var(--shadow-tilt-x) * 0.1),
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
