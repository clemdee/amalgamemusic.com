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
import { useElementBounding, usePreferredReducedMotion } from '@vueuse/core';
import { computed, onMounted, onUnmounted, reactive, useTemplateRef } from 'vue';
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
const rect = reactive(useElementBounding(rootElement));

const rotation = computed(() => props.rotation ?? 0);

const preferredMotion = usePreferredReducedMotion();

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

  let rafId: number | undefined;

  const animateTiltRaf = () => {
    tilt.vx += (-tilt.x) * TILT.stiffness + tilt.impulseX;
    tilt.vy += (-tilt.y) * TILT.stiffness + tilt.impulseY;

    tilt.impulseX *= TILT.impulseDamping;
    tilt.impulseY *= TILT.impulseDamping;

    tilt.vx *= TILT.damping;
    tilt.vy *= TILT.damping;

    tilt.x = clamp(tilt.x + tilt.vx, -TILT.maxTilt, TILT.maxTilt);
    tilt.y = clamp(tilt.y + tilt.vy, -TILT.maxTilt, TILT.maxTilt);

    if (isTilting(tilt)) {
      rafId = requestAnimationFrame(animateTiltRaf);
    }
    else {
      rafId = undefined;
    }
  };

  const startTiltRaf = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(animateTiltRaf);
  };

  const mouseMove = (e: MouseEvent) => {
    if (preferredMotion.value === 'reduce') return;

    const cubeCenterX = rect.left + rect.width / 2;
    const cubeCenterY = rect.top + rect.height / 2;

    const distanceX = e.clientX - cubeCenterX;
    const distanceY = e.clientY - cubeCenterY;

    const distance = Math.hypot(distanceX, distanceY);
    const influenceRadius = rect.width * TILT.influenceFactor;

    if (distance > influenceRadius) return;

    // Proximity factor (1 near cube, 0 far)
    const proximity = 1 - (distance / influenceRadius);

    const dx = e.movementX;
    const dy = e.movementY;

    const strength = TILT.impulseBase + proximity * TILT.impulseFactor;

    // Remove horizontal tilt if rotating
    const isRotating = Math.abs(rotation.value) > 0;
    const rotationXFactor = isRotating ? 0.05 : 1;

    tilt.impulseX -= dy * strength;
    tilt.impulseY += dx * strength * rotationXFactor;

    startTiltRaf();
  };

  onUnmounted(() => {
    document.removeEventListener('mousemove', mouseMove);
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  });

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
